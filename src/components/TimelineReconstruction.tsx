import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CaseData } from '../types';
import { Clock, RotateCcw, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { sounds } from '../utils/sound';

interface TimelineReconstructionProps {
  caseData: CaseData;
  onCompleteTimeline: (isPerfectOrder: boolean) => void;
}

export const TimelineReconstruction: React.FC<TimelineReconstructionProps> = ({
  caseData,
  onCompleteTimeline,
}) => {
  const { correctOrder, cards } = caseData.timeline;
  const cardKeys = Object.keys(cards);

  // Shuffled options
  const [availableKeys, setAvailableKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);

  useEffect(() => {
    // Shuffle card keys on mount
    const shuffled = [...cardKeys].sort(() => Math.random() - 0.5);
    setAvailableKeys(shuffled);
  }, []);

  const handleSelectCard = (key: string) => {
    sounds.playPop();
    setErrorMsg(null);
    setAvailableKeys((prev) => prev.filter((k) => k !== key));
    setSelectedKeys((prev) => [...prev, key]);
  };

  const handleDeselectCard = (key: string) => {
    sounds.playPop();
    setErrorMsg(null);
    setSelectedKeys((prev) => prev.filter((k) => k !== key));
    setAvailableKeys((prev) => [...prev, key]);
  };

  const handleReset = () => {
    sounds.playPop();
    setErrorMsg(null);
    const shuffled = [...cardKeys].sort(() => Math.random() - 0.5);
    setAvailableKeys(shuffled);
    setSelectedKeys([]);
  };

  const handleVerify = () => {
    const isCorrect =
      selectedKeys.length === correctOrder.length &&
      selectedKeys.every((key, idx) => key === correctOrder[idx]);

    if (isCorrect) {
      sounds.playSuccess();
      onCompleteTimeline(attempts === 0);
    } else {
      sounds.playError();
      setAttempts((prev) => prev + 1);
      setErrorMsg('Incorrect timeline order! Reset and try rearranging events in true order.');
    }
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 pb-12 font-sans flex flex-col justify-between max-w-xl mx-auto">
      <div>
        {/* Step Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-amber-500/30 rounded-2xl p-3 mb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
              Phase 3 of 4 • Timeline Reconstruction
            </span>
            <h2 className="text-base font-bold text-amber-100 font-sans">Arrange Event Order</h2>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>{selectedKeys.length} / 5 Cards</span>
          </div>
        </div>

        {/* Selected Sequence Slots */}
        <div className="bg-slate-900 border-2 border-amber-500/30 rounded-3xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              1. Chronological Timeline (Click to remove)
            </span>
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-slate-400 hover:text-amber-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="flex flex-col gap-2 min-h-[220px]">
            {selectedKeys.map((key, idx) => (
              <motion.div
                key={key}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => handleDeselectCard(key)}
                className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-amber-500/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-medium text-amber-100">{cards[key]}</span>
                </div>
                <span className="text-xs text-amber-400 font-bold">Remove</span>
              </motion.div>
            ))}

            {selectedKeys.length === 0 && (
              <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs text-center p-4">
                Tap cards below in the order they occurred.
              </div>
            )}
          </div>
        </div>

        {/* Error Feedback Banner */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl mb-4 font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* Available Pool */}
        {availableKeys.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              2. Available Event Cards
            </span>
            <div className="flex flex-col gap-2">
              {availableKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => handleSelectCard(key)}
                  className="bg-slate-800 border border-slate-700 hover:border-amber-400 text-left rounded-xl p-3 text-xs text-slate-200 hover:bg-slate-700/80 transition-colors flex items-center justify-between"
                >
                  <span>{cards[key]}</span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    + Select
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Verify Button */}
      <button
        disabled={selectedKeys.length < 5}
        onClick={handleVerify}
        className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
          selectedKeys.length === 5
            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
        }`}
      >
        <span>Verify Event Timeline</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
