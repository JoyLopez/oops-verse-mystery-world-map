import React, { useState } from 'react';
import { PlayerProfile, SeasonalEvent, SeasonalEventOption } from '../types';
import { SEASONAL_EVENTS, getActiveSeasonalEvent } from '../data/seasonalEvents';
import { sounds } from '../utils/sound';
import {
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Gift,
  Search,
  Zap,
  ArrowLeft,
  Clock,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SeasonalEventsModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
  onClose: () => void;
}

export const SeasonalEventsModal: React.FC<SeasonalEventsModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
}) => {
  // Allow user to preview or simulate any season month, defaulting to current real month
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
  const activeEvent = getActiveSeasonalEvent(selectedMonth);

  const completedEventIds = profile.seasonalEventsState?.completedEventIds || [];
  const isCurrentEventCompleted = completedEventIds.includes(activeEvent.id);

  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [victoryModal, setVictoryModal] = useState<{
    coins: number;
    xp: number;
    badgeTitle: string;
    cosmeticName: string;
  } | null>(null);

  const handleMonthChange = (month: number) => {
    sounds.playPop();
    setSelectedMonth(month);
    setSelectedSuspectId(null);
    setFeedbackError(null);
  };

  const handleAccuse = (suspect: SeasonalEventOption) => {
    if (isCurrentEventCompleted) return;

    if (suspect.id === activeEvent.correctOptionId) {
      sounds.playWorldUnlockFanfare();
      sounds.playSuccess();

      // Grant rewards
      const updatedCompleted = [...new Set([...completedEventIds, activeEvent.id])];
      const updatedCosmetics = [
        ...new Set([...profile.unlockedCosmetics, activeEvent.rewardCosmeticValue]),
      ];

      onUpdateProfile({
        coins: profile.coins + activeEvent.rewardCoins,
        xp: profile.xp + activeEvent.rewardXp,
        title: activeEvent.rewardBadgeTitle,
        unlockedCosmetics: updatedCosmetics,
        seasonalEventsState: {
          completedEventIds: updatedCompleted,
          claimedRewards: [...(profile.seasonalEventsState?.claimedRewards || []), activeEvent.id],
        },
      });

      setVictoryModal({
        coins: activeEvent.rewardCoins,
        xp: activeEvent.rewardXp,
        badgeTitle: activeEvent.rewardBadgeTitle,
        cosmeticName: activeEvent.rewardCosmeticName,
      });
      setFeedbackError(null);
    } else {
      sounds.playError();
      setFeedbackError(`Incorrect deduction! ${suspect.suspectName} has a solid alibi. Re-examine the clue narrative and evidence.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md overflow-y-auto p-3 sm:p-6 flex items-start justify-center">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl my-auto relative text-slate-100 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sounds.playPop();
                onClose();
              }}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-amber-400 transition-all active:scale-95 shadow-md cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  LIMITED TIME EVENT
                </span>
                <span className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md animate-pulse">
                  SPECIAL INVESTIGATION
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-sans mt-0.5">
                Detective Seasonal Events
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Season Selector Bar (Test / Preview All Seasons) */}
        <div className="mb-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-3 relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase font-mono text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Select Seasonal Investigation Month:
            </span>
            <span className="text-[10px] font-mono text-amber-400/80">
              Active: Month {selectedMonth}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {[
              { month: 7, label: 'Summer Expo', emoji: '☀️' },
              { month: 10, label: 'Halloween', emoji: '🎃' },
              { month: 12, label: 'Winter Solstice', emoji: '❄️' },
              { month: 4, label: 'Spring Blossom', emoji: '🌸' },
              { month: 9, label: 'Autumn Harvest', emoji: '🍂' },
            ].map((s) => {
              const isSelected = selectedMonth === s.month;
              const isCompleted = completedEventIds.includes(
                SEASONAL_EVENTS.find((e) => e.activeMonths.includes(s.month))?.id || ''
              );

              return (
                <button
                  key={s.month}
                  onClick={() => handleMonthChange(s.month)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-lg scale-105'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-base sm:text-xl">{s.emoji}</span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase truncate max-w-full">
                    {s.label}
                  </span>
                  {isCompleted && (
                    <span className="text-[8px] font-mono font-black text-emerald-400 bg-slate-950 px-1 rounded-sm">
                      CLAIMED
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Active Event Banner */}
        <div
          className={`bg-gradient-to-br ${activeEvent.bgGradient} border-2 ${activeEvent.borderColor} rounded-3xl p-5 mb-6 relative overflow-hidden shadow-2xl z-10`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl">{activeEvent.emoji}</span>
                <span className={`text-xs font-black uppercase tracking-widest ${activeEvent.themeColor}`}>
                  {activeEvent.seasonLabel}
                </span>
                {isCurrentEventCompleted ? (
                  <span className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> EVENT COMPLETED
                  </span>
                ) : (
                  <span className="bg-amber-500/20 border border-amber-400 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <Zap className="w-3 h-3" /> LIVE INVESTIGATION
                  </span>
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white font-sans">
                {activeEvent.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {activeEvent.synopsis}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 font-mono">
                <span>📍 Location: {activeEvent.location}</span>
              </div>
            </div>

            {/* Reward Card Preview */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex-shrink-0 min-w-[200px] text-center">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block mb-1">
                Event Rewards
              </span>
              <div className="flex items-center justify-center gap-3 text-lg font-black my-1">
                <span className="text-amber-400">🪙 {activeEvent.rewardCoins}</span>
                <span className="text-purple-400">⚡ {activeEvent.rewardXp} XP</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-center gap-1.5 text-xs text-emerald-300 font-bold">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span>{activeEvent.rewardCosmeticName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clues & Evidence Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 relative z-10">
          <div className="md:col-span-3 bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-black uppercase text-amber-400 font-mono mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" /> Crime Scene Narrative & Clues
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              "{activeEvent.clueNarrative}"
            </p>
          </div>

          {activeEvent.evidenceItems.map((ev, i) => (
            <div
              key={i}
              className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 flex items-start gap-3"
            >
              <div className="text-2xl p-2 bg-slate-900 border border-slate-800 rounded-xl flex-shrink-0">
                {ev.icon}
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">{ev.name}</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">{ev.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Suspect Lineup & Deduction Choice */}
        <div className="mb-6 relative z-10">
          <h4 className="text-sm font-black uppercase text-white font-sans mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            Suspect Lineup & Interrogation Logs
          </h4>

          {feedbackError && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-shake">
              <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{feedbackError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeEvent.options.map((suspect) => {
              const isSelected = selectedSuspectId === suspect.id;

              return (
                <div
                  key={suspect.id}
                  onClick={() => {
                    if (!isCurrentEventCompleted) {
                      sounds.playPop();
                      setSelectedSuspectId(suspect.id);
                      setFeedbackError(null);
                    }
                  }}
                  className={`bg-slate-950/90 border rounded-2xl p-4 transition-all relative flex flex-col justify-between ${
                    isCurrentEventCompleted
                      ? suspect.id === activeEvent.correctOptionId
                        ? 'border-emerald-500 bg-emerald-950/20'
                        : 'border-slate-800 opacity-50'
                      : isSelected
                      ? 'border-amber-400 bg-amber-500/10 shadow-lg scale-[1.02] cursor-pointer'
                      : 'border-slate-800 hover:border-slate-700 cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl p-2 bg-slate-900 border border-slate-800 rounded-2xl">
                        {suspect.avatar}
                      </span>
                      <div>
                        <h5 className="text-sm font-black text-white">{suspect.suspectName}</h5>
                        <span className="text-[10px] font-mono text-amber-400/90 block">
                          {suspect.role}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2 rounded-xl border border-slate-800/50 mb-2">
                      "{suspect.statement}"
                    </p>

                    <div className="text-[10px] space-y-1 font-mono text-slate-400">
                      <p><span className="text-slate-500">Motive:</span> {suspect.motive}</p>
                      <p><span className="text-slate-500">Alibi:</span> {suspect.alibi}</p>
                    </div>
                  </div>

                  {!isCurrentEventCompleted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccuse(suspect);
                      }}
                      className={`w-full mt-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>Accuse Suspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isCurrentEventCompleted && suspect.id === activeEvent.correctOptionId && (
                    <div className="mt-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase text-center rounded-xl flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      GUILTY CULPRIT
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* All Seasonal Events Trophy Archive */}
        <div className="border-t border-slate-800 pt-5 relative z-10">
          <h4 className="text-xs font-black uppercase text-slate-400 font-mono mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Seasonal Event Trophies & Progress
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {SEASONAL_EVENTS.map((event) => {
              const isCompleted = completedEventIds.includes(event.id);

              return (
                <div
                  key={event.id}
                  className={`bg-slate-950 border p-2.5 rounded-2xl flex flex-col items-center text-center ${
                    isCompleted ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800/60 opacity-60'
                  }`}
                >
                  <span className="text-2xl mb-1">{event.emoji}</span>
                  <span className="text-[10px] font-black uppercase text-slate-200 line-clamp-1">
                    {event.seasonLabel}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5 line-clamp-1">
                    {event.rewardCosmeticName}
                  </span>
                  {isCompleted ? (
                    <span className="mt-1 text-[8px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                      ✓ UNLOCKED
                    </span>
                  ) : (
                    <span className="mt-1 text-[8px] font-mono text-slate-500 flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> LOCKED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Victory Modal Overlay */}
        <AnimatePresence>
          {victoryModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex items-center justify-center"
            >
              <div className="w-full max-w-md bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-3xl">
                  🏆
                </div>

                <span className="text-xs font-black uppercase tracking-widest text-amber-400 block mb-1">
                  SEASONAL CASE SOLVED!
                </span>

                <h3 className="text-2xl font-black text-white font-sans mb-2">
                  Deduction Confirmed!
                </h3>

                <p className="text-xs text-slate-300 mb-5">
                  Congratulations! You exposed the culprit and retrieved the stolen holiday artifacts.
                </p>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 space-y-2 text-left">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Bonus Coins:</span>
                    <span className="text-amber-400 font-mono text-sm">+🪙 {victoryModal.coins}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Detective XP:</span>
                    <span className="text-purple-400 font-mono text-sm">+⚡ {victoryModal.xp} XP</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">New Badge Title:</span>
                    <span className="text-emerald-400 font-mono text-xs">{victoryModal.badgeTitle}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold border-t border-slate-800 pt-2">
                    <span className="text-slate-400">Unlocked Cosmetic:</span>
                    <span className="text-amber-300 font-mono text-xs">{victoryModal.cosmeticName}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playPop();
                    setVictoryModal(null);
                  }}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  Claim Rewards & Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
