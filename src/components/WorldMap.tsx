import { motion } from 'motion/react';
import React, { useState } from 'react';
import { ALL_WORLDS } from '../data/worlds';
import { PlayerProfile, WorldData } from '../types';
import { countWorldSolvedCases } from '../utils/storage';
import { Lock, CheckCircle2, Award, Sparkles, ChevronRight, Compass, Calendar, Zap } from 'lucide-react';
import { sounds } from '../utils/sound';
import { getActiveSeasonalEvent } from '../data/seasonalEvents';

interface WorldMapProps {
  profile: PlayerProfile;
  onSelectWorld: (world: WorldData) => void;
  onOpenAchievements: () => void;
  onOpenSeasonalEvents?: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  profile,
  onSelectWorld,
  onOpenAchievements,
  onOpenSeasonalEvents,
}) => {
  // Currently active selected world for dossier panel preview
  const [activeDossierWorld, setActiveDossierWorld] = useState<WorldData>(ALL_WORLDS[0]);

  // Check if a world is unlocked
  const isWorldUnlocked = (world: WorldData): boolean => {
    if (world.id === 'disaster-city') return true;
    if (!world.prevWorldId) return false;

    // Must solve all 10 cases in previous world to unlock next world
    const prevWorldCases = ALL_WORLDS.find((w) => w.id === world.prevWorldId)?.cases || [];
    const solvedCount = prevWorldCases.filter((c) => profile.solvedCases[c.id]).length;
    return solvedCount >= 10 || profile.unlockedWorlds.includes(world.id);
  };

  const activeSolvedCount = countWorldSolvedCases(profile, activeDossierWorld.id);
  const activeSeasonalEvent = getActiveSeasonalEvent();
  const isSeasonalCompleted = (profile.seasonalEventsState?.completedEventIds || []).includes(activeSeasonalEvent.id);

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 lg:p-6 pb-20 relative font-sans select-none">
      {/* Subtle Dot Grid Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Bento Layout Container */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">

        {/* Live Seasonal Event Banner */}
        {onOpenSeasonalEvents && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-r ${activeSeasonalEvent.bgGradient} border ${activeSeasonalEvent.borderColor} rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl relative overflow-hidden`}
          >
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-3xl flex-shrink-0 shadow-inner">
                {activeSeasonalEvent.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase font-mono tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    SEASONAL EVENT ACTIVE
                  </span>
                  {isSeasonalCompleted && (
                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      ✓ SOLVED
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-white mt-0.5 font-sans">
                  {activeSeasonalEvent.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-1">
                  {activeSeasonalEvent.synopsis}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playPop();
                onOpenSeasonalEvents();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer flex-shrink-0 active:scale-95 z-10"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Investigate Event</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        
        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Bento Card 1: Progression Path Matrix (8 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl backdrop-blur-sm"
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            <div className="flex items-center justify-between relative z-10 mb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-500 block mb-1">
                  Detective Progression Matrix
                </span>
                <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-100">
                  Mystery Worlds
                </h2>
              </div>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {activeDossierWorld.name} Selected
              </span>
            </div>

            {/* Bento World Nodes Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
              {ALL_WORLDS.map((world, index) => {
                const unlocked = isWorldUnlocked(world);
                const solvedCount = countWorldSolvedCases(profile, world.id);
                const isComplete = solvedCount >= world.cases.length;
                const isSelected = activeDossierWorld.id === world.id;

                return (
                  <motion.div
                    key={world.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 + index * 0.06 }}
                    whileHover={unlocked ? { scale: 1.03 } : {}}
                    whileTap={unlocked ? { scale: 0.97 } : {}}
                    onClick={() => {
                      if (unlocked) {
                        sounds.playPop();
                        setActiveDossierWorld(world);
                      } else {
                        sounds.playError();
                      }
                    }}
                    className={`rounded-2xl p-4 flex flex-col justify-between relative cursor-pointer min-h-[140px] transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                        : isComplete
                        ? 'bg-emerald-500/10 border-2 border-emerald-500/50 hover:border-emerald-400'
                        : unlocked
                        ? 'bg-slate-800/80 border border-slate-700 hover:border-amber-500/50'
                        : 'bg-slate-900/40 border border-slate-800 opacity-50 grayscale'
                    }`}
                  >
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        World 0{index + 1}
                      </span>
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : !unlocked ? (
                        <Lock className="w-4 h-4 text-slate-500" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>

                    <div className="my-2">
                      <div className="text-3xl mb-1">{world.emoji}</div>
                      <p className="text-base font-bold text-slate-100 font-sans leading-tight">
                        {world.name}
                      </p>
                    </div>

                    <div className="mt-auto">
                      {unlocked ? (
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                          <span>{solvedCount}/10 Solved</span>
                          <span className="text-amber-400 font-mono">
                            {Math.round((solvedCount / 10) * 100)}%
                          </span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic truncate">Locked</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Bento Card 2: Current Dossier Panel (4 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl"
          >
            <div>
              <div className="mb-4">
                <p className="text-xs text-amber-500 font-black uppercase tracking-widest mb-1">
                  Current Dossier
                </p>
                <h3 className="text-2xl font-black italic uppercase text-slate-100 flex items-center gap-2">
                  <span>{activeDossierWorld.emoji}</span>
                  <span>{activeDossierWorld.name}</span>
                </h3>
                <div className="h-1 w-12 bg-amber-500 mt-2 rounded-full" />
              </div>

              <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                {activeDossierWorld.desc}
              </p>

              {/* Case Preview List */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {activeDossierWorld.cases.slice(0, 5).map((c, idx) => {
                  const isSolved = !!profile.solvedCases[c.id];
                  return (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                        isSolved
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-slate-800/70 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSolved
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {isSolved ? '✓' : `0${idx + 1}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{c.title}</p>
                      </div>
                    </div>
                  );
                })}
                <div className="p-2 text-center text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  + 5 More Case Files
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playPop();
                onSelectWorld(activeDossierWorld);
              }}
              className="mt-6 w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Investigate World</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Bento Card 3: Recent Achievements / Trophies (6 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="lg:col-span-6 bg-indigo-950/80 border border-indigo-500/30 rounded-3xl p-6 flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-3xl">
                🏆
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-1">
                  Detective Achievements
                </p>
                <h4 className="text-lg font-bold text-slate-100">
                  {Object.keys(profile.solvedCases).length > 0
                    ? `Solved ${Object.keys(profile.solvedCases).length} Mysteries Total`
                    : 'Begin Your First Investigation!'}
                </h4>
                <p className="text-xs text-indigo-300/80 mt-0.5">
                  Unlock trophies & secret detective badges
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playPop();
                onOpenAchievements();
              }}
              className="px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Trophies</span>
            </button>
          </motion.div>

          {/* Bento Card 4: Quick Navigation / Next World Preview (6 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">
                🌍
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">
                  Active Investigation Sector
                </p>
                <p className="text-lg font-bold text-slate-100">{activeDossierWorld.name}</p>
                <div className="w-36 bg-slate-800 h-2 rounded-full mt-2 overflow-hidden border border-slate-700">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ style: 'width: 100%', width: `${(activeSolvedCount / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl uppercase tracking-wider">
              {activeSolvedCount}/10 Solved
            </span>
          </motion.div>

        </div>

        {/* Footer info */}
        <footer className="pt-4 flex justify-between items-center text-[10px] text-slate-600 uppercase font-bold tracking-widest border-t border-slate-900">
          <span>System Version 2.5-BENTO-MYSTERY</span>
          <span>© AI Studio Detective Global Investigations</span>
        </footer>

      </div>
    </div>
  );
};

