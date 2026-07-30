import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';
import { Award, ArrowLeft, Check, Sparkles, Trophy, Medal } from 'lucide-react';
import { sounds } from '../utils/sound';
import { DetectiveLeaderboard } from './DetectiveLeaderboard';

interface AchievementsModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
  onBack: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  profile,
  onUpdateProfile,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'achievements'>('leaderboard');

  const isUnlocked = (achId: string) => {
    // Basic logic
    const solvedCount = Object.keys(profile.solvedCases || {}).length;
    if (achId === 'first_solve') return solvedCount >= 1;
    if (achId === 'disaster_master') return solvedCount >= 10;
    if (achId === 'island_explorer') return solvedCount >= 20;
    if (achId === 'space_sleuth') return solvedCount >= 30;
    if (achId === 'fantasy_legend') return solvedCount >= 40;
    if (achId === 'moon_pioneer') return solvedCount >= 50;
    if (achId === 'legendary_detective') return solvedCount >= 60;
    return profile.achievements.includes(achId);
  };

  const handleClaim = (achId: string, rewardCoins: number, rewardXp: number) => {
    if (profile.claimedAchievements?.includes(achId)) return;

    sounds.playSecretFound();
    const newClaimed = [...(profile.claimedAchievements || []), achId];
    onUpdateProfile({
      coins: profile.coins + rewardCoins,
      xp: profile.xp + rewardXp,
      claimedAchievements: newClaimed,
    });
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 pb-12 max-w-2xl mx-auto font-sans">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            sounds.playPop();
            onBack();
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-slate-900 border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to HQ</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
          <Award className="w-4 h-4" />
          <span>Trophy & Leaderboard Hall</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 mb-6">
        <button
          onClick={() => {
            sounds.playPop();
            setActiveTab('leaderboard');
          }}
          className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'leaderboard'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Detective Leaderboard</span>
        </button>

        <button
          onClick={() => {
            sounds.playPop();
            setActiveTab('achievements');
          }}
          className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'achievements'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Medal className="w-4 h-4" />
          <span>Badges & Trophies</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'leaderboard' ? (
        <DetectiveLeaderboard currentProfile={profile} />
      ) : (
        <div>
          <h2 className="text-xl font-black text-amber-200 font-sans mb-1">
            Detective Badges & Trophies
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Unlock badges and claim gold rewards for solving mysteries across dimensions.
          </p>

          <div className="space-y-3">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = isUnlocked(ach.id);
              const claimed = profile.claimedAchievements?.includes(ach.id);

              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    unlocked
                      ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-900/30 border-slate-800 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30">
                      {ach.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100 font-sans">{ach.name}</h3>
                      <p className="text-xs text-slate-400">{ach.desc}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-amber-300 mt-1">
                        <span>🪙 +{ach.rewardCoins}</span>
                        <span>✨ +{ach.rewardXp} XP</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {unlocked ? (
                      claimed ? (
                        <span className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Claimed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClaim(ach.id, ach.rewardCoins, ach.rewardXp)}
                          className="text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-3.5 py-2 rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Claim
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-slate-600 font-semibold italic">Locked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

