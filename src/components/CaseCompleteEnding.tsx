import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CaseData } from '../types';
import { Star, Award, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/sound';

interface CaseCompleteEndingProps {
  caseData: CaseData;
  starsEarned: number;
  secretFound: boolean;
  onFinishCase: () => void;
}

export const CaseCompleteEnding: React.FC<CaseCompleteEndingProps> = ({
  caseData,
  starsEarned,
  secretFound,
  onFinishCase,
}) => {
  useEffect(() => {
    sounds.playCaseSolved();
  }, []);

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 pb-12 font-sans flex flex-col justify-between max-w-xl mx-auto relative overflow-hidden">
      <div className="text-center">
        {/* Confetti Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-7xl mb-3 inline-block filter drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]"
        >
          {caseData.emoji}
        </motion.div>

        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 font-sans mb-1">
          Case Closed!
        </h2>
        <p className="text-amber-200/80 text-sm font-semibold mb-6">{caseData.title}</p>

        {/* Stars Rating */}
        <div className="flex items-center justify-center gap-2 mb-6 bg-slate-900 border border-amber-500/30 rounded-2xl py-3 px-6 w-fit mx-auto shadow-lg">
          {[1, 2, 3].map((starNum) => (
            <motion.div
              key={starNum}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: starNum * 0.2, type: 'spring' }}
            >
              <Star
                className={`w-8 h-8 ${
                  starNum <= starsEarned
                    ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]'
                    : 'text-slate-800'
                }`}
              />
            </motion.div>
          ))}
        </div>

        {/* Badge & Rewards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
            <Award className="w-6 h-6 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Badge Unlocked
            </span>
            <span className="text-xs font-bold text-amber-200 mt-0.5">{caseData.badge}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
            <Sparkles className="w-6 h-6 text-yellow-400 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Rewards Earned
            </span>
            <span className="text-xs font-bold text-yellow-200 mt-0.5">🪙 +100 / ✨ +100 XP</span>
          </div>
        </div>

        {/* Story Resolution Cards */}
        <div className="bg-slate-900 border-2 border-amber-500/30 rounded-3xl p-5 mb-6 text-left space-y-3 shadow-xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
            Case Resolution File
          </span>

          <p className="text-xs text-slate-300 leading-relaxed">
            1. {caseData.ending[1]}
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            2. {caseData.ending[2]}
          </p>
          <p className="text-xs text-amber-200 font-semibold leading-relaxed">
            3. {caseData.ending[3]}
          </p>
        </div>

        {secretFound && (
          <div className="bg-purple-500/20 border border-purple-500/40 rounded-2xl p-3 mb-6 text-xs text-purple-200 font-semibold flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>Found Hidden Secret Item! (+50 Bonus Gold Coins)</span>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          sounds.playPop();
          onFinishCase();
        }}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 text-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
      >
        <span>Continue Investigation</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
