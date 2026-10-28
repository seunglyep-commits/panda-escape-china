import React, { useState } from 'react';
import { TEXTBOOK_VOCAB_SHEET } from '../data/escapeData';
import { BookOpen, Volume2, X } from 'lucide-react';

interface TextbookGuideModalProps {
  onClose: () => void;
}

export const TextbookGuideModal: React.FC<TextbookGuideModalProps> = ({ onClose }) => {
  const [filterLesson, setFilterLesson] = useState<string>('전체');

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  };

  const lessons = ['전체', '1과', '1과 문화', '2과', '2과 문화', '3과'];
  const filtered =
    filterLesson === '전체'
      ? TEXTBOOK_VOCAB_SHEET
      : TEXTBOOK_VOCAB_SHEET.filter((item) => item.lesson === filterLesson);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-emerald-500/40 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                중학교 중국어 교과서 (미래엔 1~3과) 핵심 단서 사전
              </h3>
              <p className="text-xs text-slate-400">
                방탈출 문제를 풀다가 막히면 언제든 이곳에서 1~3과 표현과 발음을 확인하세요!
              </p>
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

        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {lessons.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterLesson(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterLesson === tab
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Vocab Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 flex items-start justify-between gap-3 hover:border-emerald-500/40 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.lesson}
                    </span>
                    <span className="font-bold text-amber-300 text-sm">{item.pinyin}</span>
                  </div>
                  <div className="text-base font-extrabold text-white">
                    {item.hanzi} <span className="text-slate-300 font-semibold text-sm">— {item.meaning}</span>
                  </div>
                  <div className="text-xs text-slate-400">💡 {item.tip}</div>
                </div>

                <button
                  type="button"
                  onClick={() => speak(item.hanzi.split('↔')[0].split('/')[0])}
                  title="발음 듣기"
                  className="p-2 rounded-xl bg-slate-700/80 hover:bg-emerald-500/30 text-emerald-300 shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
