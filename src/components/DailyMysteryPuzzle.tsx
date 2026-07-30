import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile } from '../types';
import { getTodayRiddle, getTodayRiddleDateString, LogicRiddle } from '../data/dailyRiddles';
import {
  ensureDailyPuzzleState,
  submitDailyPuzzleAnswer,
  isDailyPuzzleSolvedToday,
} from '../utils/dailyPuzzle';
import {
  Brain,
  Clock,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Lightbulb,
  AlertCircle,
  Coins,
  Award,
  ChevronRight,
  Flame,
  Check,
  Lock,
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface DailyMysteryPuzzleProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onBackToMap: () => void;
}

export const DailyMysteryPuzzle: React.FC<DailyMysteryPuzzleProps> = ({
  profile,
  onUpdateProfile,
  onBackToMap,
}) => {
  const [currentProfile, setCurrentProfile] = useState<PlayerProfile>(() =>
    ensureDailyPuzzleState(profile)
  );

  const riddle: LogicRiddle = getTodayRiddle();
  const todayStr = getTodayRiddleDateString();

  const isSolved = isDailyPuzzleSolvedToday(currentProfile);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Victory Accomplished State
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [victoryRewards, setVictoryRewards] = useState<{ coins: number; xp: number } | null>(null);

  // Midnight countdown string
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const diffMs = midnight.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeftStr('00h 00m 00s');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeftStr(
        `${hours.toString().padStart(2, '0')}h ${mins
          .toString()
          .padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectOption = (index: number) => {
    if (isSolved) return;
    sounds.playPop();
    setSelectedOption(index);
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    if (selectedOption === null) {
      setErrorMessage('Please select an option before submitting your answer.');
      return;
    }

    const result = submitDailyPuzzleAnswer(currentProfile, selectedOption);
    setCurrentProfile(result.updatedProfile);
    onUpdateProfile(result.updatedProfile);

    if (result.isCorrect) {
      sounds.playWorldUnlockFanfare();
      setVictoryRewards({ coins: result.rewardCoins, xp: result.rewardXp });
      setShowVictoryModal(true);
    } else {
      sounds.playError();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setErrorMessage('Incorrect deduction! Re-examine the clue narrative and try again.');
    }
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 pb-12 max-w-2xl mx-auto font-sans relative">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            sounds.playPop();
            onBackToMap();
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-slate-900 border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to HQ Map</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Next Riddle: {timeLeftStr}</span>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/10">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                Daily Mystery Riddle • {todayStr}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase font-sans mt-1">
              Daily Logic Puzzle
            </h2>
          </div>
        </div>
      </div>

      {/* Already Solved Banner */}
      {isSolved && !showVictoryModal && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-2 border-emerald-500/50 rounded-3xl p-5 mb-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0 text-xl font-black">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Mission Accomplished Today
              </span>
              <h3 className="text-base font-bold text-white">
                You solved today's logic riddle!
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Check back at midnight for tomorrow's unique deduction mystery.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowVictoryModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>View Solution</span>
          </button>
        </motion.div>
      )}

      {/* Riddle Container Card */}
      <motion.div
        animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden mb-6"
      >
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none text-9xl">
          {riddle.icon}
        </div>

        {/* Category & Reward Pill */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5">
            <span>{riddle.icon}</span>
            <span>{riddle.category}</span>
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-xl flex items-center gap-1">
              🪙 +{riddle.rewardCoins} Coins
            </span>
            <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2.5 py-1 rounded-xl flex items-center gap-1">
              ✨ +{riddle.rewardXp} XP
            </span>
          </div>
        </div>

        {/* Riddle Title & Narrative Scenario */}
        <h3 className="text-xl font-black text-white font-sans mb-2">
          {riddle.title}
        </h3>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 mb-4">
          <p className="text-sm text-slate-300 leading-relaxed font-serif italic">
            "{riddle.scenarioText}"
          </p>
        </div>

        {/* Question Prompt */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-amber-200 uppercase tracking-wide flex items-center gap-2 mb-1">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Detective Question:</span>
          </h4>
          <p className="text-base font-bold text-white">{riddle.question}</p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-300 text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Option Choices */}
        <div className="space-y-3 mb-6">
          {riddle.options.map((optionText, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === riddle.correctAnswerIndex;

            return (
              <button
                key={idx}
                disabled={isSolved}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                  isSolved
                    ? isCorrectOption
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold'
                      : 'bg-slate-950/50 border-slate-800 text-slate-500 opacity-60'
                    : isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-white font-bold shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40'
                    : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-950/80'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold font-mono text-xs flex-shrink-0 border mt-0.5 ${
                    isSolved
                      ? isCorrectOption
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-600'
                      : isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>

                <span className="text-sm leading-snug flex-1">{optionText}</span>

                {isSolved && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Hint Drawer & Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              sounds.playPop();
              setShowHint(!showHint);
            }}
            className="text-xs font-bold text-amber-400/90 hover:text-amber-300 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>{showHint ? 'Hide Detective Hint' : 'Need a Clue Hint?'}</span>
          </button>

          {!isSolved ? (
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Submit Answer</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30">
              <Check className="w-4 h-4" />
              <span>Completed</span>
            </div>
          )}
        </div>

        {/* Hint Box Content */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200"
            >
              <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
                <Lightbulb className="w-4 h-4" />
                <span>Detective Field Hint:</span>
              </div>
              <p>{riddle.hint}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mission Accomplished Victory Modal */}
      <AnimatePresence>
        {showVictoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center relative overflow-hidden shadow-2xl"
            >
              {/* Floating sparkles background */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -top-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Victory Icon / Badge */}
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-slate-950 mx-auto flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/30 mb-4 animate-bounce">
                🏆
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">
                Mission Accomplished!
              </span>

              <h3 className="text-2xl font-black text-white font-sans mt-2">
                Daily Mystery Solved!
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Excellent deductive work, Detective {currentProfile.username}! You uncovered the truth behind "{riddle.title}".
              </p>

              {/* Currency Rewards Earned */}
              <div className="flex items-center justify-center gap-4 my-6">
                <div className="bg-amber-500/10 border border-amber-500/30 px-5 py-3 rounded-2xl flex items-center gap-2">
                  <span className="text-2xl">🪙</span>
                  <div className="text-left font-mono">
                    <span className="text-[10px] text-amber-400/80 uppercase font-bold block">Gold Coins</span>
                    <span className="text-lg font-black text-amber-300">+{riddle.rewardCoins}</span>
                  </div>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 px-5 py-3 rounded-2xl flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  <div className="text-left font-mono">
                    <span className="text-[10px] text-cyan-300/80 uppercase font-bold block">Detective XP</span>
                    <span className="text-lg font-black text-cyan-200">+{riddle.rewardXp}</span>
                  </div>
                </div>
              </div>

              {/* Case Explanation */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                  Detective Logic Explanation
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {riddle.explanation}
                </p>
              </div>

              {/* Action Close */}
              <button
                onClick={() => {
                  sounds.playPop();
                  setShowVictoryModal(false);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                Continue Investigation
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
