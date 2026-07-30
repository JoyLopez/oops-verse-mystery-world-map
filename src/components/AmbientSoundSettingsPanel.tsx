import React, { useState, useEffect } from 'react';
import { PlayerProfile, WorldId } from '../types';
import { Volume2, VolumeX, Music, Play, Square, Sliders, Sparkles, Check } from 'lucide-react';
import { WORLD_SOUNDSCAPES, ambientEngine, AmbientWorldId } from '../utils/ambientSound';
import { sounds } from '../utils/sound';

interface AmbientSoundSettingsPanelProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
}

export const AmbientSoundSettingsPanel: React.FC<AmbientSoundSettingsPanelProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const currentSettings = profile.ambientSoundSettings || {
    masterEnabled: true,
    volume: 0.6,
    worldToggles: {
      'disaster-city': true,
      'mystery-island': true,
      'space-station': true,
      'fantasy-kingdom': true,
      'moon-base': true,
      'time-dimension': true,
    },
  };

  const [previewWorldId, setPreviewWorldId] = useState<AmbientWorldId | null>(null);

  // Sync volume & mute state with ambientEngine
  useEffect(() => {
    ambientEngine.setMuted(!currentSettings.masterEnabled);
    ambientEngine.setMasterVolume(currentSettings.volume);
  }, [currentSettings.masterEnabled, currentSettings.volume]);

  // Clean up preview audio when unmounting panel
  useEffect(() => {
    return () => {
      if (previewWorldId) {
        ambientEngine.stop();
      }
    };
  }, [previewWorldId]);

  const handleToggleMaster = () => {
    sounds.playPop();
    const nextMaster = !currentSettings.masterEnabled;
    if (!nextMaster && previewWorldId) {
      ambientEngine.stop();
      setPreviewWorldId(null);
    }
    onUpdateProfile({
      ambientSoundSettings: {
        ...currentSettings,
        masterEnabled: nextMaster,
      },
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateProfile({
      ambientSoundSettings: {
        ...currentSettings,
        volume: val,
      },
    });
  };

  const handleToggleWorld = (worldId: AmbientWorldId) => {
    sounds.playPop();
    const currentToggles = currentSettings.worldToggles;
    const isEnabled = currentToggles[worldId] ?? true;
    const nextToggles = {
      ...currentToggles,
      [worldId]: !isEnabled,
    };

    // If turned off while currently previewing, stop preview
    if (isEnabled && previewWorldId === worldId) {
      ambientEngine.stop();
      setPreviewWorldId(null);
    }

    onUpdateProfile({
      ambientSoundSettings: {
        ...currentSettings,
        worldToggles: nextToggles,
      },
    });
  };

  const handlePreview = (worldId: AmbientWorldId) => {
    sounds.playPop();
    if (previewWorldId === worldId) {
      // Stop preview
      ambientEngine.stop();
      setPreviewWorldId(null);
    } else {
      // Start preview
      setPreviewWorldId(worldId);
      ambientEngine.playWorld(worldId);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 mb-6 shadow-2xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
              Audio Immersion
            </span>
            <h3 className="text-lg font-black text-white font-sans">
              World Ambient Soundscapes
            </h3>
          </div>
        </div>

        {/* Master Power Switch */}
        <button
          onClick={handleToggleMaster}
          className={`px-3 py-1.5 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md ${
            currentSettings.masterEnabled
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}
        >
          {currentSettings.masterEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Ambient ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-500" />
              <span>Ambient OFF</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Toggle realistic procedural audio soundscapes for each of the 6 mystery worlds. When active, background sounds like city sirens, ocean waves, or sci-fi hums dynamically play during investigations.
      </p>

      {/* Volume Control Bar */}
      {currentSettings.masterEnabled && (
        <div className="mb-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
          <Sliders className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-xs font-bold text-slate-300 whitespace-nowrap">
            Volume: {Math.round(currentSettings.volume * 100)}%
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={currentSettings.volume}
            onChange={handleVolumeChange}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      )}

      {/* 6 Worlds Soundscape Grid */}
      <div className="space-y-3">
        {WORLD_SOUNDSCAPES.map((meta) => {
          const isWorldEnabled = currentSettings.worldToggles[meta.id] ?? true;
          const isPreviewing = previewWorldId === meta.id;

          return (
            <div
              key={meta.id}
              className={`bg-slate-950/90 border rounded-2xl p-3.5 transition-all relative overflow-hidden ${
                isPreviewing
                  ? 'border-amber-400 shadow-lg shadow-amber-500/10'
                  : isWorldEnabled
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-gradient-to-br ${meta.bgGradient} border ${meta.borderColor}`}
                  >
                    {meta.emoji}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-black truncate ${meta.themeColor}`}>
                        {meta.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md flex-shrink-0">
                        {meta.soundscapeTitle}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {meta.description}
                    </p>

                    {/* Audio Feature Pills */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {meta.audioFeatures.map((feat) => (
                        <span
                          key={feat}
                          className="text-[9px] font-bold font-mono text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md"
                        >
                          🎵 {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Controls: Preview Button & Enable Toggle */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Test / Preview Sound Button */}
                  <button
                    onClick={() => handlePreview(meta.id)}
                    disabled={!currentSettings.masterEnabled || !isWorldEnabled}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      isPreviewing
                        ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse shadow-md'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200'
                    }`}
                    title={isPreviewing ? 'Stop Preview' : 'Test Ambient Soundscape'}
                  >
                    {isPreviewing ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-slate-950" />
                        <span className="hidden sm:inline">Playing</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="hidden sm:inline">Test</span>
                      </>
                    )}
                  </button>

                  {/* World Toggle Switch */}
                  <button
                    onClick={() => handleToggleWorld(meta.id)}
                    disabled={!currentSettings.masterEnabled}
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      isWorldEnabled && currentSettings.masterEnabled
                        ? 'bg-amber-500 justify-end'
                        : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-950 shadow-md flex items-center justify-center">
                      {isWorldEnabled && currentSettings.masterEnabled ? (
                        <Check className="w-3 h-3 text-amber-400 stroke-[3]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Animated Equalizer Visualizer Bars when previewing */}
              {isPreviewing && (
                <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between text-amber-400">
                  <span className="text-[10px] font-mono font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    Synthesizing Live Procedural Soundscape...
                  </span>
                  <div className="flex items-end gap-1 h-3">
                    <div className="w-1 bg-amber-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 bg-amber-400 rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 bg-amber-400 rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
                    <div className="w-1 bg-amber-400 rounded-full animate-bounce h-3" style={{ animationDelay: '450ms' }} />
                    <div className="w-1 bg-amber-400 rounded-full animate-bounce h-2" style={{ animationDelay: '600ms' }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
