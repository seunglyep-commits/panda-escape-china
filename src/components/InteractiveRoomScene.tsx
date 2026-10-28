import React, { useState, useRef } from 'react';
import { InventoryItem, PuzzleHotspot, RoomStageInfo, AVATAR_OPTIONS } from '../data/escapeData';
import { PlayerInfo } from './FacilityMap';
import {
  Flashlight,
  Lightbulb,
  CheckCircle2,
  Lock,
  Sparkles,
  KeyRound,
  Search,
  AlertTriangle,
} from 'lucide-react';

interface InteractiveRoomSceneProps {
  stage: RoomStageInfo;
  solvedPuzzles: string[];
  unlockedStages: number[];
  selectedItem: InventoryItem | null;
  playersInRoom: PlayerInfo[];
  onOpenPuzzle: (puzzle: PuzzleHotspot, usedItemName?: string | null) => void;
  onSelectStage: (stageNum: number) => void;
}

export const InteractiveRoomScene: React.FC<InteractiveRoomSceneProps> = ({
  stage,
  solvedPuzzles,
  unlockedStages,
  selectedItem,
  playersInRoom,
  onOpenPuzzle,
  onSelectStage,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [flashlightOn, setFlashlightOn] = useState<boolean>(true);
  const [emergencyLightOn, setEmergencyLightOn] = useState<boolean>(false);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 380, y: 210 });
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [roomToast, setRoomToast] = useState<{ type: 'locked' | 'unlocked' | 'info'; text: string } | null>(
    null
  );

  const showToast = (type: 'locked' | 'unlocked' | 'info', text: string) => {
    setRoomToast({ type, text });
  };

  const updatePointer = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPointerPos({
      x: Math.max(0, Math.min(rect.width, clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, clientY - rect.top)),
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updatePointer(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Point-and-Click Hotspot Click Handler with Item Requirement Check!
  const handleHotspotClick = (puzzle: PuzzleHotspot) => {
    const isAlreadySolved = solvedPuzzles.includes(puzzle.id);

    // Condition: If hotspot requires a specific inventory item (e.g., locked drawer requires brass key)
    if (puzzle.requiredItemId && !isAlreadySolved) {
      if (!selectedItem || selectedItem.id !== puzzle.requiredItemId) {
        showToast(
          'locked',
          puzzle.lockedHintMessage ||
            `🔒 잠겨 있습니다! 하단 인벤토리에서 [${puzzle.requiredItemName}] 아이템을 클릭해 활성화(선택)한 상태로 이곳을 클릭하세요!`
        );
        return;
      }

      // Correct item is selected! Unlock and open inspection modal
      showToast(
        'unlocked',
        `🔓 인벤토리의 [${selectedItem.name}] 아이템을 사용하여 [${puzzle.objectName}] 잠금을 해제했습니다!`
      );
      onOpenPuzzle(puzzle, selectedItem.name);
      return;
    }

    setRoomToast(null);
    onOpenPuzzle(puzzle, null);
  };

  const getAvatarEmoji = (avatarId: string) => {
    return AVATAR_OPTIONS.find((a) => a.id === avatarId)?.emoji || '🐼';
  };

  return (
    <div className="rounded-3xl border border-emerald-500/40 bg-slate-900/95 shadow-2xl overflow-hidden">
      {/* Top Room Title & Flashlight Controls */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
              제{stage.stageNum}방 / 5방
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {stage.lessonBadge}
            </span>
            {selectedItem && (
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-200 border border-amber-400 animate-pulse flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" /> 손에 든 아이템: {selectedItem.icon} {selectedItem.name}
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white mt-1 flex flex-wrap items-center gap-2">
            <span>{stage.name}</span>
            <span className="text-sm font-bold text-amber-300">({stage.chineseTitle})</span>
          </h2>
        </div>

        {/* Flashlight / Emergency Light Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFlashlightOn(true);
              setEmergencyLightOn(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
              flashlightOn && !emergencyLightOn
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Flashlight className="w-3.5 h-3.5" />
            <span>손전등 탐색 모드</span>
          </button>

          <button
            type="button"
            onClick={() => setEmergencyLightOn((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
              emergencyLightOn
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{emergencyLightOn ? '비상등 켜짐 (전체 밝게)' : '비상등 켜기'}</span>
          </button>
        </div>
      </div>

      {/* Mission Guide Bar */}
      <div className="px-5 py-2 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-amber-300 font-bold">🎯 포인트 앤 클릭 순서: {stage.missionGoal}</span>
        <span className="text-slate-400">마우스나 손가락으로 어두운 방을 비추며 반짝이는 오브젝트를 클릭하세요!</span>
      </div>

      {/* Point-and-Click Interactive Room Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        className={`relative h-[390px] sm:h-[440px] w-full overflow-hidden select-none bg-gradient-to-b ${stage.bgThemeClass} ${
          selectedItem ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        {/* Architectural Room Interior SVG Background (Walls, Floor, Windows, Furniture) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-65"
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="wallGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Back Wall & Perspective Lines */}
          <polygon points="90,50 910,50 910,355 90,355" fill="url(#wallGlow)" stroke="#334155" strokeWidth="2" />
          <line x1="0" y1="0" x2="90" y2="50" stroke="#334155" strokeWidth="2" />
          <line x1="1000" y1="0" x2="910" y2="50" stroke="#334155" strokeWidth="2" />
          <line x1="0" y1="500" x2="90" y2="355" stroke="#334155" strokeWidth="2" />
          <line x1="1000" y1="500" x2="910" y2="355" stroke="#334155" strokeWidth="2" />

          {/* Perspective Floor */}
          <polygon points="90,355 910,355 1000,500 0,500" fill="url(#floorGrad)" stroke="#1e293b" strokeWidth="2" />
          {/* Floor Tiles */}
          <line x1="250" y1="355" x2="180" y2="500" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="500" y1="355" x2="500" y2="500" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="750" y1="355" x2="820" y2="500" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="45" y1="425" x2="955" y2="425" stroke="#1e293b" strokeWidth="1.5" />

          {/* Decorative Bamboo Silhouette Window on Center-Left Wall */}
          <rect x="130" y="85" width="190" height="140" rx="8" fill="#020617" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.4" />
          <text x="225" y="135" textAnchor="middle" fill="#10b981" fillOpacity="0.25" fontSize="22" fontWeight="bold">
            四川大熊猫研究中心
          </text>
          <text x="225" y="168" textAnchor="middle" fill="#94a3b8" fillOpacity="0.25" fontSize="14">
            SICHUAN PANDA LAB · ZONE 0{stage.stageNum}
          </text>

          {/* Furniture Silhouettes matching Hotspot Positions */}
          {/* Left Desk/Pedestal */}
          <rect x="140" y="255" width="180" height="115" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          {/* Center Table/Cabinet */}
          <rect x="415" y="250" width="210" height="125" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          {/* Right Heavy Door / Vault Frame */}
          <rect x="720" y="110" width="165" height="245" rx="10" fill="#0f172a" stroke="#64748b" strokeWidth="3" />
        </svg>

        {/* Interactive Point-and-Click Hotspots (Percentage Positioned) */}
        {stage.puzzles.map((puzzle) => {
          const isSolved = solvedPuzzles.includes(puzzle.id);
          const needsItem = Boolean(puzzle.requiredItemId) && !isSolved;
          const isMatchingItemEquipped =
            needsItem && selectedItem && selectedItem.id === puzzle.requiredItemId;
          const isHovered = hoveredHotspotId === puzzle.id;

          return (
            <button
              key={puzzle.id}
              type="button"
              onMouseEnter={() => setHoveredHotspotId(puzzle.id)}
              onMouseLeave={() => setHoveredHotspotId(null)}
              onClick={() => handleHotspotClick(puzzle)}
              style={{
                left: `${puzzle.xPercent}%`,
                top: `${puzzle.yPercent}%`,
                width: `${puzzle.widthPercent}%`,
                height: `${puzzle.heightPercent}%`,
              }}
              className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-2 cursor-pointer z-20 ${
                isSolved
                  ? 'bg-emerald-950/45 border-2 border-emerald-400/70 shadow-lg shadow-emerald-500/15'
                  : isMatchingItemEquipped
                  ? 'bg-amber-500/30 border-2 border-amber-300 ring-4 ring-amber-400/50 scale-105 shadow-2xl shadow-amber-400/40'
                  : needsItem
                  ? 'bg-slate-900/55 border-2 border-dashed border-amber-500/60 hover:border-amber-300 hover:bg-slate-900/80'
                  : 'bg-amber-500/10 border-2 border-amber-400/80 hover:bg-amber-500/25 hover:scale-105 shadow-xl shadow-amber-500/20'
              }`}
            >
              {/* Subtle Sparkle / Shimmer Indicator for Uninspected Hotspots */}
              {!isSolved && (
                <span className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isMatchingItemEquipped
                        ? 'bg-amber-300'
                        : needsItem
                        ? 'bg-rose-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-5 w-5 items-center justify-center text-[10px] font-black ${
                      isMatchingItemEquipped
                        ? 'bg-amber-300 text-slate-950'
                        : needsItem
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-400 text-slate-950'
                    }`}
                  >
                    {needsItem ? '🔒' : '✨'}
                  </span>
                </span>
              )}

              {isSolved && (
                <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}

              {/* Object Visual Icon */}
              <div
                className={`text-3xl sm:text-5xl transition-transform duration-200 ${
                  isHovered ? 'scale-110' : ''
                }`}
              >
                {puzzle.iconEmoji}
              </div>

              {/* Object Label Tag */}
              <div className="mt-1.5 px-2.5 py-0.5 rounded-lg bg-slate-950/90 border border-slate-700/90 text-[11px] sm:text-xs font-extrabold text-white text-center leading-tight shadow">
                {puzzle.objectName}
              </div>

              {/* Status Sub-badge */}
              <div className="mt-1 text-[10px] font-bold">
                {isSolved ? (
                  <span className="text-emerald-300 flex items-center gap-0.5">✓ 조사 완료</span>
                ) : isMatchingItemEquipped ? (
                  <span className="text-amber-200 bg-amber-500/40 px-2 py-0.5 rounded-full animate-bounce inline-flex items-center gap-1">
                    <KeyRound className="w-3 h-3" /> 클릭하여 열기!
                  </span>
                ) : needsItem ? (
                  <span className="text-rose-300 flex items-center gap-0.5">
                    <Lock className="w-3 h-3" /> {puzzle.requiredItemName} 필요
                  </span>
                ) : (
                  <span className="text-amber-300 flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" /> 클릭하여 단서 조사
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {/* CSS Radial-Gradient Flashlight (Darkness) Overlay */}
        {flashlightOn && !emergencyLightOn && (
          <div
            className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 165px at ${pointerPos.x}px ${pointerPos.y}px, rgba(254, 243, 199, 0.08) 0%, rgba(15, 23, 42, 0.45) 52%, rgba(2, 6, 23, 0.95) 100%)`,
            }}
          />
        )}

        {/* Flashlight Ring Reticle */}
        {flashlightOn && !emergencyLightOn && (
          <div
            className="pointer-events-none absolute z-30 w-44 h-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/20 shadow-[0_0_40px_rgba(251,191,36,0.12)]"
            style={{
              left: `${pointerPos.x}px`,
              top: `${pointerPos.y}px`,
            }}
          />
        )}

        {/* Toast Alert inside Room Canvas (e.g., when clicking a locked drawer without selecting the key) */}
        {roomToast && (
          <div className="absolute top-3 left-4 right-4 z-40 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md bg-slate-950/95 border-amber-400/70 text-amber-100 animate-fade-in">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
              {roomToast.type === 'locked' ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <Search className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <span>{roomToast.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setRoomToast(null)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 cursor-pointer"
            >
              확인
            </button>
          </div>
        )}

        {/* Bottom Overlay inside Scene: Teammates in this room & Next Room Portal */}
        <div className="absolute bottom-3 left-3 right-3 z-40 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-950/90 border border-slate-800/90 backdrop-blur-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400">현재 방 탐색 대원:</span>
            {playersInRoom.map((p) => (
              <span
                key={p.player_uid}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700"
              >
                <span>{getAvatarEmoji(p.avatar_id)}</span>
                <span>{p.nickname}</span>
              </span>
            ))}
          </div>

          {unlockedStages.includes(stage.stageNum + 1) && (
            <button
              type="button"
              onClick={() => onSelectStage(stage.stageNum + 1)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              문이 열렸습니다! 제{stage.stageNum + 1}방으로 이동 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
