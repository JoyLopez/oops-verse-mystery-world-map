import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CaseData, Culprit } from '../types';
import { ShieldAlert, Check, X, Award, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/sound';

interface CulpritNamingProps {
  caseData: CaseData;
  onCompleteCulprit: (isCorrectFirstTry: boolean) => void;
}

export const CulpritNaming: React.FC<CulpritNamingProps> = ({
  caseData,
  onCompleteCulprit,
}) => {
  const [selectedCulprit, setSelectedCulprit] = useState<Culprit | null>(null);
  const [wrongMessage, setWrongMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);

  const handleConfirmAccusation = () => {
    if (!selectedCulprit) return;

    if (selectedCulprit.isCorrect) {
      sounds.playCaseSolved();
      setIsSolved(true);

      setTimeout(() => {
        onCompleteCulprit(attempts === 0);
      }, 2200);
    } else {
      sounds.playError();
      setAttempts((prev) => prev + 1);
      setWrongMessage(selectedCulprit.wrongMessage);
    }
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 pb-12 font-sans flex flex-col justify-between max-w-xl mx-auto relative overflow-hidden">
      {/* SOLVED STAMP ANIMATION */}
      <AnimatePresence>
        {isSolved && (
          <motion.div
            initial={{ scale: 3, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <div className="border-8 border-emerald-500 text-emerald-400 font-black text-5xl md:text-6xl px-8 py-4 rounded-3xl uppercase tracking-widest shadow-[0_0_50px_rgba(16,185,129,0.5)] font-mono bg-slate-950/90 text-center">
              CASE SOLVED!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        {/* Step Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-amber-500/30 rounded-2xl p-3 mb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
              Phase 4 of 4 • Name the Culprit
            </span>
            <h2 className="text-base font-bold text-amber-100 font-sans">{caseData.title}</h2>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-rose-300 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Final Accusation</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 bg-slate-900 p-3 rounded-xl border border-slate-800">
          Based on the evidence, witness statement, and reconstructed timeline — who caused this mystery?
        </p>

        {/* Suspects Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {caseData.culprits.map((culprit) => {
            const isSelected = selectedCulprit?.id === culprit.id;

            return (
              <motion.div
                key={culprit.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sounds.playPop();
                  setWrongMessage(null);
                  setSelectedCulprit(culprit);
                }}
                className={`rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-5xl mb-2">{culprit.emoji}</div>
                <h3 className="font-bold text-sm text-amber-100 font-sans">{culprit.name}</h3>
                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
                  Suspect #{culprit.id}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Wrong Accusation Banner */}
        {wrongMessage && (
          <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl mb-4 font-semibold text-center">
            ❌ {wrongMessage}
          </div>
        )}
      </div>

      {/* Accuse Button */}
      <button
        disabled={!selectedCulprit || isSolved}
        onClick={handleConfirmAccusation}
        className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
          selectedCulprit && !isSolved
            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
        }`}
      >
        <span>Arrest Suspect</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
