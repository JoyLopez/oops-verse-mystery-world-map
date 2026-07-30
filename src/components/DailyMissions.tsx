import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile, DailyMission } from '../types';
import {
  ensureDailyMissions,
  claimMissionReward,
  claimDailyBonus,
  getTodayDateString,
} from '../utils/missions';
import {
  Target,
  Clock,
  Sparkles,
  CheckCircle2,
  Gift,
  ArrowLeft,
  ChevronRight,
  Flame,
  ShieldCheck,
  Zap,
  Star,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface DailyMissionsProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onBackToMap: () => void;
  onGoToCases: () => void;
}

export const DailyMissions: React.FC<DailyMissionsProps> = ({
  profile,
  onUpdateProfile,
  onBackToMap,
  onGoToCases,
}) => {
  const [currentProfile, setCurrentProfile] = useState<PlayerProfile>(() =>
    ensureDailyMissions(profile)
  );
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  // Time remaining until midnight countdown
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

  const ensuredProfile = ensureDailyMissions(currentProfile);
  const missionsState = ensuredProfile.dailyMissionsState;
  const missions: DailyMission[] = missionsState?.missions || [];
  const bonusClaimed = missionsState?.bonusClaimed || false;

  const completedCount = missions.filter((m) => m.completed).length;
  const allCompleted = missions.length > 0 && completedCount === missions.length;
  const allClaimed = missions.length > 0 && missions.every((m) => m.claimed);

  const handleClaim = (mission: DailyMission) => {
    sounds.playSuccess();
    const updated = claimMissionReward(ensuredProfile, mission.id);
    setCurrentProfile(updated);
    onUpdateProfile(updated);

    setClaimedNotice(`Claimed: +${mission.rewardCoins} Coins & +${mission.rewardXp} XP!`);
    setTimeout(() => setClaimedNotice(null), 3000);
  };

  const handleClaimBonus = () => {
    sounds.playWorldUnlockFanfare();
    const updated = claimDailyBonus(ensuredProfile);
    setCurrentProfile(updated);
    onUpdateProfile(updated);

    setClaimedNotice('✨ HQ Daily Bonus Claimed: +200 Coins & +300 XP!');
    setTimeout(() => setClaimedNotice(null), 3500);
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 pb-12 max-w-2xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            sounds.playPop();
            onBackToMap();
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-slate-900 border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to HQ Map</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Reset in {timeLeftStr}</span>
        </div>
      </div>

      {/* Main Title & Description */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
              Daily Missions
            </h2>
            <p className="text-xs text-slate-400">
              Complete daily field objectives to earn bonus currency, XP, and unlock HQ rewards.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {claimedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{claimedNotice}</span>
            </div>
            <ShieldCheck className="w-4 h-4 text-slate-950" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overall Daily Progress Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              Field Progress • {getTodayDateString()}
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              {completedCount} of {missions.length} Missions Complete
            </h3>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-slate-400 block text-[10px] uppercase">Login Streak</span>
            <span className="text-amber-400 font-bold flex items-center justify-end gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              {ensuredProfile.loginStreak || 1} Days
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5 mb-2">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-500"
            style={{
              width: `${missions.length > 0 ? (completedCount / missions.length) * 100 : 0}%`,
            }}
          />
        </div>

        <p className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>Complete all 3 missions to unlock the Daily HQ Bonus chest!</span>
          <span className="font-mono text-amber-300 font-bold">
            {Math.round((completedCount / (missions.length || 1)) * 100)}%
          </span>
        </p>
      </div>

      {/* Missions List */}
      <div className="space-y-4 mb-8">
        {missions.map((mission, index) => {
          const progressPercent = Math.min(
            100,
            Math.round((mission.currentCount / mission.targetCount) * 100)
          );

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`p-5 rounded-3xl border transition-all relative ${
                mission.claimed
                  ? 'bg-slate-950/70 border-slate-800/60 opacity-75'
                  : mission.completed
                  ? 'bg-gradient-to-r from-slate-900 via-amber-500/10 to-slate-900 border-amber-500/50 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/30'
                  : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border ${
                      mission.completed
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    {mission.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-white truncate">{mission.title}</h4>
                      {mission.completed && (
                        <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{mission.desc}</p>

                    {/* Reward Pills */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                        🪙 +{mission.rewardCoins} Coins
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                        ✨ +{mission.rewardXp} XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress & Action Controls */}
                <div className="flex flex-col sm:items-end justify-center gap-2 min-w-[130px] flex-shrink-0">
                  <div className="w-full sm:w-32 bg-slate-950 h-2.5 rounded-full border border-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        mission.completed ? 'bg-emerald-400' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <span className="text-[11px] font-mono font-bold text-slate-400 text-right">
                    {mission.currentCount} / {mission.targetCount}
                  </span>

                  {/* Button state */}
                  {mission.claimed ? (
                    <span className="text-xs font-bold text-slate-500 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                    </span>
                  ) : mission.completed ? (
                    <button
                      onClick={() => handleClaim(mission)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Claim</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sounds.playPop();
                        onGoToCases();
                      }}
                      className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold text-[11px] uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Investigate</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Daily HQ Completion Bonus Box */}
      <div className="bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 text-center relative overflow-hidden shadow-2xl">
        <div className="text-4xl mb-2">🎁</div>
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 border border-amber-500/30 px-3 py-0.5 rounded-full">
          Daily HQ All-Clear Bonus
        </span>
        <h3 className="text-xl font-black text-white mt-1">Complete All 3 Daily Missions</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
          Unlocks +200 Gold Coins and +300 Detective XP when all missions for today are claimed!
        </p>

        {bonusClaimed ? (
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-5 py-2.5 rounded-2xl text-xs font-bold font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>HQ Daily Bonus Received!</span>
          </div>
        ) : allClaimed ? (
          <button
            onClick={handleClaimBonus}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <Gift className="w-5 h-5 text-slate-950 animate-bounce" />
            <span>Claim Grand HQ Bonus!</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 bg-slate-950 text-slate-500 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Complete {3 - completedCount} more mission(s) to unlock</span>
          </div>
        )}
      </div>
    </div>
  );
};
