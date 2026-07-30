import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { getLevelInfo, calculateTotalStars } from '../utils/storage';
import { Volume2, VolumeX, Moon, Sun, ArrowLeft, Sliders } from 'lucide-react';
import { sounds } from '../utils/sound';
import { ambientEngine } from '../utils/ambientSound';

interface HeaderProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
  onOpenProfile?: () => void;
  onBack?: () => void;
  title?: string;
  showStats?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onUpdateProfile,
  onOpenProfile,
  onBack,
  title,
  showStats = true,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const levelInfo = getLevelInfo(profile.xp);
  const totalStars = calculateTotalStars(profile);

  const currentVolume = profile.ambientSoundSettings?.volume ?? 0.8;

  const toggleSound = () => {
    const nextSoundState = !profile.soundEnabled;
    sounds.setEnabled(nextSoundState);
    if (nextSoundState) {
      sounds.playPop();
      ambientEngine.setMuted(false);
    } else {
      ambientEngine.setMuted(true);
    }
    onUpdateProfile({ soundEnabled: nextSoundState });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    sounds.setVolume(val);
    ambientEngine.setMasterVolume(val);
    onUpdateProfile({
      soundEnabled: val > 0 ? true : profile.soundEnabled,
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
  };

  const toggleDark = () => {
    sounds.playPop();
    const nextDark = !profile.darkMode;
    onUpdateProfile({ darkMode: nextDark });
  };

  return (
    <header className="bg-slate-950/90 text-slate-100 border-b border-slate-800 px-3 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between shadow-2xl backdrop-blur-md sticky top-0 z-40 max-w-full overflow-x-hidden transition-colors">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {onBack && (
          <button
            onClick={() => {
              sounds.playPop();
              onBack();
            }}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-400 transition-all active:scale-95 shadow-md flex-shrink-0 cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => {
              sounds.playPop();
              if (onOpenProfile) onOpenProfile();
            }}
            className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center text-lg sm:text-2xl shadow-lg flex-shrink-0 hover:border-amber-400 transition-all active:scale-95 cursor-pointer"
            title="Detective Profile & Wardrobe"
          >
            {profile.avatar}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="text-sm sm:text-xl font-black tracking-tighter uppercase text-amber-500 font-sans leading-none truncate max-w-[100px] sm:max-w-none">
                {title || profile.username}
              </h1>
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-md flex-shrink-0">
                {profile.badgeId || 'DET-1001'}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-0.5 truncate">
              {levelInfo.title} • Lvl {levelInfo.level}
            </p>
          </div>
        </div>
      </div>

      {showStats && (
        <div className="flex items-center gap-2 sm:gap-5 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              Total Stars
            </p>
            <p className="text-xs sm:text-xl font-black text-amber-400 font-mono">
              ⭐ {totalStars} / 60
            </p>
          </div>

          <div className="text-right">
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              Coins
            </p>
            <p className="text-xs sm:text-xl font-black text-emerald-400 font-mono">
              🪙 {profile.coins}
            </p>
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2 sm:pl-3 relative">
            {/* Sound Mute Toggle Button */}
            <button
              onClick={toggleSound}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                profile.soundEnabled
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
              }`}
              title={profile.soundEnabled ? 'Mute All Sound' : 'Unmute Audio'}
            >
              {profile.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Volume Popover Slider Button */}
            <button
              onClick={() => setShowVolumeSlider((prev) => !prev)}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                showVolumeSlider
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title="Adjust Volume Level"
            >
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[10px] font-mono font-bold hidden md:inline">
                {profile.soundEnabled ? `${Math.round(currentVolume * 100)}%` : 'OFF'}
              </span>
            </button>

            {/* Volume Slider Popover Dropdown */}
            {showVolumeSlider && (
              <div className="absolute top-12 right-10 bg-slate-900 border border-amber-500/40 p-3 rounded-2xl shadow-2xl z-50 flex flex-col gap-2 min-w-[160px] backdrop-blur-xl">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                  <span>AUDIO VOLUME</span>
                  <span className="font-mono">{Math.round(currentVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentVolume}
                  onChange={handleVolumeChange}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
                />
                <button
                  onClick={toggleSound}
                  className="mt-1 py-1 text-[10px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {profile.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
                </button>
              </div>
            )}

            {/* Dark/Light Mode Switcher Button */}
            <button
              onClick={toggleDark}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                profile.darkMode
                  ? 'bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800'
                  : 'bg-amber-100 text-slate-900 border-amber-300 hover:bg-amber-200'
              }`}
              title={profile.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {profile.darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-amber-600" />
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

