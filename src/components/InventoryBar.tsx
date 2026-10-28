import React, { useState } from 'react';
import { InventoryItem } from '../data/escapeData';
import { Backpack, KeyRound, Eye, Sparkles, X, Check, Layers } from 'lucide-react';

interface InventoryBarProps {
  items: InventoryItem[];
  selectedItemId: string | null;
  onSelectItem: (item: InventoryItem | null) => void;
  currentStage: number;
}

export const InventoryBar: React.FC<InventoryBarProps> = ({
  items,
  selectedItemId,
  onSelectItem,
  currentStage,
}) => {
  const [inspectingItem, setInspectingItem] = useState<InventoryItem | null>(null);
  const [combineMode, setCombineMode] = useState<boolean>(false);
  const [combineFirstItem, setCombineFirstItem] = useState<InventoryItem | null>(null);
  const [combinedBanner, setCombinedBanner] = useState<string | null>(null);

  const selectedItem = items.find((i) => i.id === selectedItemId) || null;

  const handleSlotClick = (item: InventoryItem) => {
    if (combineMode) {
      if (!combineFirstItem) {
        setCombineFirstItem(item);
        setCombinedBanner(`[${item.name}] 선택됨! 조합할 두 번째 아이템을 클릭하세요.`);
        return;
      }
      if (combineFirstItem.id === item.id) {
        setCombineFirstItem(null);
        setCombinedBanner(null);
        return;
      }

      // Allow combining any two clue notes or keys to synthesize a combined clue summary!
      setCombinedBanner(
        `✨ 조합 완료! [${combineFirstItem.name}] + [${item.name}] → 마스터 단서 결합: "${combineFirstItem.shortDesc} & ${item.shortDesc}" (현재 장착됨!)`
      );
      onSelectItem(item);
      setCombineFirstItem(null);
      setCombineMode(false);
      return;
    }

    // Toggle item selection (equip / unequip)
    if (selectedItemId === item.id) {
      onSelectItem(null);
    } else {
      onSelectItem(item);
    }
  };

  // Sort so current stage items appear first, followed by other collected items
  const sortedItems = [...items].sort((a, b) => {
    if (a.stageNum === currentStage && b.stageNum !== currentStage) return -1;
    if (a.stageNum !== currentStage && b.stageNum === currentStage) return 1;
    return b.stageNum - a.stageNum;
  });

  return (
    <div className="rounded-3xl border border-amber-500/40 bg-slate-900/95 p-4 shadow-2xl">
      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Backpack className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                단서 & 열쇠 인벤토리 ({items.length}개 보유)
              </h3>
              {selectedItem ? (
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> [{selectedItem.icon} {selectedItem.name}] 활성화됨 — 잠긴 곳을 클릭하세요!
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  아이템을 클릭해 활성화(선택)한 뒤 방 안의 잠긴 서랍·금고를 클릭하세요!
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {items.length >= 2 && (
            <button
              type="button"
              onClick={() => {
                setCombineMode((prev) => !prev);
                setCombineFirstItem(null);
                setCombinedBanner(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                combineMode
                  ? 'bg-purple-500 text-white border-purple-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{combineMode ? '조합 모드 취소' : '아이템 조합하기'}</span>
            </button>
          )}

          {selectedItem && (
            <button
              type="button"
              onClick={() => onSelectItem(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              장착 해제
            </button>
          )}
        </div>
      </div>

      {combinedBanner && (
        <div className="mb-3 px-3.5 py-2 rounded-xl bg-purple-950/70 border border-purple-400/50 text-purple-200 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
            <span>{combinedBanner}</span>
          </span>
          <button
            type="button"
            onClick={() => setCombinedBanner(null)}
            className="text-[11px] text-purple-300 hover:text-white cursor-pointer"
          >
            닫기
          </button>
        </div>
      )}

      {/* Inventory Slots Grid */}
      {sortedItems.length === 0 ? (
        <div className="py-5 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-950/60 text-center text-xs sm:text-sm text-slate-400">
          아직 획득한 아이템이 없습니다. 위 방 화면에서 <strong className="text-amber-300">반짝이는 오브젝트(마이크, 선반, 키오스크 등)</strong>를 클릭해 첫 번째 열쇠나 도구를 찾아보세요!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {sortedItems.map((item) => {
            const isSelected = selectedItemId === item.id;
            const isCombineFirst = combineFirstItem?.id === item.id;
            const isCurrentStageItem = item.stageNum === currentStage;

            return (
              <div
                key={item.id}
                onClick={() => handleSlotClick(item)}
                className={`group relative rounded-2xl border p-3 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-500/30 to-orange-600/20 border-2 border-amber-400 ring-2 ring-amber-400/40 scale-[1.02] shadow-lg shadow-amber-500/20'
                    : isCombineFirst
                    ? 'bg-purple-500/25 border-2 border-purple-400'
                    : isCurrentStageItem
                    ? 'bg-slate-950/90 border-emerald-500/40 hover:border-amber-400/70'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-85 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-3xl">{item.icon}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.stageNum}방
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingItem(item);
                        }}
                        title="아이템 자세히 보기"
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="font-extrabold text-xs sm:text-sm text-white mt-2 line-clamp-1">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                    {item.shortDesc}
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-extrabold">
                  {isSelected ? (
                    <span className="text-amber-300 flex items-center gap-1">
                      <KeyRound className="w-3 h-3" /> 손에 장착됨 ✓
                    </span>
                  ) : (
                    <span className="text-emerald-400 group-hover:text-amber-300">클릭하여 장착/사용</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail Inspection Popup */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-amber-400/50 bg-slate-900 p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{inspectingItem.icon}</span>
                <div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    제{inspectingItem.stageNum}방 획득 아이템
                  </span>
                  <h4 className="text-lg font-black text-white mt-0.5">{inspectingItem.name}</h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed">
              {inspectingItem.detailNote}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectItem(inspectingItem);
                  setInspectingItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
              >
                이 아이템 장착하기 (선택)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
