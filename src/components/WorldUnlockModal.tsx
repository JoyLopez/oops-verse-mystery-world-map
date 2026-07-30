import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WorldData, PlayerProfile } from '../types';
import { sounds } from '../utils/sound';
import { Key, Sparkles, Award, Star, Clock, Lock, Unlock, ArrowRight } from 'lucide-react';

interface WorldUnlockModalProps {
  completedWorld: WorldData;
  nextWorld: WorldData | null;
  profile: PlayerProfile;
  onClose: () => void;
}

export const WorldUnlockModal: React.FC<WorldUnlockModalProps> = ({
  completedWorld,
  nextWorld,
  profile,
  onClose,
}) => {
  const [step, setStep] = useState<'stats' | 'key-cutscene' | 'unlocked'>('stats');

  useEffect(() => {
    sounds.playWorldUnlockFanfare();
  }, []);

  // Compute stats for completed world
  const worldCaseIds = completedWorld.cases.map((c) => c.id);
  const solvedWorldCases = worldCaseIds.filter((id) => profile.solvedCases[id]);
  const casesSolvedCount = solvedWorldCases.length;
  const starsEarned = solvedWorldCases.reduce(
    (sum, id) => sum + (profile.solvedCases[id]?.stars || 0),
    0
  );
  const secretsFound = solvedWorldCases.filter(
    (id) => profile.solvedCases[id]?.secretFound
  ).length;
  const totalTimeSeconds = solvedWorldCases.reduce(
    (sum, id) => sum + (profile.solvedCases[id]?.timeSeconds || 0),
    0
  );

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  const handleProceedToCutscene = () => {
    sounds.playPop();
    setStep('key-cutscene');

    setTimeout(() => {
      sounds.playSecretFound();
      setStep('unlocked');
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <AnimatePresence mode="wait">
        {step === 'stats' && (
          <motion.div
            key="stats"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

            <motion.div
              initial={{ rotate: -10, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.6 }}
              className="text-6xl mb-3 inline-block filter drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
            >
              🎉
            </motion.div>

            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 font-sans mb-1">
              World Complete!
            </h2>
            <p className="text-amber-200/80 font-medium text-sm mb-6">
              You solved all 10 cases in {completedWorld.name}!
            </p>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col items-center">
                <span className="text-amber-400 text-xs font-semibold mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Cases Solved
                </span>
                <span className="text-2xl font-black text-amber-100">{casesSolvedCount} / 10</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col items-center">
                <span className="text-yellow-400 text-xs font-semibold mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" /> Stars Earned
                </span>
                <span className="text-2xl font-black text-yellow-200">{starsEarned} / 30</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col items-center">
                <span className="text-emerald-400 text-xs font-semibold mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Secrets Found
                </span>
                <span className="text-2xl font-black text-emerald-200">{secretsFound} / 10</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col items-center">
                <span className="text-blue-400 text-xs font-semibold mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Total Time
                </span>
                <span className="text-xl font-black text-blue-200">{formatTime(totalTimeSeconds)}</span>
              </div>
            </div>

            {/* Rewards */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 text-left">
              <span className="text-amber-300 font-bold text-xs uppercase tracking-wider block mb-2">
                🎁 World Completion Rewards
              </span>
              <div className="flex items-center justify-between text-sm font-semibold text-amber-100">
                <span className="flex items-center gap-1">🪙 +500 Gold Coins</span>
                <span className="flex items-center gap-1">✨ +500 Detective XP</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCutscene}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 text-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Unlock Next World</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 'key-cutscene' && (
          <motion.div
            key="key-cutscene"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[360px]"
          >
            {/* Animated Magic Key */}
            <div className="relative mb-6">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
                className="w-24 h-24 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.8)] text-slate-950"
              >
                <Key className="w-12 h-12" />
              </motion.div>

              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 2, delay: 0.5 }}
                className="absolute inset-0 rounded-full border-4 border-amber-400"
              />
            </div>

            <motion.h3
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-xl font-bold text-amber-300 font-sans mb-2"
            >
              🗝️ Unlocking {nextWorld ? nextWorld.name : 'Next World'}...
            </motion.h3>
            <p className="text-sm text-slate-400">Clouds dissipating from the World Map...</p>
          </motion.div>
        )}

        {step === 'unlocked' && (
          <motion.div
            key="unlocked"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
              className="text-6xl mb-3 inline-block"
            >
              {nextWorld ? nextWorld.emoji : '🏆'}
            </motion.div>

            <h3 className="text-2xl font-black text-emerald-300 font-sans mb-1">
              {nextWorld ? `${nextWorld.name} Unlocked!` : 'All Worlds Completed!'}
            </h3>
            <p className="text-slate-300 text-sm mb-6">
              {nextWorld ? nextWorld.desc : 'You are now a Master Detective across all dimensions!'}
            </p>

            {/* Detective Oops Speech Bubble */}
            <div className="bg-slate-800/90 border border-amber-500/40 rounded-2xl p-4 mb-6 text-left relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xl">
                  🕵️‍♂️
                </div>
                <div>
                  <span className="font-bold text-sm text-amber-300 block">Detective Oops</span>
                  <span className="text-[10px] text-amber-200/60 uppercase tracking-wider">Chief Partner</span>
                </div>
              </div>
              <p className="text-xs text-amber-100 italic leading-relaxed">
                "Another mystery solved! A new destination has appeared on the map. I wonder what kind of disaster awaits us next..."
              </p>
            </div>

            <button
              onClick={() => {
                sounds.playPop();
                onClose();
              }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/20 text-lg transition-transform active:scale-95"
            >
              Explore World Map
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
