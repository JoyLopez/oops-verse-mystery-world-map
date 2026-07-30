import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CaseData, Clue } from '../types';
import { Search, Sparkles, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/sound';

interface CaseInvestigationProps {
  caseData: CaseData;
  onCompleteInvestigation: (foundClues: string[], secretFound: boolean) => void;
}

export const CaseInvestigation: React.FC<CaseInvestigationProps> = ({
  caseData,
  onCompleteInvestigation,
}) => {
  const [foundClueIds, setFoundClueIds] = useState<string[]>([]);
  const [secretFound, setSecretFound] = useState<boolean>(false);
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);

  const requiredClueIds = Object.keys(caseData.clues).filter((id) => id !== 'secret');
  const requiredCollectedCount = requiredClueIds.filter((id) =>
    foundClueIds.includes(id)
  ).length;
  const isAllRequiredFound = requiredCollectedCount >= requiredClueIds.length;

  const handleHotspotClick = (clueId: string) => {
    const clue = caseData.clues[clueId];
    if (!clue) return;

    if (!foundClueIds.includes(clueId)) {
      setFoundClueIds((prev) => [...prev, clueId]);
      if (clue.isSecret) {
        setSecretFound(true);
        sounds.playSecretFound();
      } else {
        sounds.playClueFound();
      }
    } else {
      sounds.playPop();
    }

    setSelectedClue(clue);
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 pb-12 font-sans flex flex-col justify-between max-w-xl mx-auto">
      <div>
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-amber-500/30 rounded-2xl p-3 mb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
              Phase 1 of 4 • Investigation
            </span>
            <h2 className="text-base font-bold text-amber-100 font-sans">{caseData.title}</h2>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            <Search className="w-3.5 h-3.5" />
            <span>
              {requiredCollectedCount} / {requiredClueIds.length} Clues
            </span>
          </div>
        </div>

        {/* Interactive Crime Scene Frame */}
        <div
          className="relative h-64 rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl mb-4 flex items-center justify-center select-none"
          style={{
            background: `linear-gradient(135deg, ${caseData.scene.bgGradient.join(', ')})`,
          }}
        >
          {/* Main Scene Emoji */}
          <div className="text-8xl filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] animate-bounce">
            {caseData.scene.mainEmoji}
          </div>

          {/* Decor Emojis */}
          {caseData.scene.decorEmojis.map((emoji, idx) => (
            <div
              key={idx}
              className="absolute text-2xl opacity-60 animate-pulse"
              style={{
                top: `${15 + idx * 25}%`,
                left: `${10 + idx * 35}%`,
              }}
            >
              {emoji}
            </div>
          ))}

          {/* Hotspots */}
          {caseData.hotspots.map((spot, idx) => {
            const isFound = foundClueIds.includes(spot.clueId);
            const isSecret = spot.clueId === 'secret';
            const clueObj = caseData.clues[spot.clueId];

            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleHotspotClick(spot.clueId)}
                className={`absolute w-11 h-11 rounded-full border-2 flex items-center justify-center text-lg shadow-lg cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-colors ${
                  isFound
                    ? 'bg-emerald-500/90 border-emerald-300 text-slate-950'
                    : isSecret
                    ? 'bg-purple-500/80 border-purple-300 text-white animate-pulse'
                    : 'bg-amber-400/90 border-white text-slate-950 animate-ping-slow'
                }`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                {clueObj?.icon || '🔍'}
              </motion.button>
            );
          })}
        </div>

        {/* Evidence Chips Strip */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Collected Evidence Case File
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {requiredClueIds.map((id) => {
              const clue = caseData.clues[id];
              const isFound = foundClueIds.includes(id);

              return (
                <div
                  key={id}
                  className={`flex-shrink-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                    isFound
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-slate-800 border-dashed border-slate-700 text-slate-600'
                  }`}
                >
                  {isFound ? clue.icon : '❓'}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center italic mb-4">
          Tap the glowing hotspots in the scene to inspect and gather clues.
        </p>
      </div>

      {/* Continue Button */}
      <button
        disabled={!isAllRequiredFound}
        onClick={() => {
          sounds.playSuccess();
          onCompleteInvestigation(foundClueIds, secretFound);
        }}
        className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
          isAllRequiredFound
            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
        }`}
      >
        <span>Interview Witness</span>
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Clue Inspector Modal */}
      <AnimatePresence>
        {selectedClue && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end justify-center p-4">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 max-w-md w-full text-left shadow-2xl relative"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl p-2 bg-amber-500/10 rounded-2xl border border-amber-500/30">
                  {selectedClue.icon}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-amber-200 font-sans">
                    {selectedClue.title}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 font-mono">
                    {selectedClue.isSecret ? '✨ Secret Discovery' : '🔍 Evidence Logged'}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-4">{selectedClue.desc}</p>

              <div className="bg-amber-500/10 border-l-4 border-amber-400 p-3 rounded-r-xl text-xs italic text-amber-200 mb-6">
                "{selectedClue.note}"
              </div>

              <button
                onClick={() => setSelectedClue(null)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
              >
                Log into Case File
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
