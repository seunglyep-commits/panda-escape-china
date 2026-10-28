import React, { useState } from 'react';
import { PuzzleHotspot } from '../data/escapeData';
import { Volume2, BookOpen, CheckCircle2, AlertCircle, Sparkles, KeyRound, X } from 'lucide-react';

interface PuzzleModalProps {
  puzzle: PuzzleHotspot;
  isSolved: boolean;
  canSolveFinal: boolean;
  onClose: () => void;
  onSolveSuccess: (puzzle: PuzzleHotspot) => Promise<void>;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  puzzle,
  isSolved,
  canSolveFinal,
  onClose,
  onSolveSuccess,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(isSolved ? puzzle.correctOptionId : null);
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
    if (!selectedOption || submitting) return;

    if (puzzle.isStageFinal && !canSolveFinal && !isSolved) {
      setFeedback({
        type: 'error',
        message: '이 방의 앞선 2개 단서를 먼저 조사해 해결해야 최종 잠금장치를 열 수 있습니다!',
      });
      return;
    }

    if (selectedOption === puzzle.correctOptionId) {
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
        message: '아쉬워요! 위쪽의 [📘 교과서 핵심 단서 노트]를 읽고 다시 한번 알맞은 표현을 골라 보세요!',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-emerald-500/40 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden my-auto">
        {/* Top Banner */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{puzzle.iconEmoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {puzzle.lessonRef}
                </span>
                {puzzle.isStageFinal && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    🔑 방 탈출 최종 잠금장치
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">{puzzle.title}</h3>
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
          {/* Story Context */}
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 text-sm text-slate-200 leading-relaxed">
            {puzzle.storyContext}
          </div>

          {/* Textbook Clue Box (Easy Hint Always Provided!) */}
          <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between gap-2">
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

          {/* Warning if Final Puzzle locked */}
          {puzzle.isStageFinal && !canSolveFinal && !isSolved && (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                이 방의 다른 두 단서를 먼저 해결해야 최종 잠금장치를 작동할 수 있습니다! 팀원들과 함께 앞의 단서를 먼저 풀어 보세요.
              </span>
            </div>
          )}

          {/* Quiz Question */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="font-bold text-base sm:text-lg text-white flex items-start gap-2">
              <span className="text-amber-400 shrink-0">Q.</span>
              <span>{puzzle.question}</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {puzzle.options.map((opt, idx) => {
                const isSelected = selectedOption === opt.id;
                const isCorrectAnswer = isSolved && opt.id === puzzle.correctOptionId;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOption(opt.id)}
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
                <div className="space-y-1">
                  <div className="font-bold">{feedback.message}</div>
                  {feedback.type === 'success' && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-slate-900/80 px-2.5 py-1 rounded-lg mt-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>획득 보상: {puzzle.rewardItemName}</span>
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
                  disabled={!selectedOption || submitting || (puzzle.isStageFinal && !canSolveFinal)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  {submitting ? '암호 해독 중...' : '암호 입력 및 단서 해독!'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm cursor-pointer"
                >
                  해독 완료! 방으로 돌아가기
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
