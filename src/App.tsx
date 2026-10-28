import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { AVATAR_OPTIONS, ESCAPE_STAGES, InventoryItem, PuzzleHotspot } from './data/escapeData';
import { createRoomSupabaseClient, getPlayerCredentials } from './lib/supabase';
import { FacilityMap, PlayerInfo } from './components/FacilityMap';
import { PuzzleModal } from './components/PuzzleModal';
import { TextbookGuideModal } from './components/TextbookGuideModal';
import { InteractiveRoomScene } from './components/InteractiveRoomScene';
import { InventoryBar } from './components/InventoryBar';
import {
  Users,
  Sparkles,
  Copy,
  Check,
  Play,
  BookOpen,
  Map as MapIcon,
  Send,
  KeyRound,
  Trophy,
  LogOut,
  UserCheck,
  ShieldAlert,
  RefreshCw,
  Volume2,
} from 'lucide-react';

interface RoomData {
  id: string;
  room_code: string;
  team_name: string;
  target_players: number;
  status: 'waiting' | 'playing' | 'completed';
  current_stage: number;
  unlocked_stages: number[];
  solved_puzzles: string[];
  collected_clues: string[];
  score: number;
  host_uid: string;
  started_at: string | null;
  completed_at: string | null;
}

interface LogItem {
  id: string;
  player_uid: string;
  nickname: string;
  avatar_id: string;
  event_type: 'system' | 'chat' | 'clue' | 'solve' | 'stage_clear';
  message: string;
  stage_num: number;
  created_at: string;
}

export function App() {
  const { uid: myUid, token: myToken } = getPlayerCredentials();

  // Setup / Pre-Room Profile State
  const [nickname, setNickname] = useState<string>(() => localStorage.getItem('panda_nickname') || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    () => localStorage.getItem('panda_avatar') || 'panda'
  );
  const [teamName, setTeamName] = useState<string>('판다 구출 특공대');
  const [targetPlayers, setTargetPlayers] = useState<number>(3);
  const [joinCodeInput, setJoinCodeInput] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('room') || localStorage.getItem('panda_active_room') || '').toUpperCase();
  });

  // Active Room Multiplayer State
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(() => {
    return localStorage.getItem('panda_active_room') || null;
  });
  const [room, setRoom] = useState<RoomData | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [activeViewStage, setActiveViewStage] = useState<number>(1);

  // Point-and-Click Puzzle & Inventory State
  const [activePuzzle, setActivePuzzle] = useState<PuzzleHotspot | null>(null);
  const [usedItemForModal, setUsedItemForModal] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Modals & UI Helpers
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const prevStageRef = useRef<number>(1);
  const prevStatusRef = useRef<string>('waiting');

  const getAvatarObj = (avatarId: string) => {
    return AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];
  };

  // Derive all collected inventory items from solved_puzzles across the team
  const collectedInventoryItems: InventoryItem[] = useMemo(() => {
    if (!room) return [];
    const list: InventoryItem[] = [];
    for (const stage of ESCAPE_STAGES) {
      for (const puzzle of stage.puzzles) {
        if (room.solved_puzzles.includes(puzzle.id) && puzzle.rewardItem) {
          list.push(puzzle.rewardItem);
        }
      }
    }
    return list;
  }, [room]);

  const selectedInventoryItem = useMemo(() => {
    return collectedInventoryItems.find((i) => i.id === selectedItemId) || null;
  }, [collectedInventoryItems, selectedItemId]);

  // Fetch full room state via verified RPC
  const fetchRoomState = useCallback(
    async (codeToFetch: string) => {
      if (!codeToFetch) return;
      const client = createRoomSupabaseClient(codeToFetch);
      const { data, error } = await client.rpc('get_escape_room_state', {
        p_room_code: codeToFetch,
        p_player_uid: myUid,
        p_player_token: myToken,
      });

      if (error) {
        console.warn('Room state fetch warning:', error.message);
        if (error.message.includes('존재하지 않는') || error.message.includes('참가 인증')) {
          localStorage.removeItem('panda_active_room');
          setActiveRoomCode(null);
          setRoom(null);
        }
        return;
      }

      if (data && data.room) {
        const fetchedRoom: RoomData = data.room;
        setRoom(fetchedRoom);
        setPlayers(data.players || []);
        setLogs(data.logs || []);

        if (fetchedRoom.current_stage > prevStageRef.current) {
          prevStageRef.current = fetchedRoom.current_stage;
          setActiveViewStage(fetchedRoom.current_stage);
          setSelectedItemId(null);
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }

        if (fetchedRoom.status === 'completed' && prevStatusRef.current !== 'completed') {
          prevStatusRef.current = 'completed';
          confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
        } else {
          prevStatusRef.current = fetchedRoom.status;
        }
      }
    },
    [myUid, myToken]
  );

  // Realtime subscription + fallback poll
  useEffect(() => {
    if (!activeRoomCode) return;

    fetchRoomState(activeRoomCode);

    const client = createRoomSupabaseClient(activeRoomCode);
    const channel = client
      .channel(`room-sync-${activeRoomCode}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'escape_rooms', filter: `room_code=eq.${activeRoomCode}` },
        () => fetchRoomState(activeRoomCode)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'escape_players', filter: `room_code=eq.${activeRoomCode}` },
        () => fetchRoomState(activeRoomCode)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'escape_logs', filter: `room_code=eq.${activeRoomCode}` },
        () => fetchRoomState(activeRoomCode)
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchRoomState(activeRoomCode);
    }, 3000);

    return () => {
      clearInterval(interval);
      client.removeChannel(channel);
    };
  }, [activeRoomCode, fetchRoomState]);

  // Create a new Escape Room (2~5 players)
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    const trimmedName = nickname.trim();
    if (!trimmedName) {
      setErrorBanner('방탈출 시작 전에 사용할 자신의 이름(닉네임)을 먼저 입력해 주세요!');
      return;
    }

    setLoadingAction(true);
    try {
      localStorage.setItem('panda_nickname', trimmedName);
      localStorage.setItem('panda_avatar', selectedAvatar);

      const client = createRoomSupabaseClient();
      const { data, error } = await client.rpc('create_escape_room', {
        p_team_name: teamName.trim() || '판다 구출 특공대',
        p_target_players: targetPlayers,
        p_nickname: trimmedName,
        p_avatar_id: selectedAvatar,
        p_player_uid: myUid,
        p_player_token: myToken,
      });

      if (error) throw error;
      const newCode = data.room_code;
      localStorage.setItem('panda_active_room', newCode);
      setActiveRoomCode(newCode);
      setActiveViewStage(1);
      prevStageRef.current = 1;
      await fetchRoomState(newCode);
    } catch (err: any) {
      setErrorBanner(err.message || '방 생성 중 오류가 발생했습니다.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Join an existing Escape Room by 6-char PIN
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    const trimmedName = nickname.trim();
    const cleanCode = joinCodeInput.trim().toUpperCase();

    if (!trimmedName) {
      setErrorBanner('방에 입장하기 전에 자신의 이름(닉네임)과 아바타를 먼저 정해 주세요!');
      return;
    }
    if (cleanCode.length !== 6) {
      setErrorBanner('6자리 방 코드(PIN)를 정확히 입력해 주세요.');
      return;
    }

    setLoadingAction(true);
    try {
      localStorage.setItem('panda_nickname', trimmedName);
      localStorage.setItem('panda_avatar', selectedAvatar);

      const client = createRoomSupabaseClient(cleanCode);
      const { data, error } = await client.rpc('join_escape_room', {
        p_room_code: cleanCode,
        p_nickname: trimmedName,
        p_avatar_id: selectedAvatar,
        p_player_uid: myUid,
        p_player_token: myToken,
      });

      if (error) throw error;
      const joinedCode = data.room_code;
      localStorage.setItem('panda_active_room', joinedCode);
      setActiveRoomCode(joinedCode);
      await fetchRoomState(joinedCode);
    } catch (err: any) {
      setErrorBanner(err.message || '방 입장 중 오류가 발생했습니다.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Update my avatar or nickname
  const handleUpdateMyProfile = async (newAvatarId: string, newNick?: string) => {
    setSelectedAvatar(newAvatarId);
    localStorage.setItem('panda_avatar', newAvatarId);
    if (!activeRoomCode) return;

    const client = createRoomSupabaseClient(activeRoomCode);
    await client.rpc('update_my_player_state', {
      p_room_code: activeRoomCode,
      p_player_uid: myUid,
      p_player_token: myToken,
      p_nickname: (newNick ?? nickname).trim() || '구출대원',
      p_avatar_id: newAvatarId,
      p_current_room_view: activeViewStage,
      p_chat_message: null,
    });
    await fetchRoomState(activeRoomCode);
  };

  // Switch which room I am viewing on the map
  const handleSelectStage = async (stageNum: number) => {
    setActiveViewStage(stageNum);
    setShowMapModal(false);
    if (!activeRoomCode) return;

    const client = createRoomSupabaseClient(activeRoomCode);
    await client.rpc('update_my_player_state', {
      p_room_code: activeRoomCode,
      p_player_uid: myUid,
      p_player_token: myToken,
      p_nickname: null,
      p_avatar_id: null,
      p_current_room_view: stageNum,
      p_chat_message: null,
    });
    await fetchRoomState(activeRoomCode);
  };

  // Start Game from Waiting Room
  const handleStartGame = async () => {
    if (!activeRoomCode) return;
    setLoadingAction(true);
    try {
      const client = createRoomSupabaseClient(activeRoomCode);
      const { error } = await client.rpc('start_escape_game', {
        p_room_code: activeRoomCode,
        p_player_uid: myUid,
        p_player_token: myToken,
      });
      if (error) throw error;
      await fetchRoomState(activeRoomCode);
    } catch (err: any) {
      setErrorBanner(err.message || '게임 시작에 실패했습니다.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Solve a Puzzle & Automatically Receive Reward Item in Inventory
  const handleSolvePuzzle = async (puzzle: PuzzleHotspot) => {
    if (!activeRoomCode) return;
    const client = createRoomSupabaseClient(activeRoomCode);
    const msg = puzzle.isStageFinal
      ? `🎉 [${nickname}] 대원이 [${puzzle.rewardItem.icon} ${puzzle.rewardItem.name}]을(를) 획득하고 제${puzzle.stageNum}방 최종 잠금장치를 해제했습니다!`
      : `✨ [${nickname}] 대원이 [${puzzle.title}] 단서를 풀어 인벤토리 아이템 [${puzzle.rewardItem.icon} ${puzzle.rewardItem.name}]을(를) 획득했습니다!`;

    const { error } = await client.rpc('submit_puzzle_solution', {
      p_room_code: activeRoomCode,
      p_player_uid: myUid,
      p_player_token: myToken,
      p_puzzle_id: puzzle.id,
      p_clue_digit: puzzle.rewardDigit,
      p_stage_num: puzzle.stageNum,
      p_is_stage_final: puzzle.isStageFinal,
      p_message: msg,
    });

    if (error) {
      setErrorBanner(error.message);
      return;
    }

    // Automatically select the newly acquired key/tool so the user can immediately see it in inventory
    if (puzzle.rewardItem && !puzzle.isStageFinal) {
      setSelectedItemId(puzzle.rewardItem.id);
    } else {
      setSelectedItemId(null);
    }

    await fetchRoomState(activeRoomCode);
  };

  // Send Team Chat Message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeRoomCode) return;
    const msg = chatInput.trim();
    setChatInput('');
    const client = createRoomSupabaseClient(activeRoomCode);
    await client.rpc('update_my_player_state', {
      p_room_code: activeRoomCode,
      p_player_uid: myUid,
      p_player_token: myToken,
      p_nickname: null,
      p_avatar_id: null,
      p_current_room_view: activeViewStage,
      p_chat_message: msg,
    });
    await fetchRoomState(activeRoomCode);
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem('panda_active_room');
    setActiveRoomCode(null);
    setRoom(null);
    setPlayers([]);
    setLogs([]);
    setSelectedItemId(null);
    setErrorBanner(null);
  };

  const handleCopyPin = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.room_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // ============================================================================
  // VIEW 1: PRE-GAME AVATAR & NAME SETUP + CREATE / JOIN ROOM
  // ============================================================================
  if (!activeRoomCode || !room) {
    const currentAvatar = getAvatarObj(selectedAvatar);

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-emerald-950/30 to-slate-950 text-slate-100 flex flex-col">
        <header className="border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
                🐼
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    미래엔 중학교 중국어 1~3과 · 포인트 앤 클릭 방탈출
                  </span>
                  <span className="text-xs font-bold text-amber-300">2~5인 실시간 협동 멀티플레이</span>
                </div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  판다 연구소 구출 작전 : 손전등과 인벤토리로 5개의 방을 탈출하라!
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>1~3과 교과서 핵심 단서 사전 보기</span>
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-8">
          {errorBanner && (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-400/50 text-rose-200 text-sm font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorBanner}</span>
              </div>
              <button
                onClick={() => setErrorBanner(null)}
                className="text-xs px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 cursor-pointer"
              >
                닫기
              </button>
            </div>
          )}

          {/* STEP 1: Choose Your Avatar & Name Before Escape Room */}
          <section className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-5 sm:p-7 shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  STEP 1 · 방탈출 입장 전 필수 준비
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  나의 구출 대원 아바타와 이름을 정해 주세요!
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  교과서 45쪽 ‘중국의 멸종 위기 동물’과 전통 캐릭터 중 나만의 아바타를 고르고 이름을 입력하세요.
                </p>
              </div>

              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-800/90 border border-emerald-500/40">
                <span className="text-3xl">{currentAvatar.emoji}</span>
                <div>
                  <div className="text-xs text-emerald-300 font-bold">{currentAvatar.roleTitle}</div>
                  <div className="text-sm font-extrabold text-white">
                    {nickname.trim() || '이름 미입력'} ({currentAvatar.name})
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-md">
              <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
                내 이름 (닉네임 또는 중국어 이름)
              </label>
              <input
                type="text"
                maxLength={16}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 김동민, 왕징징, 판다대장..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 focus:border-emerald-400 focus:outline-none text-white font-bold text-base placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {AVATAR_OPTIONS.map((av) => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? `bg-gradient-to-br ${av.bgGradient} ring-2 ring-emerald-400 scale-[1.02] shadow-lg`
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-4xl">{av.emoji}</span>
                        {isSelected && (
                          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                            선택됨 ✓
                          </span>
                        )}
                      </div>
                      <div className="font-extrabold text-sm text-white">{av.name}</div>
                      <div className="text-[11px] font-semibold text-amber-300 mt-0.5">{av.chineseName}</div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{av.desc}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-bold text-emerald-300">
                      특기: {av.roleTitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 2: Create Room (2,3,4,5 players) OR Join Room by PIN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form
              onSubmit={handleCreateRoom}
              className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-6 shadow-xl flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    방장(모둠 대표)으로 시작하기
                  </span>
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">새로운 방탈출 팀 만들기 (2~5인)</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    함께할 인원수(2인, 3인, 4인, 5인)를 선택하고 방을 만들면 6자리 방 코드(PIN)가 생성됩니다.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">우리 모둠(팀) 이름</label>
                  <input
                    type="text"
                    maxLength={20}
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="예: 2학년 1반 판다구출대"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    함께 방탈출할 팀 인원 선택 (2인 / 3인 / 4인 / 5인)
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {[2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTargetPlayers(num)}
                        className={`py-3 rounded-2xl border font-extrabold text-sm transition cursor-pointer ${
                          targetPlayers === num
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/25'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {num}인 팀
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingAction}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>
                  {loadingAction ? '방 생성 중...' : `${targetPlayers}인 방탈출 방 만들고 코드 발급받기`}
                </span>
              </button>
            </form>

            <form
              onSubmit={handleJoinRoom}
              className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 p-6 shadow-xl flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    친구가 만든 방에 합류하기
                  </span>
                  <KeyRound className="w-5 h-5 text-amber-400" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">방 코드(PIN) 입력해서 입장하기</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    친구의 스마트폰·태블릿 화면에 표시된 6자리 방 코드를 입력하면 실시간으로 같은 방에 모입니다!
                  </p>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    6자리 방 코드 (PIN) 입력
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="예: 8K2P9A"
                    className="w-full px-4 py-4 rounded-2xl bg-slate-950 border-2 border-amber-500/50 focus:border-amber-400 focus:outline-none text-center font-mono text-2xl sm:text-3xl font-black tracking-[0.35em] text-amber-300 uppercase placeholder:text-slate-600 placeholder:tracking-normal placeholder:text-base"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingAction}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-5 h-5" />
                <span>{loadingAction ? '입장 확인 중...' : '방 코드로 팀 합류하기!'}</span>
              </button>
            </form>
          </div>

          <section className="space-y-3">
            <FacilityMap
              currentStage={1}
              unlockedStages={[1]}
              solvedPuzzles={[]}
              activeViewStage={1}
              players={[
                {
                  id: 'preview',
                  player_uid: myUid,
                  nickname: nickname.trim() || '나(대기중)',
                  avatar_id: selectedAvatar,
                  is_host: true,
                  is_ready: true,
                  current_room_view: 1,
                  solved_count: 0,
                  last_seen_at: new Date().toISOString(),
                },
              ]}
              myUid={myUid}
              onSelectStage={() => {}}
            />
          </section>
        </main>

        {showGuideModal && <TextbookGuideModal onClose={() => setShowGuideModal(false)} />}
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: WAITING ROOM LOBBY
  // ============================================================================
  if (room.status === 'waiting') {
    const canStart = players.length >= 1;
    const isEnoughPlayers = players.length >= room.target_players;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-emerald-950/25 to-slate-950 text-slate-100 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🐼</span>
              <div>
                <div className="text-xs text-emerald-400 font-bold">
                  {room.team_name} · 목표 인원 {room.target_players}인 팀 (현재 {players.length}명 접속 중)
                </div>
                <h1 className="text-lg sm:text-xl font-black text-white">
                  방탈출 출발 대기실 — 친구들에게 방 코드를 알려주세요!
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>1~3과 단서 사전</span>
              </button>
              <button
                type="button"
                onClick={handleLeaveRoom}
                className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-200 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>방 나가기</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-3xl border-2 border-amber-400/60 bg-slate-900/95 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                실시간 멀티플레이 입장 코드
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-black tracking-[0.25em] text-amber-300 bg-slate-950 px-6 py-4 rounded-2xl border border-slate-800">
                {room.room_code}
              </div>
              <button
                type="button"
                onClick={handleCopyPin}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? '방 코드가 복사되었습니다!' : '방 코드 복사하기'}</span>
              </button>
              <p className="text-xs text-slate-400 leading-relaxed">
                다른 친구들도 각자 기기에서 아바타와 이름을 정한 뒤 위 6자리 코드를 입력하면 아래 대원 목록에 실시간으로 나타납니다!
              </p>
            </div>

            <div className="lg:col-span-2 rounded-3xl border border-emerald-500/30 bg-slate-900/95 p-6 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <span>참가 대원 현황 ({players.length} / {room.target_players}명)</span>
                  </h2>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isEnoughPlayers
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isEnoughPlayers ? '모둠 전원 집합 완료!' : '친구들을 기다리는 중... (바로 시작도 가능)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: Math.max(room.target_players, players.length) }).map((_, idx) => {
                    const p = players[idx];
                    if (!p) {
                      return (
                        <div
                          key={`empty-${idx}`}
                          className="p-4 rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 flex items-center gap-3 text-slate-500"
                        >
                          <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-xl">
                            ❔
                          </div>
                          <div>
                            <div className="text-sm font-bold">대원 {idx + 1} 접속 대기 중...</div>
                            <div className="text-xs">방 코드 [{room.room_code}] 입력</div>
                          </div>
                        </div>
                      );
                    }

                    const av = getAvatarObj(p.avatar_id);
                    const isMe = p.player_uid === myUid;

                    return (
                      <div
                        key={p.player_uid}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                          isMe
                            ? 'bg-emerald-950/40 border-emerald-400/60 ring-1 ring-emerald-400/40'
                            : 'bg-slate-950/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl">
                            {av.emoji}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-white text-sm sm:text-base">{p.nickname}</span>
                              {isMe && (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950">
                                  나
                                </span>
                              )}
                              {p.is_host && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                  방장
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-emerald-300 font-medium">{av.name}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 mr-1">내 아바타 변경:</span>
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleUpdateMyProfile(av.id)}
                      title={av.name}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition cursor-pointer ${
                        selectedAvatar === av.id
                          ? 'bg-emerald-500/30 border-emerald-400 scale-110'
                          : 'bg-slate-800 border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!canStart || loadingAction}
                  onClick={handleStartGame}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>지금 바로 판다 연구소 방탈출 시작하기!</span>
                </button>
              </div>
            </div>
          </div>

          <FacilityMap
            currentStage={room.current_stage}
            unlockedStages={room.unlocked_stages}
            solvedPuzzles={room.solved_puzzles}
            activeViewStage={activeViewStage}
            players={players}
            myUid={myUid}
            onSelectStage={(s) => setActiveViewStage(s)}
          />
        </div>

        {showGuideModal && <TextbookGuideModal onClose={() => setShowGuideModal(false)} />}
      </div>
    );
  }

  // ============================================================================
  // VIEW 3: POINT-AND-CLICK ESCAPE ROOM GAMEPLAY + INVENTORY + FLASHLIGHT
  // ============================================================================
  const currentStageObj = ESCAPE_STAGES.find((s) => s.stageNum === activeViewStage) || ESCAPE_STAGES[0];
  const stageNonFinalPuzzles = currentStageObj.puzzles.filter((p) => !p.isStageFinal);
  const canSolveStageFinal = stageNonFinalPuzzles.every((p) => room.solved_puzzles.includes(p.id));
  const totalSolvedCount = room.solved_puzzles.length;
  const masterCodeSlots = [
    { stage: 1, digit: '3', puzzleId: 'r1_p1', label: '1방(3성)' },
    { stage: 2, digit: '2', puzzleId: 'r2_p1', label: '2방(bú)' },
    { stage: 3, digit: '4', puzzleId: 'r3_p3', label: '3방(王)' },
    { stage: 4, digit: '8', puzzleId: 'r4_p2', label: '4방(18살)' },
    { stage: 5, digit: '9', puzzleId: 'r5_p2', label: '5방(9월)' },
  ];

  const speakSentence = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Game HUD Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🐼</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">{room.team_name}</span>
                <button
                  type="button"
                  onClick={handleCopyPin}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono text-xs font-bold cursor-pointer"
                >
                  <span>코드: {room.room_code}</span>
                  {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="text-[11px] text-slate-400">
                전체 단서 해독: <strong className="text-emerald-400">{totalSolvedCount} / 15</strong> · 팀 점수:{' '}
                <strong className="text-amber-300">{room.score}점</strong>
              </div>
            </div>
          </div>

          {/* 5-Digit Master Code Tracker */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">마스터 코드:</span>
            {masterCodeSlots.map((slot) => {
              const unlocked = room.solved_puzzles.includes(slot.puzzleId);
              return (
                <div
                  key={slot.stage}
                  title={slot.label}
                  className={`w-7 h-8 rounded-lg flex flex-col items-center justify-center border font-mono text-xs font-black ${
                    unlocked
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  <span>{unlocked ? slot.digit : '?'}</span>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <MapIcon className="w-4 h-4" />
              <span>전체 맵 크게 보기</span>
            </button>
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>1~3과 단서 사전</span>
            </button>
            <button
              type="button"
              onClick={handleLeaveRoom}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-200 border border-slate-700 cursor-pointer"
              title="방 나가기"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Victory Banner if Game Completed */}
      {room.status === 'completed' && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 text-slate-950 px-4 py-5 shadow-2xl">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-slate-950/20 text-white">
                <Trophy className="w-9 h-9" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-900">
                  MISSION COMPLETE · 5개 방 완전 탈출 성공!
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                  🎉 축하합니다! [{room.team_name}] 대원들이 아기 판다 바오바오를 구출했습니다!
                </h2>
                <p className="text-xs sm:text-sm font-bold text-slate-900/90 mt-0.5">
                  마스터 코드 [3 - 2 - 4 - 8 - 9] 해독 완료! 중국어 1~3과 핵심 표현을 모두 마스터했어요!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => speakSentence('祝贺你们！谢谢你们！再见！')}
              className="px-4 py-2.5 rounded-xl bg-slate-950 text-amber-300 font-extrabold text-xs sm:text-sm flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>판다의 감사 인사 듣기</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT/CENTER COLUMN (8 cols): Point-and-Click Room View + Bottom Inventory Bar + Full Escape Map */}
        <div className="lg:col-span-8 space-y-4">
          {/* 1. Point-and-Click Room View with Radial-Gradient Flashlight */}
          <InteractiveRoomScene
            stage={currentStageObj}
            solvedPuzzles={room.solved_puzzles}
            unlockedStages={room.unlocked_stages}
            selectedItem={selectedInventoryItem}
            playersInRoom={players.filter((p) => p.current_room_view === currentStageObj.stageNum)}
            onOpenPuzzle={(puzzle, usedItemName) => {
              setUsedItemForModal(usedItemName || null);
              setActivePuzzle(puzzle);
            }}
            onSelectStage={handleSelectStage}
          />

          {/* 2. Bottom Inventory Bar (Item Selection, Combination, Inspection) */}
          <InventoryBar
            items={collectedInventoryItems}
            selectedItemId={selectedItemId}
            onSelectItem={(item) => setSelectedItemId(item ? item.id : null)}
            currentStage={currentStageObj.stageNum}
          />

          {/* 3. Always-Visible Overall Escape Map */}
          <FacilityMap
            currentStage={room.current_stage}
            unlockedStages={room.unlocked_stages}
            solvedPuzzles={room.solved_puzzles}
            activeViewStage={activeViewStage}
            players={players}
            myUid={myUid}
            onSelectStage={handleSelectStage}
          />
        </div>

        {/* RIGHT COLUMN (4 cols): Team Status & Live Team Walkie-Talkie */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>구출 대원 ({players.length}명 접속 중)</span>
              </h3>
              <button
                type="button"
                onClick={() => activeRoomCode && fetchRoomState(activeRoomCode)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>동기화</span>
              </button>
            </div>

            <div className="space-y-2">
              {players.map((p) => {
                const av = getAvatarObj(p.avatar_id);
                const isMe = p.player_uid === myUid;
                return (
                  <div
                    key={p.player_uid}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                      isMe ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{av.emoji}</span>
                      <div>
                        <div className="text-xs font-extrabold text-white flex items-center gap-1">
                          <span>{p.nickname}</span>
                          {isMe && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-black">
                              나
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{av.name}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-amber-300">
                        제{p.current_room_view}방 탐색중
                      </span>
                      <div className="text-[10px] text-emerald-400 mt-0.5">해독 {p.solved_count}건</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 flex flex-col justify-between min-h-[360px]">
            <div>
              <h3 className="font-extrabold text-sm text-white mb-2 flex items-center justify-between">
                <span>📡 실시간 단서 해독 무전기</span>
                <span className="text-[11px] font-normal text-slate-400">팀원 전체 공유</span>
              </h3>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 flex flex-col-reverse">
                {logs.map((log) => {
                  const av = getAvatarObj(log.avatar_id);
                  const isSolve = log.event_type === 'solve' || log.event_type === 'stage_clear';
                  return (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-xl text-xs border ${
                        log.event_type === 'stage_clear'
                          ? 'bg-amber-500/15 border-amber-400/40 text-amber-200 font-bold'
                          : isSolve
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                          : log.event_type === 'chat'
                          ? 'bg-slate-800/90 border-slate-700 text-slate-100'
                          : 'bg-slate-950/70 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-0.5">
                        <span>{av.emoji}</span>
                        <span className="text-white">{log.nickname}</span>
                        <span className="text-[10px] text-slate-500">· 제{log.stage_num}방</span>
                      </div>
                      <div className="leading-relaxed">{log.message}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSendChat} className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                maxLength={120}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="팀원에게 힌트나 메시지 보내기..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>전송</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Clue Inspection & Shuffled Quiz Modal */}
      {activePuzzle && (
        <PuzzleModal
          puzzle={activePuzzle}
          isSolved={room.solved_puzzles.includes(activePuzzle.id)}
          canSolveFinal={canSolveStageFinal}
          usedItemName={usedItemForModal}
          onClose={() => {
            setActivePuzzle(null);
            setUsedItemForModal(null);
          }}
          onSolveSuccess={handleSolvePuzzle}
        />
      )}

      {/* Expanded Full Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <FacilityMap
            currentStage={room.current_stage}
            unlockedStages={room.unlocked_stages}
            solvedPuzzles={room.solved_puzzles}
            activeViewStage={activeViewStage}
            players={players}
            myUid={myUid}
            onSelectStage={handleSelectStage}
            isExpandedModal={true}
            onCloseModal={() => setShowMapModal(false)}
          />
        </div>
      )}

      {/* Textbook 1~3 Vocab Guide Modal */}
      {showGuideModal && <TextbookGuideModal onClose={() => setShowGuideModal(false)} />}
    </div>
  );
}
export default App;
