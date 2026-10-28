import React, { useState, useMemo } from 'react';
import { PuzzleHotspot } from '../data/escapeData';
import { Volume2, BookOpen, CheckCircle2, AlertCircle, Sparkles, KeyRound, X, Search, Shuffle } from 'lucide-react';

interface PuzzleModalProps {
  puzzle: PuzzleHotspot;
  isSolved: boolean;
  canSolveFinal: boolean;
  usedItemName?: string | null;
  onClose: () => void;
  onSolveSuccess: (puzzle: PuzzleHotspot) => Promise<void>;
}

// Fisher-Yates shuffle helper so every time a player opens the modal, options are randomized
function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  puzzle,
  isSolved,
  canSolveFinal,
  usedItemName,
  onClose,
  onSolveSuccess,
}) => {
  // Shuffle options every time the modal opens for a puzzle
  const shuffledOptions = useMemo(() => {
    return shuffleArray(puzzle.options);
  }, [puzzle.id, puzzle.options]);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    isSolved ? puzzle.correctOptionId : null
  );
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    isSolved ? { type: 'success', message: puzzle.successExplanation } : null
  );
  const [submitting, setSubmitting] = useState(false);

  const speakChinese = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId || submitting) return;

    if (puzzle.isStageFinal && !canSolveFinal && !isSolved) {
      setFeedback({
        type: 'error',
        message: '이 방의 앞선 2개 단서를 먼저 조사해 해결해야 최종 잠금장치를 열 수 있습니다!',
      });
      return;
    }

    // Check answer by option ID so shuffled order never breaks correctness verification
    if (selectedOptionId === puzzle.correctOptionId) {
      setSubmitting(true);
      setFeedback({
        type: 'success',
        message: puzzle.successExplanation,
      });
      speakChinese(puzzle.pronunciationText);
      try {
        await onSolveSuccess(puzzle);
      } finally {
        setSubmitting(false);
      }
    } else {
      setFeedback({
        type: 'error',
        message: '오답입니다! 위쪽의 [📘 교과서 핵심 단서 노트]를 다시 읽고 알맞은 중국어 표현을 골라 보세요!',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-emerald-500/40 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden my-auto">
        {/* Top Close-up Inspection Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/90 border border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner">
              {puzzle.iconEmoji}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {puzzle.lessonRef}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Search className="w-3 h-3" /> 오브젝트 정밀 조사
                </span>
                {usedItemName && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/50">
                    ✨ [{usedItemName}] 사용됨!
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">{puzzle.title}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Close-up Object Inspection Box */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-start gap-3.5">
            <div className="text-4xl sm:text-5xl shrink-0 bg-slate-900 p-3 rounded-2xl border border-slate-800">
              {puzzle.iconEmoji}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                🔍 오브젝트 관찰 기록 ({puzzle.objectName})
              </div>
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">{puzzle.inspectVisualDesc}</div>
              <div className="text-xs sm:text-sm text-white font-semibold pt-1">{puzzle.storyContext}</div>
            </div>
          </div>

          {/* Textbook Clue Box (Easy Hint Always Provided!) */}
          <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>{puzzle.clueNoteTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => speakChinese(puzzle.pronunciationText)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-semibold border border-emerald-400/40 transition cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>중국어 발음 듣기 ({puzzle.pronunciationText})</span>
              </button>
            </div>
            <div className="text-xs sm:text-sm text-emerald-100/90 whitespace-pre-line leading-relaxed pl-1">
              {puzzle.clueNoteContent}
            </div>
          </div>

          {/* Quiz Question with Shuffled Options */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="font-bold text-base sm:text-lg text-white flex items-start gap-2">
                <span className="text-amber-400 shrink-0">Q.</span>
                <span>{puzzle.question}</span>
              </div>
              <span
                title="보기가 열릴 때마다 무작위로 섞입니다"
                className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700"
              >
                <Shuffle className="w-3 h-3 text-emerald-400" /> 보기 자동 셔플됨
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {shuffledOptions.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                const isCorrectAnswer = isSolved && opt.id === puzzle.correctOptionId;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isCorrectAnswer
                        ? 'bg-emerald-500/25 border-emerald-400 text-white ring-2 ring-emerald-400/50'
                        : isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/40'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected || isCorrectAnswer
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-sm sm:text-base">{opt.label}</div>
                        {opt.subLabel && <div className="text-xs text-slate-400 mt-0.5">{opt.subLabel}</div>}
                      </div>
                    </div>

                    {(isSelected || isCorrectAnswer) && (
                      <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback message */}
            {feedback && (
              <div
                className={`p-4 rounded-2xl border text-sm leading-relaxed flex items-start gap-3 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100'
                    : 'bg-rose-500/20 border-rose-400/50 text-rose-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <Sparkles className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1.5">
                  <div className="font-bold">{feedback.message}</div>
                  {feedback.type === 'success' && (
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-amber-400/40 mt-1">
                      <KeyRound className="w-4 h-4" />
                      <span>인벤토리 획득 아이템: {puzzle.rewardItem.icon} {puzzle.rewardItem.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold cursor-pointer"
              >
                닫기
              </button>

              {!isSolved ? (
                <button
                  type="submit"
                  disabled={!selectedOptionId || submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  {submitting ? '암호 해독 중...' : '암호 입력 및 아이템 획득!'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm cursor-pointer"
                >
                  조사 완료! 방으로 돌아가기
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
