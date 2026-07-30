import React, { useState, useEffect } from 'react';
import { PlayerProfile, WorldData, CaseData, WorldId } from './types';
import { loadProfile, saveProfile, saveCaseSolve, countWorldSolvedCases } from './utils/storage';
import { ALL_WORLDS, getWorldById } from './data/worlds';
import { Header } from './components/Header';
import { WorldMap } from './components/WorldMap';
import { CaseSelect } from './components/CaseSelect';
import { CaseInvestigation } from './components/CaseInvestigation';
import { WitnessInterview } from './components/WitnessInterview';
import { TimelineReconstruction } from './components/TimelineReconstruction';
import { CulpritNaming } from './components/CulpritNaming';
import { FinalBossRepair } from './components/FinalBossRepair';
import { CaseCompleteEnding } from './components/CaseCompleteEnding';
import { WorldUnlockModal } from './components/WorldUnlockModal';
import { CaseFiles } from './components/CaseFiles';
import { AchievementsModal } from './components/AchievementsModal';
import { DetectiveCustomizer } from './components/DetectiveCustomizer';
import { AIMysteryMaker } from './components/AIMysteryMaker';
import { ImageAnimator } from './components/ImageAnimator';
import { CustomCursor } from './components/CustomCursor';
import { InteractiveBackground } from './components/InteractiveBackground';
import { LoginPage } from './components/LoginPage';
import { DailyMissions } from './components/DailyMissions';
import { DailyMysteryPuzzle } from './components/DailyMysteryPuzzle';
import { SeasonalEventsModal } from './components/SeasonalEventsModal';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Map, BookOpen, Award, User, Sparkles, Film, Brain, Calendar } from 'lucide-react';
import { sounds } from './utils/sound';
import { ambientEngine } from './utils/ambientSound';
import {
  ensureDailyMissions,
  updateMissionProgress,
  getUnclaimedMissionsCount,
} from './utils/missions';
import { checkAndUpdateDailyStreak, getCurrentStreakMilestone } from './utils/streak';
import { ensureDailyPuzzleState, isDailyPuzzleSolvedToday } from './utils/dailyPuzzle';

type ViewMode =
  | 'world-map'
  | 'case-select'
  | 'investigation'
  | 'witness'
  | 'timeline'
  | 'culprit'
  | 'boss-repair'
  | 'case-ending'
  | 'case-files'
  | 'achievements'
  | 'customizer'
  | 'ai-maker'
  | 'image-animator'
  | 'missions'
  | 'daily-puzzle'
  | 'seasonal-events'
  | 'login-page';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() =>
    checkAndUpdateDailyStreak(ensureDailyPuzzleState(ensureDailyMissions(loadProfile())))
  );
  const [viewMode, setViewMode] = useState<ViewMode>('world-map');

  const [selectedWorld, setSelectedWorld] = useState<WorldData>(ALL_WORLDS[0]);
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);

  // Investigation run state
  const [foundClueIds, setFoundClueIds] = useState<string[]>([]);
  const [secretFound, setSecretFound] = useState<boolean>(false);
  const [isTimelinePerfect, setIsTimelinePerfect] = useState<boolean>(true);
  const [isCulpritFirstTry, setIsCulpritFirstTry] = useState<boolean>(true);
  const [starsEarned, setStarsEarned] = useState<number>(3);
  const [startTime, setStartTime] = useState<number>(0);

  // World unlock sequence trigger state
  const [unlockedSequenceWorld, setUnlockedSequenceWorld] = useState<{
    completed: WorldData;
    next: WorldData | null;
  } | null>(null);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  // Sync Dark/Light theme class on document element
  useEffect(() => {
    if (profile.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [profile.darkMode]);

  // Sync Sound Manager and Ambient Engine mute/volume state
  useEffect(() => {
    sounds.setEnabled(profile.soundEnabled);
    const vol = profile.ambientSoundSettings?.volume ?? 0.6;
    sounds.setVolume(vol);

    const isAudioOn = profile.soundEnabled && (profile.ambientSoundSettings?.masterEnabled ?? true);
    if (!isAudioOn) {
      ambientEngine.setMuted(true);
    } else {
      ambientEngine.setMuted(false);
      ambientEngine.setMasterVolume(vol);
    }
  }, [profile.soundEnabled, profile.ambientSoundSettings]);

  // Ambient soundscape auto-play effect during gameplay
  useEffect(() => {
    const ambientSettings = profile.ambientSoundSettings;
    const isMasterOn = profile.soundEnabled && (ambientSettings ? ambientSettings.masterEnabled : true);
    const worldToggles = ambientSettings ? ambientSettings.worldToggles : {
      'disaster-city': true,
      'mystery-island': true,
      'space-station': true,
      'fantasy-kingdom': true,
      'moon-base': true,
      'time-dimension': true,
    };

    const isGameplayView = [
      'case-select',
      'investigation',
      'witness',
      'timeline',
      'culprit',
      'boss-repair',
      'case-ending',
    ].includes(viewMode);

    if (isMasterOn && isGameplayView && selectedWorld) {
      const worldId = selectedWorld.id as WorldId;
      const isWorldEnabled = worldToggles[worldId] ?? true;
      if (isWorldEnabled) {
        ambientEngine.setMasterVolume(ambientSettings?.volume ?? 0.6);
        ambientEngine.setMuted(false);
        ambientEngine.playWorld(worldId);
        return;
      }
    }

    if (viewMode !== 'customizer') {
      ambientEngine.stop();
    }
  }, [viewMode, selectedWorld, profile.soundEnabled, profile.ambientSoundSettings]);

  const handleUpdateProfile = (updated: Partial<PlayerProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      saveProfile(next);
      return next;
    });
  };

  const handleSelectWorld = (world: WorldData) => {
    setSelectedWorld(world);
    setViewMode('case-select');
  };

  const handleSelectCase = (caseData: CaseData) => {
    setSelectedCase(caseData);
    setFoundClueIds([]);
    setSecretFound(false);
    setIsTimelinePerfect(true);
    setIsCulpritFirstTry(true);
    setStarsEarned(3);
    setStartTime(Date.now());
    setViewMode('investigation');
  };

  // Investigation Flow
  const handleCompleteInvestigation = (found: string[], secret: boolean) => {
    setFoundClueIds(found);
    setSecretFound(secret);

    let updated = updateMissionProgress(profile, 'find_clues', found.length);
    if (secret) {
      updated = updateMissionProgress(updated, 'find_secret', 1);
    }
    setProfile(updated);

    setViewMode('witness');
  };

  const handleCompleteInterview = () => {
    const updated = updateMissionProgress(profile, 'interview_witness', 1);
    setProfile(updated);
    setViewMode('timeline');
  };

  const handleCompleteTimeline = (isPerfect: boolean) => {
    setIsTimelinePerfect(isPerfect);
    if (!isPerfect) setStarsEarned((prev) => Math.max(1, prev - 1));

    const updated = updateMissionProgress(profile, 'reconstruct_timeline', 1);
    setProfile(updated);

    setViewMode('culprit');
  };

  const handleCompleteCulprit = (isFirstTry: boolean) => {
    setIsCulpritFirstTry(isFirstTry);
    if (!isFirstTry) setStarsEarned((prev) => Math.max(1, prev - 1));

    if (selectedCase?.repair) {
      setViewMode('boss-repair');
    } else {
      finishCaseAndSave();
    }
  };

  const handleCompleteBossRepair = () => {
    finishCaseAndSave();
  };

  const finishCaseAndSave = () => {
    if (!selectedCase) return;

    const timeSeconds = Math.max(5, Math.floor((Date.now() - startTime) / 1000));
    const finalStars = starsEarned;

    // Save solve record
    let updatedProfile = saveCaseSolve(profile, selectedCase.id, finalStars, secretFound, timeSeconds);

    // Update daily missions progress for solving case, speed, and stars
    updatedProfile = updateMissionProgress(updatedProfile, 'solve_case', 1);
    updatedProfile = updateMissionProgress(updatedProfile, 'speed_solve', 1, { timeSeconds });
    updatedProfile = updateMissionProgress(updatedProfile, 'perfect_stars', 1, { stars: finalStars });

    setProfile(updatedProfile);

    // Check if this case completion completed all 10 cases in the world!
    const currentWorld = getWorldById(selectedCase.worldId);
    const solvedCountInWorld = countWorldSolvedCases(updatedProfile, currentWorld.id);

    if (solvedCountInWorld >= 10) {
      // Find next world
      const currIndex = ALL_WORLDS.findIndex((w) => w.id === currentWorld.id);
      const nextWorld = ALL_WORLDS[currIndex + 1] || null;

      if (nextWorld && !updatedProfile.unlockedWorlds.includes(nextWorld.id)) {
        // Unlock next world
        handleUpdateProfile({
          unlockedWorlds: [...updatedProfile.unlockedWorlds, nextWorld.id],
        });
      }

      setUnlockedSequenceWorld({ completed: currentWorld, next: nextWorld });
    }

    setViewMode('case-ending');
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans ${profile.darkMode ? 'dark' : ''}`}>
      <InteractiveBackground />
      <CustomCursor />
      {/* Header */}
      <Header
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onOpenProfile={() => setViewMode('customizer')}
        onBack={
          viewMode !== 'world-map'
            ? () => {
                if (viewMode === 'case-select') setViewMode('world-map');
                else if (
                  viewMode === 'investigation' ||
                  viewMode === 'witness' ||
                  viewMode === 'timeline' ||
                  viewMode === 'culprit' ||
                  viewMode === 'boss-repair' ||
                  viewMode === 'case-ending'
                ) {
                  setViewMode('case-select');
                } else {
                  setViewMode('world-map');
                }
              }
            : undefined
        }
      />

      {/* Main Container */}
      <main className="flex-1 pb-20 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.04, y: -10 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            {viewMode === 'world-map' && (
              <WorldMap
                profile={profile}
                onSelectWorld={handleSelectWorld}
                onOpenAchievements={() => setViewMode('achievements')}
                onOpenSeasonalEvents={() => setViewMode('seasonal-events')}
              />
            )}

            {viewMode === 'case-select' && (
              <CaseSelect
                world={selectedWorld}
                profile={profile}
                onSelectCase={handleSelectCase}
                onBackToMap={() => setViewMode('world-map')}
              />
            )}

            {viewMode === 'investigation' && selectedCase && (
              <CaseInvestigation
                caseData={selectedCase}
                onCompleteInvestigation={handleCompleteInvestigation}
              />
            )}

            {viewMode === 'witness' && selectedCase && (
              <WitnessInterview
                caseData={selectedCase}
                onCompleteInterview={handleCompleteInterview}
              />
            )}

            {viewMode === 'timeline' && selectedCase && (
              <TimelineReconstruction
                caseData={selectedCase}
                onCompleteTimeline={handleCompleteTimeline}
              />
            )}

            {viewMode === 'culprit' && selectedCase && (
              <CulpritNaming
                caseData={selectedCase}
                onCompleteCulprit={handleCompleteCulprit}
              />
            )}

            {viewMode === 'boss-repair' && selectedCase && (
              <FinalBossRepair
                caseData={selectedCase}
                onCompleteRepair={handleCompleteBossRepair}
              />
            )}

            {viewMode === 'case-ending' && selectedCase && (
              <CaseCompleteEnding
                caseData={selectedCase}
                starsEarned={starsEarned}
                secretFound={secretFound}
                onFinishCase={() => setViewMode('case-select')}
              />
            )}

            {viewMode === 'case-files' && (
              <CaseFiles profile={profile} onBack={() => setViewMode('world-map')} />
            )}

            {viewMode === 'achievements' && (
              <AchievementsModal
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onBack={() => setViewMode('world-map')}
              />
            )}

            {viewMode === 'customizer' && (
              <DetectiveCustomizer
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onLogout={() => {
                  const updated = loadProfile();
                  setProfile(updated);
                  setViewMode('login-page');
                }}
                onBack={() => setViewMode('world-map')}
              />
            )}

            {viewMode === 'missions' && (
              <DailyMissions
                profile={profile}
                onUpdateProfile={(updated) => setProfile(updated)}
                onBackToMap={() => setViewMode('world-map')}
                onGoToCases={() => setViewMode('world-map')}
              />
            )}

            {viewMode === 'daily-puzzle' && (
              <DailyMysteryPuzzle
                profile={profile}
                onUpdateProfile={(updated) => setProfile(updated)}
                onBackToMap={() => setViewMode('world-map')}
              />
            )}

            {viewMode === 'ai-maker' && (
              <AIMysteryMaker
                onBack={() => setViewMode('world-map')}
                onPlayCustomCase={(customCase) => {
                  setSelectedCase(customCase);
                  setViewMode('investigation');
                }}
              />
            )}

            {viewMode === 'image-animator' && (
              <ImageAnimator onBack={() => setViewMode('world-map')} />
            )}

            {viewMode === 'seasonal-events' && (
              <SeasonalEventsModal
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onClose={() => setViewMode('world-map')}
              />
            )}

            {viewMode === 'login-page' && (
              <div className="max-w-4xl mx-auto py-8 px-4">
                <LoginPage
                  currentProfile={profile}
                  onProfileUpdated={(updated) => {
                    setProfile(updated);
                    setViewMode('world-map');
                  }}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Cinematic World Unlock Modal */}
      {unlockedSequenceWorld && (
        <WorldUnlockModal
          completedWorld={unlockedSequenceWorld.completed}
          nextWorld={unlockedSequenceWorld.next}
          profile={profile}
          onClose={() => setUnlockedSequenceWorld(null)}
        />
      )}

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:py-2 shadow-2xl max-w-full overflow-hidden">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth px-2.5 justify-start sm:justify-around max-w-7xl mx-auto flex-nowrap w-full">
          <button
            onClick={() => {
              sounds.playPop();
              setViewMode('world-map');
            }}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl whitespace-nowrap ${
              viewMode === 'world-map' || viewMode === 'case-select'
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Map</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setViewMode('case-files');
            }}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl whitespace-nowrap ${
              viewMode === 'case-files'
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Notebook</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setViewMode('missions');
            }}
            className={`flex-shrink-0 relative flex flex-col items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl whitespace-nowrap ${
              viewMode === 'missions'
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Missions</span>
            {getUnclaimedMissionsCount(profile) > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-mono font-bold flex items-center justify-center animate-bounce shadow-md">
                {getUnclaimedMissionsCount(profile)}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setViewMode('daily-puzzle');
            }}
            className={`flex-shrink-0 relative flex flex-col items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl whitespace-nowrap ${
              viewMode === 'daily-puzzle'
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4 text-amber-400" />
            <span>Riddle</span>
            {!isDailyPuzzleSolvedToday(profile) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shadow-md" />
            )}
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setViewMode('seasonal-events');
            }}
            className={`flex-shrink-0 relative flex flex-col items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl whitespace-nowrap ${
              viewMode === 'seasonal-events'
                ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-rose-400" />
            <span>Events</span>
            <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-md bg-rose-500 text-white text-[8px] font-black uppercase tracking-tighter shadow-md animate-pulse">
              LIVE
            </span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setViewMode('ai-maker');
            }}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl whitespace-nowrap ${
              viewMode === 'ai-maker'
                ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Lab</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setViewMode('image-animator');
            }}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl whitespace-nowrap ${
              viewMode === 'image-animator'
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Animate</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setViewMode('achievements');
            }}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl whitespace-nowrap ${
              viewMode === 'achievements'
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Trophies</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setViewMode('customizer');
            }}
            className={`flex-shrink-0 relative flex flex-col items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl whitespace-nowrap ${
              viewMode === 'customizer'
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
            {(() => {
              const milestone = getCurrentStreakMilestone(profile.loginStreak || 1);
              if (milestone) {
                return (
                  <span
                    title={`${milestone.title} (${profile.loginStreak} Days)`}
                    className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-slate-950 text-[9px] font-mono font-black flex items-center gap-0.5 shadow-lg border border-amber-300 animate-bounce"
                  >
                    <span>{milestone.icon}</span>
                    <span>{profile.loginStreak}</span>
                  </span>
                );
              }
              if ((profile.loginStreak || 0) > 0) {
                return (
                  <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-slate-900 text-amber-400 text-[9px] font-mono font-bold flex items-center border border-amber-500/30">
                    🔥{profile.loginStreak}
                  </span>
                );
              }
              return null;
            })()}
          </button>
        </div>
      </nav>
    </div>
  );
}
