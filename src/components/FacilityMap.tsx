import React from 'react';
import { ESCAPE_STAGES } from '../data/escapeData';
import { AVATAR_OPTIONS } from '../data/escapeData';
import { Lock, CheckCircle2, MapPin, Sparkles, Compass } from 'lucide-react';

export interface PlayerInfo {
  id: string;
  player_uid: string;
  nickname: string;
  avatar_id: string;
  is_host: boolean;
  is_ready: boolean;
  current_room_view: number;
  solved_count: number;
  last_seen_at: string;
}

interface FacilityMapProps {
  currentStage: number;
  unlockedStages: number[];
  solvedPuzzles: string[];
  activeViewStage: number;
  players: PlayerInfo[];
  myUid: string;
  onSelectStage: (stageNum: number) => void;
  isExpandedModal?: boolean;
  onCloseModal?: () => void;
}

export const FacilityMap: React.FC<FacilityMapProps> = ({
  currentStage,
  unlockedStages,
  solvedPuzzles,
  activeViewStage,
  players,
  myUid,
  onSelectStage,
  isExpandedModal = false,
  onCloseModal,
}) => {
  const getAvatarEmoji = (avatarId: string) => {
    return AVATAR_OPTIONS.find((a) => a.id === avatarId)?.emoji || '🐼';
  };

  return (
    <div
      className={`relative rounded-2xl border border-emerald-500/30 bg-slate-900/95 shadow-2xl overflow-hidden ${
        isExpandedModal ? 'p-6 max-w-5xl w-full mx-auto' : 'p-4'
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              쓰촨성 판다 연구소 방탈출 전체 지도 (1~5방)
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                실시간 대원 위치 표시
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              열린 방을 클릭하면 해당 방으로 이동할 수 있습니다. 각 방의 3개 단서를 모두 풀면 다음 방이 열립니다!
            </p>
          </div>
        </div>

        {isExpandedModal && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
          >
            지도 닫기 ✕
          </button>
        )}
      </div>

      {/* Interactive Blueprint Map Container */}
      <div
        className={`relative w-full rounded-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-emerald-950/30 to-slate-950 overflow-hidden ${
          isExpandedModal ? 'h-[420px] sm:h-[460px]' : 'h-[230px] sm:h-[260px]'
        }`}
      >
        {/* Grid Blueprint Pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Decorative Zones Label */}
        <div className="absolute top-2.5 left-3 text-[11px] font-mono text-emerald-400/70 tracking-wider uppercase pointer-events-none">
          SICHUAN PANDA SANCTUARY BLUEPRINT // ZONE 01 - 05
        </div>
        <div className="absolute bottom-2.5 right-3 text-[11px] text-slate-400 pointer-events-none flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> 클리어
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse inline-block" /> 진행 중
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" /> 잠김
          </span>
        </div>

        {/* SVG Connecting Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pathActive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          {ESCAPE_STAGES.slice(0, -1).map((stage, idx) => {
            const nextStage = ESCAPE_STAGES[idx + 1];
            const isPathUnlocked = unlockedStages.includes(nextStage.stageNum);
            return (
              <g key={`path-${stage.stageNum}`}>
                <line
                  x1={stage.mapCoords.x}
                  y1={stage.mapCoords.y}
                  x2={nextStage.mapCoords.x}
                  y2={nextStage.mapCoords.y}
                  stroke={isPathUnlocked ? '#10b981' : '#334155'}
                  strokeWidth={isPathUnlocked ? '1.2' : '0.8'}
                  strokeDasharray={isPathUnlocked ? 'none' : '2,2'}
                />
              </g>
            );
          })}
        </svg>

        {/* Room Nodes */}
        {ESCAPE_STAGES.map((stage) => {
          const isUnlocked = unlockedStages.includes(stage.stageNum);
          const stagePuzzleIds = stage.puzzles.map((p) => p.id);
          const solvedInStage = stagePuzzleIds.filter((id) => solvedPuzzles.includes(id)).length;
          const isCleared = solvedInStage === stagePuzzleIds.length;
          const isCurrentView = activeViewStage === stage.stageNum;
          const playersInRoom = players.filter((p) => p.current_room_view === stage.stageNum);

          return (
            <button
              key={stage.stageNum}
              type="button"
              disabled={!isUnlocked}
              onClick={() => isUnlocked && onSelectStage(stage.stageNum)}
              style={{
                left: `${stage.mapCoords.x}%`,
                top: `${stage.mapCoords.y}%`,
              }}
              className={`group absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 text-left rounded-2xl p-2 sm:p-2.5 border ${
                isCurrentView
                  ? 'ring-2 ring-amber-400 border-amber-400 bg-slate-900/95 scale-105 z-20 shadow-lg shadow-amber-500/20'
                  : isCleared
                  ? 'border-emerald-500/70 bg-emerald-950/90 hover:scale-105 z-10 cursor-pointer'
                  : isUnlocked
                  ? 'border-cyan-400/70 bg-slate-900/90 hover:scale-105 z-10 cursor-pointer'
                  : 'border-slate-800 bg-slate-900/60 opacity-65 cursor-not-allowed'
              } ${isExpandedModal ? 'w-40 sm:w-48' : 'w-28 sm:w-36'}`}
            >
              {/* Top Row: Room Badge & Status Icon */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <span
                  className={`text-[10px] sm:text-xs font-extrabold px-1.5 py-0.5 rounded-md ${
                    isCleared
                      ? 'bg-emerald-500 text-slate-950'
                      : isUnlocked
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  제{stage.stageNum}방
                </span>

                <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                  {solvedInStage}/{stagePuzzleIds.length}
                  {isCleared ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isUnlocked ? (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </span>
              </div>

              {/* Room Title */}
              <div className="font-bold text-xs sm:text-sm text-white truncate">
                {stage.name.replace(/^제\d방:\s*/, '')}
              </div>
              {isExpandedModal && (
                <div className="text-[11px] text-emerald-300/90 truncate mt-0.5">{stage.chineseTitle}</div>
              )}

              {/* Avatars currently inside this room */}
              {playersInRoom.length > 0 && (
                <div className="mt-1.5 flex items-center flex-wrap gap-1 pt-1 border-t border-slate-800">
                  {playersInRoom.map((p) => {
                    const isMe = p.player_uid === myUid;
                    return (
                      <span
                        key={p.player_uid}
                        title={`${p.nickname}${isMe ? ' (나)' : ''}`}
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                          isMe
                            ? 'bg-amber-400/20 text-amber-200 border border-amber-400/50'
                            : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        <span>{getAvatarEmoji(p.avatar_id)}</span>
                        <span className="max-w-[44px] truncate">{p.nickname}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Stage Quick Jump Bar below map */}
      <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2">
        {ESCAPE_STAGES.map((stage) => {
          const isUnlocked = unlockedStages.includes(stage.stageNum);
          const stagePuzzleIds = stage.puzzles.map((p) => p.id);
          const solvedInStage = stagePuzzleIds.filter((id) => solvedPuzzles.includes(id)).length;
          const isCleared = solvedInStage === stagePuzzleIds.length;
          const isCurrentView = activeViewStage === stage.stageNum;

          return (
            <button
              key={`jump-${stage.stageNum}`}
              type="button"
              disabled={!isUnlocked}
              onClick={() => isUnlocked && onSelectStage(stage.stageNum)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                isCurrentView
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                  : isCleared
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/50 cursor-pointer'
                  : isUnlocked
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800 cursor-pointer'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-500 cursor-not-allowed'
              }`}
            >
              <div className="text-[11px] sm:text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>제{stage.stageNum}방</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate w-full mt-0.5">
                {isCleared ? '클리어 완료' : isUnlocked ? `단서 ${solvedInStage}/3` : '잠김'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
