import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  AVATAR_OPTIONS,
  InventoryItem,
  MapInteractableProp,
  OX_SURVIVAL_QUESTIONS,
  PuzzleHotspot,
  RoomStageInfo,
} from '../data/escapeData';
import { PlayerInfo } from './FacilityMap';
import {
  Sparkles,
  Lock,
  CheckCircle2,
  Heart,
  Timer,
  Flame,
  Gamepad2,
  DoorOpen,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Search,
  AlertTriangle,
  Flashlight,
} from 'lucide-react';

const GRID_COLS = 15;
const GRID_ROWS = 10;

interface ZepTopDownRoomProps {
  stage: RoomStageInfo;
  myNickname: string;
  myAvatarId: string;
  solvedPuzzles: string[];
  unlockedStages: number[];
  selectedItem: InventoryItem | null;
  playersInRoom: PlayerInfo[];
  isModalOpen: boolean;
  celebrationTrigger: number;
  shakeTrigger: number;
  onOpenPuzzle: (puzzle: PuzzleHotspot, usedItemName?: string | null) => void;
  onDiscoverClueNote: (prop: MapInteractableProp) => void;
  onTriggerTrap: (prop: MapInteractableProp) => void;
  onEnterNextStagePortal: (nextStageNum: number) => void;
}

export const ZepTopDownRoom: React.FC<ZepTopDownRoomProps> = ({
  stage,
  myNickname,
  myAvatarId,
  solvedPuzzles,
  unlockedStages,
  selectedItem,
  playersInRoom,
  isModalOpen,
  celebrationTrigger,
  shakeTrigger,
  onOpenPuzzle,
  onDiscoverClueNote,
  onTriggerTrap,
  onEnterNextStagePortal,
}) => {
  // Player Grid Coordinates
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: stage.spawnX, y: stage.spawnY });
  const [facing, setFacing] = useState<'down' | 'up' | 'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState<boolean>(false);

  // Flashlight toggle (optional atmospheric mode)
  const [darkModeOn, setDarkModeOn] = useState<boolean>(false);

  // Local Visual Effects (Head Floating Text & Screen Shake)
  const [headEffect, setHeadEffect] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [hudNotice, setHudNotice] = useState<{ type: 'clue' | 'trap' | 'locked' | 'ox'; title: string; body: string } | null>(
    null
  );

  // ZEP O/X Quiz Survival Sub-Mode State
  const [gameMode, setGameMode] = useState<'escape' | 'ox_survival'>('escape');
  const [oxHearts, setOxHearts] = useState<number>(3);
  const [oxQuestionIdx, setOxQuestionIdx] = useState<number>(0);
  const [oxTimeLeft, setOxTimeLeft] = useState<number>(10);
  const [oxRoundState, setOxRoundState] = useState<'idle' | 'counting' | 'result'>('idle');
  const [oxResultMessage, setOxResultMessage] = useState<string | null>(null);

  // Reset player position when switching stage
  useEffect(() => {
    setPos({ x: stage.spawnX, y: stage.spawnY });
    setFacing('right');
    setHudNotice(null);
  }, [stage.stageNum, stage.spawnX, stage.spawnY]);

  // Trigger character head celebration when a puzzle is solved
  useEffect(() => {
    if (celebrationTrigger > 0) {
      setHeadEffect('🎉 암호 해독 성공! +100');
      const t = setTimeout(() => setHeadEffect(null), 2200);
      return () => clearTimeout(t);
    }
  }, [celebrationTrigger]);

  // Trigger screen shake when wrong answer or trap occurs
  useEffect(() => {
    if (shakeTrigger > 0) {
      setIsShaking(false);
      const t1 = setTimeout(() => setIsShaking(true), 10);
      const t2 = setTimeout(() => setIsShaking(false), 520);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [shakeTrigger]);

  const myAvatarEmoji = useMemo(() => {
    return AVATAR_OPTIONS.find((a) => a.id === myAvatarId)?.emoji || '🐼';
  }, [myAvatarId]);

  // Check if all puzzles in this stage are solved -> Portal is open!
  const remainingStagePuzzles = useMemo(() => {
    return stage.puzzles.filter((p) => !solvedPuzzles.includes(p.id)).length;
  }, [stage.puzzles, solvedPuzzles]);

  const isPortalOpen = remainingStagePuzzles === 0;

  // Collision Detection Helper
  const isBlockedTile = useCallback(
    (tx: number, ty: number): boolean => {
      // Outer walls (row 0, row 9, col 0, col 14) except portal tile at (stage.portalX, stage.portalY)
      if (tx < 1 || tx >= GRID_COLS - 1 || ty < 1 || ty >= GRID_ROWS - 1) {
        if (tx === stage.portalX && ty === stage.portalY) return false;
        return true;
      }

      if (gameMode === 'ox_survival') {
        // In OX mode, keep the arena floor open so players can freely run between O (left) and X (right)
        return false;
      }

      // Check puzzle furniture tiles
      for (const p of stage.puzzles) {
        if (p.gridX === tx && p.gridY === ty) return true;
      }

      // Check solid prop tiles (bookshelves, traps, plants, beds)
      for (const prop of stage.props) {
        if (prop.solid && prop.gridX === tx && prop.gridY === ty) return true;
      }

      return false;
    },
    [stage, gameMode]
  );

  // Find nearest interactable object within 1 tile (Chebyshev distance <= 1)
  const nearbyTarget = useMemo(() => {
    if (gameMode === 'ox_survival') return null;

    // 1. Check Puzzles
    for (const p of stage.puzzles) {
      const dist = Math.max(Math.abs(pos.x - p.gridX), Math.abs(pos.y - p.gridY));
      if (dist <= 1) {
        return { type: 'puzzle' as const, puzzle: p };
      }
    }

    // 2. Check Props (Clue notes & Traps)
    for (const prop of stage.props) {
      if (prop.kind === 'decor') continue;
      const dist = Math.max(Math.abs(pos.x - prop.gridX), Math.abs(pos.y - prop.gridY));
      if (dist <= 1) {
        return { type: 'prop' as const, prop };
      }
    }

    // 3. Check Exit Portal Door
    const portalDist = Math.max(Math.abs(pos.x - stage.portalX), Math.abs(pos.y - stage.portalY));
    if (portalDist <= 1) {
      return { type: 'portal' as const };
    }

    return null;
  }, [pos, stage, gameMode]);

  // Execute Interaction with nearby object ([Space / F] or button click)
  const handleInteract = useCallback(() => {
    if (!nearbyTarget) return;

    if (nearbyTarget.type === 'puzzle') {
      const puzzle = nearbyTarget.puzzle;
      const isAlreadySolved = solvedPuzzles.includes(puzzle.id);

      // Check required inventory item lock
      if (puzzle.requiredItemId && !isAlreadySolved) {
        const hasItemUnlocked = solvedPuzzles.some(
          (pid) => stage.puzzles.find((sp) => sp.id === pid)?.rewardItem.id === puzzle.requiredItemId
        );
        const isEquipped = selectedItem?.id === puzzle.requiredItemId;

        if (!hasItemUnlocked || !isEquipped) {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
          setHudNotice({
            type: 'locked',
            title: `🔒 [${puzzle.objectName}] 잠김! (${puzzle.requiredItemName} 필요)`,
            body:
              puzzle.lockedHintMessage ||
              `먼저 앞선 가구에서 [${puzzle.requiredItemName}] 아이템을 찾은 뒤, 하단 인벤토리에서 클릭해 장착한 상태로 조사하세요!`,
          });
          return;
        }

        setHudNotice(null);
        onOpenPuzzle(puzzle, selectedItem.name);
        return;
      }

      setHudNotice(null);
      onOpenPuzzle(puzzle, null);
      return;
    }

    if (nearbyTarget.type === 'prop') {
      const prop = nearbyTarget.prop;
      if (prop.kind === 'clue_note') {
        setHeadEffect('📝 힌트 쪽지 발견!');
        setTimeout(() => setHeadEffect(null), 1800);
        setHudNotice({
          type: 'clue',
          title: prop.clueTitle || `📝 ${prop.name}`,
          body: prop.clueBody || '',
        });
        onDiscoverClueNote(prop);
      } else if (prop.kind === 'trap') {
        setHeadEffect('💥 함정 발동!');
        setTimeout(() => setHeadEffect(null), 1800);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 520);
        setHudNotice({
          type: 'trap',
          title: `💥 가짜 함정 발동! [${prop.name}]`,
          body: prop.trapMessage || '앗! 함정 상자입니다!',
        });
        onTriggerTrap(prop);
      }
      return;
    }

    if (nearbyTarget.type === 'portal') {
      if (isPortalOpen) {
        if (stage.stageNum < 5) {
          onEnterNextStagePortal(stage.stageNum + 1);
        } else {
          setHudNotice({
            type: 'clue',
            title: '🐼 최종 탈출 성공!',
            body: '제5방의 모든 잠금장치를 해제하여 아기 판다 바오바오를 자연으로 돌려보냈습니다!',
          });
        }
      } else {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setHudNotice({
          type: 'locked',
          title: `🚪 포털 문이 잠겨 있습니다! (남은 문제: ${remainingStagePuzzles}개)`,
          body: '이 방의 퀴즈 오브젝트 3개를 모두 해결해야 다음 방으로 가는 포털 문이 열립니다!',
        });
      }
    }
  }, [
    nearbyTarget,
    solvedPuzzles,
    stage,
    selectedItem,
    isPortalOpen,
    remainingStagePuzzles,
    onOpenPuzzle,
    onDiscoverClueNote,
    onTriggerTrap,
    onEnterNextStagePortal,
  ]);

  // Move Character by (dx, dy)
  const movePlayer = useCallback(
    (dx: number, dy: number, dir: 'up' | 'down' | 'left' | 'right') => {
      setFacing(dir);
      setIsWalking(true);
      setTimeout(() => setIsWalking(false), 160);

      setPos((prev) => {
        const nx = prev.x + dx;
        const ny = prev.y + dy;
        if (isBlockedTile(nx, ny)) {
          return prev;
        }
        // Check if stepping directly onto open portal tile!
        if (
          gameMode === 'escape' &&
          nx === stage.portalX &&
          ny === stage.portalY &&
          isPortalOpen &&
          stage.stageNum < 5
        ) {
          setTimeout(() => onEnterNextStagePortal(stage.stageNum + 1), 180);
        }
        return { x: nx, y: ny };
      });
    },
    [isBlockedTile, gameMode, stage, isPortalOpen, onEnterNextStagePortal]
  );

  // Keyboard Controls (WASD + Arrow Keys + Space/F) with strict e.preventDefault() to prevent browser scroll!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside an input/textarea or if quiz modal is open
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || isModalOpen) return;

      const key = e.key.toLowerCase();
      if (
        key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'arrowleft' ||
        key === 'arrowright' ||
        key === 'w' ||
        key === 'a' ||
        key === 's' ||
        key === 'd' ||
        key === ' ' ||
        key === 'f' ||
        key === 'enter'
      ) {
        e.preventDefault();
      }

      if (key === 'arrowup' || key === 'w') {
        movePlayer(0, -1, 'up');
      } else if (key === 'arrowdown' || key === 's') {
        movePlayer(0, 1, 'down');
      } else if (key === 'arrowleft' || key === 'a') {
        movePlayer(-1, 0, 'left');
      } else if (key === 'arrowright' || key === 'd') {
        movePlayer(1, 0, 'right');
      } else if (key === ' ' || key === 'f' || key === 'enter') {
        handleInteract();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, handleInteract, isModalOpen]);

  // O/X Quiz Survival 10-Second Countdown Timer Logic
  const currentOxQuiz = OX_SURVIVAL_QUESTIONS[oxQuestionIdx % OX_SURVIVAL_QUESTIONS.length];

  useEffect(() => {
    if (gameMode !== 'ox_survival' || oxRoundState !== 'counting') return;

    if (oxTimeLeft <= 0) {
      // Evaluate player's standing zone! Left half (x <= 6) = 'O', Right half (x >= 8) = 'X'
      const playerZone: 'O' | 'X' | 'MID' = pos.x <= 6 ? 'O' : pos.x >= 8 ? 'X' : 'MID';
      setOxRoundState('result');

      if (playerZone === currentOxQuiz.answer) {
        setHeadEffect('⭕ O/X 서바이벌 정답!!');
        confetti({ particleCount: 55, spread: 60, origin: { y: 0.6 } });
        setOxResultMessage(`🎉 정답입니다! (${playerZone} 구역 생존 성공!) — ${currentOxQuiz.explanation}`);
      } else {
        setHeadEffect('💔 오답 구역! 하트 -1');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 550);
        setOxHearts((h) => Math.max(0, h - 1));
        setOxResultMessage(
          `💥 아쉬워요! 정답은 [${currentOxQuiz.answer} 구역]입니다! (현재 위치: ${
            playerZone === 'MID' ? '중앙 중립선' : playerZone + ' 구역'
          }) — ${currentOxQuiz.explanation}`
        );
      }
      return;
    }

    const timer = setTimeout(() => {
      setOxTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameMode, oxRoundState, oxTimeLeft, pos.x, currentOxQuiz]);

  const startOxRound = () => {
    setOxResultMessage(null);
    setOxTimeLeft(10);
    setOxRoundState('counting');
  };

  const nextOxQuestion = () => {
    if (oxHearts <= 0) {
      setOxHearts(3);
    }
    setOxQuestionIdx((i) => (i + 1) % OX_SURVIVAL_QUESTIONS.length);
    setOxResultMessage(null);
    setOxTimeLeft(10);
    setOxRoundState('counting');
  };

  return (
    <div
      className={`rounded-3xl border-2 border-emerald-500/40 bg-slate-900/95 shadow-2xl overflow-hidden transition-transform ${
        isShaking ? 'animate-zep-shake border-rose-500' : ''
      }`}
    >
      {/* Top Mode Switcher & Stage Sub-header */}
      <div className="px-4 sm:px-5 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs">
            ZEP 2D 탑뷰
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>{stage.name}</span>
              <span className="text-xs font-bold text-amber-300">({stage.chineseTitle})</span>
            </h2>
            <p className="text-[11px] text-slate-400">{stage.roomSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switch: Room Escape vs O/X Survival */}
          <button
            type="button"
            onClick={() => {
              setGameMode('escape');
              setOxRoundState('idle');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border flex items-center gap-1.5 transition cursor-pointer ${
              gameMode === 'escape'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>방탈출 어드벤처 모드</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGameMode('ox_survival');
              setPos({ x: 7, y: 5 });
              setOxHearts(3);
              setOxRoundState('idle');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border flex items-center gap-1.5 transition cursor-pointer ${
              gameMode === 'ox_survival'
                ? 'bg-gradient-to-r from-blue-500 to-rose-500 text-white border-white/40 shadow-md'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>⭕❌ O/X 퀴즈 서바이벌</span>
          </button>

          {gameMode === 'escape' && (
            <button
              type="button"
              onClick={() => setDarkModeOn((d) => !d)}
              title="손전등 암전 효과 켜기/끄기"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 transition cursor-pointer ${
                darkModeOn
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Flashlight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{darkModeOn ? '손전등 ON' : '손전등 OFF'}</span>
            </button>
          )}
        </div>
      </div>

      {/* If O/X Survival Mode is active: Top Question & 10s Countdown Banner */}
      {gameMode === 'ox_survival' && (
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-300 mr-1">생존 하트:</span>
              {[1, 2, 3].map((h) => (
                <Heart
                  key={h}
                  className={`w-5 h-5 ${
                    h <= oxHearts ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono font-black text-sm">
                <Timer className="w-4 h-4" />
                <span>{oxTimeLeft}초</span>
              </span>

              {oxRoundState === 'idle' && (
                <button
                  type="button"
                  onClick={startOxRound}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer"
                >
                  10초 카운트다운 시작!
                </button>
              )}

              {oxRoundState === 'result' && (
                <button
                  type="button"
                  onClick={nextOxQuestion}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
                >
                  다음 O/X 문제 도전 →
                </button>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700 text-center space-y-1">
            <div className="text-[11px] font-bold text-emerald-400">{currentOxQuiz.lesson}</div>
            <div className="text-sm sm:text-base font-extrabold text-white">
              Q. {currentOxQuiz.statement}
            </div>
            <div className="text-xs text-slate-400">
              💡 힌트: {currentOxQuiz.subHint} — <strong>파란색(왼쪽 O 구역)</strong> 또는{' '}
              <strong>빨간색(오른쪽 X 구역)</strong>으로 캐릭터를 이동하세요!
            </div>
          </div>

          {oxResultMessage && (
            <div className="p-3 rounded-xl bg-slate-800 border border-amber-400/50 text-xs sm:text-sm font-bold text-amber-200 text-center">
              {oxResultMessage}
            </div>
          )}
        </div>
      )}

      {/* Notice Modal Toast for Clue Notes / Traps / Locked Doors */}
      {hudNotice && (
        <div
          className={`px-4 py-3 border-b flex items-start justify-between gap-3 ${
            hudNotice.type === 'trap'
              ? 'bg-rose-950/90 border-rose-500/60 text-rose-100'
              : hudNotice.type === 'locked'
              ? 'bg-amber-950/90 border-amber-500/60 text-amber-100'
              : 'bg-emerald-950/90 border-emerald-500/60 text-emerald-100'
          }`}
        >
          <div className="space-y-1 text-xs sm:text-sm">
            <div className="font-extrabold flex items-center gap-1.5">
              {hudNotice.type === 'trap' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Search className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{hudNotice.title}</span>
            </div>
            <div className="whitespace-pre-line text-xs opacity-95 leading-relaxed">{hudNotice.body}</div>
          </div>
          <button
            type="button"
            onClick={() => setHudNotice(null)}
            className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 text-xs font-bold shrink-0 cursor-pointer"
          >
            닫기
          </button>
        </div>
      )}

      {/* =====================================================================
          2D TOP-DOWN TILE GRID MAP (15 x 10)
         ===================================================================== */}
      <div className="relative w-full aspect-[15/10] max-h-[470px] bg-slate-950 overflow-hidden select-none">
        {/* Render 15x10 Tiles */}
        <div
          className="w-full h-full grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: GRID_ROWS }).map((_, r) =>
            Array.from({ length: GRID_COLS }).map((__, c) => {
              const isWall =
                r === 0 ||
                r === GRID_ROWS - 1 ||
                c === 0 ||
                c === GRID_COLS - 1;
              const isPortalTile = c === stage.portalX && r === stage.portalY;
              const isChecker = (r + c) % 2 === 0;

              // Floor styling for O/X Survival Mode vs Normal Escape Room Mode
              let bgStyle = isChecker ? stage.floorColorA : stage.floorColorB;
              if (gameMode === 'ox_survival' && !isWall) {
                if (c <= 6) {
                  bgStyle = isChecker ? '#1e3a8a' : '#1d4ed8'; // Blue O Zone
                } else if (c >= 8) {
                  bgStyle = isChecker ? '#881337' : '#be123c'; // Red X Zone
                } else {
                  bgStyle = '#334155'; // Neutral Center Line
                }
              }

              if (isWall && !isPortalTile) {
                return (
                  <div
                    key={`tile-${r}-${c}`}
                    style={{ backgroundColor: stage.wallColor }}
                    className="border border-black/30 shadow-inner flex items-center justify-center relative"
                  >
                    <div className="w-full h-1.5 bg-white/10 absolute top-0 left-0" />
                    {r === 0 && c === 7 && (
                      <span className="text-[10px] font-mono font-black text-white/70 tracking-wider">
                        STAGE 0{stage.stageNum}
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={`tile-${r}-${c}`}
                  onClick={() => {
                    // Also allow clicking an adjacent tile to step toward it
                    const dx = Math.sign(c - pos.x);
                    const dy = Math.sign(r - pos.y);
                    if (Math.abs(c - pos.x) >= Math.abs(r - pos.y) && dx !== 0) {
                      movePlayer(dx, 0, dx > 0 ? 'right' : 'left');
                    } else if (dy !== 0) {
                      movePlayer(0, dy, dy > 0 ? 'down' : 'up');
                    }
                  }}
                  style={{ backgroundColor: bgStyle }}
                  className="border border-white/[0.04] relative flex items-center justify-center"
                >
                  {/* O/X Zone Floor Markings */}
                  {gameMode === 'ox_survival' && r === 5 && c === 3 && (
                    <span className="text-4xl sm:text-6xl font-black text-blue-200/35 pointer-events-none">
                      ⭕ O 구역
                    </span>
                  )}
                  {gameMode === 'ox_survival' && r === 5 && c === 11 && (
                    <span className="text-4xl sm:text-6xl font-black text-rose-200/35 pointer-events-none">
                      ❌ X 구역
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* =====================================================================
            FURNITURE & PROPS LAYER (Clue Bookshelves, Traps, Plants, Beds)
           ===================================================================== */}
        {gameMode === 'escape' &&
          stage.props.map((prop) => {
            const isNear =
              nearbyTarget?.type === 'prop' && nearbyTarget.prop.id === prop.id;

            return (
              <div
                key={prop.id}
                style={{
                  left: `${(prop.gridX / GRID_COLS) * 100}%`,
                  top: `${(prop.gridY / GRID_ROWS) * 100}%`,
                  width: `${100 / GRID_COLS}%`,
                  height: `${100 / GRID_ROWS}%`,
                }}
                onClick={() => {
                  if (isNear) handleInteract();
                }}
                className="absolute z-10 flex flex-col items-center justify-center p-0.5 cursor-pointer"
              >
                {/* Proximity Speech Bubble [Space / F] */}
                {isNear && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInteract();
                    }}
                    className="absolute -top-9 z-30 whitespace-nowrap px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-[10px] sm:text-xs shadow-lg border-2 border-white animate-bounce cursor-pointer"
                  >
                    [Space / F] 조사하기
                  </button>
                )}

                <div
                  className={`w-full h-full rounded-xl border-2 flex flex-col items-center justify-center shadow-md transition-transform ${
                    prop.kind === 'clue_note'
                      ? 'bg-amber-950/90 border-amber-400/80'
                      : prop.kind === 'trap'
                      ? 'bg-rose-950/80 border-rose-400/70'
                      : 'bg-emerald-950/80 border-emerald-500/50'
                  } ${isNear ? 'scale-110 ring-2 ring-amber-300' : ''}`}
                >
                  <span className="text-lg sm:text-2xl leading-none">{prop.iconEmoji}</span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-200 truncate max-w-full px-0.5 mt-0.5">
                    {prop.kind === 'clue_note' ? '힌트장' : prop.kind === 'trap' ? '수상함' : '화분'}
                  </span>
                </div>
              </div>
            );
          })}

        {/* =====================================================================
            PUZZLE OBJECTS LAYER (Locked Desks, Safes, Globes, Lockers)
           ===================================================================== */}
        {gameMode === 'escape' &&
          stage.puzzles.map((puzzle, idx) => {
            const isSolved = solvedPuzzles.includes(puzzle.id);
            const isNear =
              nearbyTarget?.type === 'puzzle' && nearbyTarget.puzzle.id === puzzle.id;

            return (
              <div
                key={puzzle.id}
                style={{
                  left: `${(puzzle.gridX / GRID_COLS) * 100}%`,
                  top: `${(puzzle.gridY / GRID_ROWS) * 100}%`,
                  width: `${100 / GRID_COLS}%`,
                  height: `${100 / GRID_ROWS}%`,
                }}
                onClick={() => {
                  if (isNear) handleInteract();
                }}
                className="absolute z-10 flex flex-col items-center justify-center p-0.5 cursor-pointer"
              >
                {/* Proximity Speech Bubble [Space / F] */}
                {isNear && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInteract();
                    }}
                    className="absolute -top-9 z-30 whitespace-nowrap px-2.5 py-1 rounded-xl bg-emerald-400 text-slate-950 font-black text-[10px] sm:text-xs shadow-lg border-2 border-white animate-bounce cursor-pointer"
                  >
                    [Space / F] {isSolved ? '다시 보기' : '암호 풀기'}
                  </button>
                )}

                <div
                  className={`relative w-full h-full rounded-xl border-2 flex flex-col items-center justify-center shadow-lg transition-all ${
                    isSolved
                      ? 'bg-emerald-900/90 border-emerald-400'
                      : 'bg-slate-900/95 border-amber-400 animate-pulse'
                  } ${isNear ? 'scale-110 ring-2 ring-white' : ''}`}
                >
                  <span
                    className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                      isSolved ? 'bg-emerald-400 text-slate-950' : 'bg-amber-400 text-slate-950'
                    }`}
                  >
                    {isSolved ? '✓' : idx + 1}
                  </span>
                  <span className="text-lg sm:text-2xl leading-none">{puzzle.iconEmoji}</span>
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-white truncate max-w-full px-0.5 mt-0.5">
                    {puzzle.objectName.slice(0, 5)}
                  </span>
                </div>
              </div>
            );
          })}

        {/* =====================================================================
            EXIT PORTAL DOOR TILE (Opens when all 3 room puzzles are solved!)
           ===================================================================== */}
        {gameMode === 'escape' && (
          <div
            style={{
              left: `${(stage.portalX / GRID_COLS) * 100}%`,
              top: `${(stage.portalY / GRID_ROWS) * 100}%`,
              width: `${100 / GRID_COLS}%`,
              height: `${100 / GRID_ROWS}%`,
            }}
            onClick={() => {
              if (nearbyTarget?.type === 'portal') handleInteract();
            }}
            className="absolute z-10 flex flex-col items-center justify-center p-0.5 cursor-pointer"
          >
            {nearbyTarget?.type === 'portal' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleInteract();
                }}
                className="absolute -top-9 right-0 z-30 whitespace-nowrap px-2.5 py-1 rounded-xl bg-cyan-400 text-slate-950 font-black text-[10px] sm:text-xs shadow-lg border-2 border-white animate-bounce cursor-pointer"
              >
                [Space / F] {isPortalOpen ? '다음 방 이동!' : '잠긴 문 확인'}
              </button>
            )}

            <div
              className={`w-full h-full rounded-xl border-2 flex flex-col items-center justify-center shadow-xl ${
                isPortalOpen
                  ? 'bg-gradient-to-br from-emerald-400 to-cyan-500 border-white text-slate-950 animate-pulse'
                  : 'bg-slate-900 border-rose-500/70 text-rose-300'
              }`}
            >
              <span className="text-lg sm:text-2xl leading-none">{isPortalOpen ? '🌀' : '🚪'}</span>
              <span className="text-[8px] sm:text-[9px] font-black mt-0.5">
                {isPortalOpen ? 'OPEN!' : '잠김'}
              </span>
            </div>
          </div>
        )}

        {/* =====================================================================
            OTHER MULTIPLAYER TEAMMATES ON THE GRID
           ===================================================================== */}
        {playersInRoom
          .filter((p) => p.nickname !== myNickname)
          .map((mate, idx) => {
            const mateEmoji = AVATAR_OPTIONS.find((a) => a.id === mate.avatar_id)?.emoji || '🐼';
            // Place teammates around spawn or solved objects
            const mx = Math.min(12, Math.max(2, stage.spawnX + ((idx + 1) % 3)));
            const my = Math.min(8, Math.max(2, stage.spawnY + (idx % 2 === 0 ? 1 : -1)));
            return (
              <div
                key={mate.player_uid}
                style={{
                  left: `${(mx / GRID_COLS) * 100}%`,
                  top: `${(my / GRID_ROWS) * 100}%`,
                  width: `${100 / GRID_COLS}%`,
                  height: `${100 / GRID_ROWS}%`,
                }}
                className="absolute z-15 pointer-events-none transition-all duration-300 flex flex-col items-center justify-center"
              >
                <span className="px-1.5 py-0.2 rounded-full bg-slate-900/90 border border-emerald-400/50 text-[9px] font-bold text-emerald-200 whitespace-nowrap -mt-4">
                  {mate.nickname}
                </span>
                <span className="text-xl sm:text-3xl">{mateEmoji}</span>
              </div>
            );
          })}

        {/* =====================================================================
            MY PLAYER CHARACTER (Smooth CSS Transition + Direction + Head Fireworks)
           ===================================================================== */}
        <div
          style={{
            left: `${(pos.x / GRID_COLS) * 100}%`,
            top: `${(pos.y / GRID_ROWS) * 100}%`,
            width: `${100 / GRID_COLS}%`,
            height: `${100 / GRID_ROWS}%`,
            transition: 'left 150ms linear, top 150ms linear',
          }}
          className="absolute z-20 pointer-events-none flex flex-col items-center justify-center"
        >
          {/* Floating Celebration / Status Effect above Character Head */}
          {headEffect && (
            <div className="absolute -top-11 z-40 whitespace-nowrap px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 font-black text-xs shadow-xl animate-zep-float">
              {headEffect}
            </div>
          )}

          {/* Player Name Tag */}
          <div className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] sm:text-[10px] shadow whitespace-nowrap -mt-3 mb-0.5">
            {myNickname || '나'}
          </div>

          {/* Character Sprite with Smooth Walk Bounce & Facing Flip */}
          <div
            className={`text-2xl sm:text-4xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)] transition-transform duration-150 ${
              isWalking ? '-translate-y-1 scale-110' : ''
            } ${facing === 'left' ? '-scale-x-100' : ''}`}
          >
            {myAvatarEmoji}
          </div>
        </div>

        {/* Optional Radial-Gradient Flashlight Overlay centered on My Character! */}
        {darkModeOn && gameMode === 'escape' && (
          <div
            className="pointer-events-none absolute inset-0 z-25 transition-all duration-150"
            style={{
              background: `radial-gradient(circle 145px at ${((pos.x + 0.5) / GRID_COLS) * 100}% ${
                ((pos.y + 0.5) / GRID_ROWS) * 100
              }%, rgba(254, 243, 199, 0.05) 0%, rgba(15, 23, 42, 0.55) 55%, rgba(2, 6, 23, 0.95) 100%)`,
            }}
          />
        )}
      </div>

      {/* =====================================================================
          BOTTOM ZEP CONTROLLER BAR (Mobile Virtual D-Pad + Interact Action Button)
         ===================================================================== */}
      <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Status & Proximity Guide */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-300">
            <span className="font-bold text-emerald-400">조작법:</span> 키보드{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]">
              WASD
            </kbd>{' '}
            /{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]">
              방향키
            </kbd>{' '}
            이동 · 사물 앞{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-[11px]">
              Space
            </kbd>{' '}
            또는{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-[11px]">
              F
            </kbd>{' '}
            조사하기
          </div>
        </div>

        {/* Right: Virtual Touch D-Pad + Action Button for Mobile/Tablet */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => movePlayer(-1, 0, 'left')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 text-white border border-slate-700 cursor-pointer"
              aria-label="왼쪽 이동"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => movePlayer(0, -1, 'up')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 text-white border border-slate-700 cursor-pointer"
                aria-label="위쪽 이동"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => movePlayer(0, 1, 'down')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 text-white border border-slate-700 cursor-pointer"
                aria-label="아래쪽 이동"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => movePlayer(1, 0, 'right')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 text-white border border-slate-700 cursor-pointer"
              aria-label="오른쪽 이동"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            disabled={!nearbyTarget}
            onClick={handleInteract}
            className={`px-4 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 border transition cursor-pointer ${
              nearbyTarget
                ? 'bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 border-white shadow-lg shadow-amber-500/25 animate-pulse'
                : 'bg-slate-800/60 text-slate-500 border-slate-800 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>[Space / F] 조사하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
