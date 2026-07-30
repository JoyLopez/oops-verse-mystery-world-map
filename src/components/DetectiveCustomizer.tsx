import React from 'react';
import { PlayerProfile } from '../types';
import { ArrowLeft, Sparkles, UserCheck, LogOut, ShieldCheck, Flame, Calendar, Sun, Moon, Volume2, VolumeX, Sliders } from 'lucide-react';
import { sounds } from '../utils/sound';
import { logoutCurrentAccount } from '../utils/storage';
import { AmbientSoundSettingsPanel } from './AmbientSoundSettingsPanel';
import {
  STREAK_MILESTONES,
  getCurrentStreakMilestone,
  getNextStreakMilestone,
  simulateNextDayLogin,
} from '../utils/streak';

interface DetectiveCustomizerProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
  onLogout: () => void;
  onBack: () => void;
}

const AVATARS = ['🕵️‍♂️', '🕵️‍♀️', '👨‍💼', '👩‍💼', '🧑‍🔬', '🧙‍♂️', '👨‍🚀', '🐱‍👤'];
const HATS = ['Deerstalker Cap', 'Fedora', 'Crown', 'Space Helmet', 'Wizard Hat', 'None'];
const TOOLS = ['Magnifying Glass', 'Laser Scanner', 'Magic Wand', 'Golden Compass', 'Cyber Deck'];
const PETS = ['🔎 Hound', '🦉 Wise Owl', '🐇 Lunar Rabbit', '🐉 Mini Dragon', '🐱 Black Cat'];

export const DetectiveCustomizer: React.FC<DetectiveCustomizerProps> = ({
  profile,
  onUpdateProfile,
  onLogout,
  onBack,
}) => {
  const handleLogoutClick = () => {
    sounds.playPop();
    logoutCurrentAccount();
    onLogout();
  };

  const streakCount = profile.loginStreak || 1;
  const currentMilestone = getCurrentStreakMilestone(streakCount);
  const nextMilestone = getNextStreakMilestone(streakCount);

  const handleSimulateCheckIn = () => {
    sounds.playSuccess();
    const updated = simulateNextDayLogin(profile);
    onUpdateProfile(updated);
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 pb-12 max-w-xl mx-auto font-sans">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            sounds.playPop();
            onBack();
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-slate-900 border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
          <UserCheck className="w-4 h-4" />
          <span>Detective Identity</span>
        </div>
      </div>

      <h2 className="text-2xl font-black text-amber-200 font-sans mb-1">
        Detective Profile & Wardrobe
      </h2>
      <p className="text-xs text-slate-400 mb-6">
        Manage your daily login streak, unlocked milestone badges, and detective wardrobe.
      </p>

      {/* Account & Security Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-6 flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 font-mono">
              BADGE: {profile.badgeId || 'DET-1001'}
            </span>
            <h3 className="text-base font-bold text-white">{profile.username}</h3>
            <p className="text-[11px] text-slate-400">
              {profile.isLoggedIn ? 'Authenticated Detective' : 'Guest Officer'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogoutClick}
          className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 shadow-md cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Quick Theme & Master Audio Preferences Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-6 shadow-xl">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-3">
          Appearance & Audio Preferences
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {/* Theme Mode Button */}
          <button
            onClick={() => {
              sounds.playPop();
              onUpdateProfile({ darkMode: !profile.darkMode });
            }}
            className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
              profile.darkMode
                ? 'bg-slate-950 border-amber-500/30 text-amber-300 hover:border-amber-400'
                : 'bg-amber-100 border-amber-300 text-slate-900 hover:bg-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {profile.darkMode ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-600" />}
              <div className="text-left">
                <span className="text-xs font-bold block leading-tight">Theme Mode</span>
                <span className="text-[10px] font-mono opacity-80">
                  {profile.darkMode ? 'Dark Noir' : 'Light Casefile'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Toggle
            </span>
          </button>

          {/* Master Sound Button */}
          <button
            onClick={() => {
              sounds.playPop();
              const nextSound = !profile.soundEnabled;
              sounds.setEnabled(nextSound);
              onUpdateProfile({ soundEnabled: nextSound });
            }}
            className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
              profile.soundEnabled
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {profile.soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
              <div className="text-left">
                <span className="text-xs font-bold block leading-tight">Master Audio</span>
                <span className="text-[10px] font-mono opacity-80">
                  {profile.soundEnabled ? 'Enabled' : 'Muted'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300">
              {profile.soundEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Sound Volume Slider */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
          <Sliders className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-xs font-bold text-slate-300 whitespace-nowrap">
            Volume: {Math.round((profile.ambientSoundSettings?.volume ?? 0.8) * 100)}%
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={profile.ambientSoundSettings?.volume ?? 0.8}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              sounds.setVolume(val);
              onUpdateProfile({
                ambientSoundSettings: {
                  ...(profile.ambientSoundSettings || {
                    masterEnabled: true,
                    worldToggles: {
                      'disaster-city': true,
                      'mystery-island': true,
                      'space-station': true,
                      'fantasy-kingdom': true,
                      'moon-base': true,
                      'time-dimension': true,
                    },
                  }),
                  volume: val,
                },
              });
            }}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* Daily Streak Counter & Milestone Box */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 rounded-3xl p-5 mb-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-8xl">
          🔥
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-orange-500/20 animate-pulse">
              🔥
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Daily Consecutive Login Streak
              </span>
              <h3 className="text-xl font-black text-white flex items-center gap-2 font-mono">
                {streakCount} {streakCount === 1 ? 'Day' : 'Days'} Active
              </h3>
            </div>
          </div>

          {currentMilestone && (
            <div className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 shadow-md ${currentMilestone.color}`}>
              <span>{currentMilestone.icon}</span>
              <span>{currentMilestone.badgeText}</span>
            </div>
          )}
        </div>

        {/* 7-Day Visual Streak Tracker */}
        <div className="my-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
            <span className="flex items-center gap-1 text-amber-400">
              <Calendar className="w-3.5 h-3.5" /> 7-Day Cycle Tracker
            </span>
            <span className="font-mono text-slate-300">
              Day {((streakCount - 1) % 7) + 1} of 7
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((dayIndex) => {
              const currentCycleDay = ((streakCount - 1) % 7) + 1;
              const isPassed = dayIndex <= currentCycleDay;
              const isToday = dayIndex === currentCycleDay;

              return (
                <div
                  key={dayIndex}
                  className={`flex flex-col items-center justify-center py-2 rounded-xl border text-center transition-all ${
                    isToday
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/10 scale-105'
                      : isPassed
                      ? 'bg-slate-800/80 border-slate-700 text-amber-400'
                      : 'bg-slate-950 border-slate-800/60 text-slate-600'
                  }`}
                >
                  <span className="text-[9px] font-mono font-bold uppercase block text-slate-400">
                    Day {dayIndex}
                  </span>
                  <span className="text-sm mt-0.5 font-bold">
                    {isPassed ? '🔥' : '🔒'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Milestone Progress Bar */}
        {nextMilestone && (
          <div className="mb-4">
            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
              <span className="text-slate-300 flex items-center gap-1">
                Next Milestone: <span className="text-amber-400">{nextMilestone.icon} {nextMilestone.title}</span>
              </span>
              <span className="font-mono text-amber-400">
                {streakCount} / {nextMilestone.days} Days
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((streakCount / nextMilestone.days) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Milestone Badges Gallery */}
        <div className="mb-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
            Streak Milestone Badges
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {STREAK_MILESTONES.map((m) => {
              const isUnlocked = streakCount >= m.days;
              return (
                <div
                  key={m.days}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all ${
                    isUnlocked
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-slate-950/60 border-slate-800/60 text-slate-600 opacity-60'
                  }`}
                >
                  <span className="text-xl mb-0.5">{m.icon}</span>
                  <span className="text-[9px] font-black font-mono leading-tight truncate w-full">
                    {m.days} Days
                  </span>
                  <span className="text-[8px] font-bold uppercase mt-0.5">
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Check-In / Test Button */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            Log in daily to keep your streak burning and display milestone badges on your nav bar!
          </p>
          <button
            onClick={handleSimulateCheckIn}
            className="flex-shrink-0 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            <span>Check-In (+1 Day)</span>
          </button>
        </div>
      </div>

      {/* World Ambient Soundscapes Settings Panel */}
      <AmbientSoundSettingsPanel profile={profile} onUpdateProfile={onUpdateProfile} />

      {/* Wardrobe Preview Card */}
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 mb-6 text-center shadow-xl">
        <div className="text-6xl mb-2">{profile.avatar}</div>
        <h3 className="text-lg font-bold text-amber-100 font-sans">{profile.username}</h3>
        <p className="text-xs text-amber-400 font-mono mt-0.5">{profile.selectedHat} • {profile.selectedTool}</p>
        <span className="inline-block bg-amber-500/20 text-amber-300 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-500/30 mt-3">
          Companion: {profile.selectedPet}
        </span>
      </div>

      {/* Avatar Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Select Avatar Character
        </span>
        <div className="grid grid-cols-4 gap-2">
          {AVATARS.map((av) => (
            <button
              key={av}
              onClick={() => {
                sounds.playPop();
                onUpdateProfile({ avatar: av });
              }}
              className={`text-3xl p-3 rounded-xl border transition-all cursor-pointer ${
                profile.avatar === av
                  ? 'bg-amber-500/20 border-amber-400 scale-105 shadow-md'
                  : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {av}
            </button>
          ))}
        </div>
      </div>

      {/* Hat Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Select Detective Hat
        </span>
        <div className="flex flex-wrap gap-2">
          {HATS.map((hat) => (
            <button
              key={hat}
              onClick={() => {
                sounds.playPop();
                onUpdateProfile({ selectedHat: hat });
              }}
              className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                profile.selectedHat === hat
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {hat}
            </button>
          ))}
        </div>
      </div>

      {/* Tool Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Select Investigation Tool
        </span>
        <div className="flex flex-wrap gap-2">
          {TOOLS.map((tool) => (
            <button
              key={tool}
              onClick={() => {
                sounds.playPop();
                onUpdateProfile({ selectedTool: tool });
              }}
              className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                profile.selectedTool === tool
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>

      {/* Pet Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Select Sidekick Companion
        </span>
        <div className="flex flex-wrap gap-2">
          {PETS.map((pet) => (
            <button
              key={pet}
              onClick={() => {
                sounds.playPop();
                onUpdateProfile({ selectedPet: pet });
              }}
              className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                profile.selectedPet === pet
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {pet}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
