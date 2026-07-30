import { PlayerProfile, DailyPuzzleState } from '../types';
import { getTodayRiddle, getTodayRiddleDateString, LogicRiddle } from '../data/dailyRiddles';
import { saveProfile } from './storage';

export function ensureDailyPuzzleState(profile: PlayerProfile): PlayerProfile {
  const today = getTodayRiddleDateString();
  const currentRiddle = getTodayRiddle();

  const currentState = profile.dailyPuzzleState;

  if (
    !currentState ||
    currentState.lastPuzzleDate !== today ||
    currentState.puzzleId !== currentRiddle.id
  ) {
    const newState: DailyPuzzleState = {
      lastPuzzleDate: today,
      completed: false,
      claimed: false,
      puzzleId: currentRiddle.id,
      attemptsCount: 0,
    };

    const updatedProfile: PlayerProfile = {
      ...profile,
      dailyPuzzleState: newState,
    };

    saveProfile(updatedProfile);
    return updatedProfile;
  }

  return profile;
}

export function isDailyPuzzleSolvedToday(profile: PlayerProfile): boolean {
  const ensured = ensureDailyPuzzleState(profile);
  const today = getTodayRiddleDateString();
  const state = ensured.dailyPuzzleState;
  return !!(state && state.lastPuzzleDate === today && state.completed);
}

export function submitDailyPuzzleAnswer(
  profile: PlayerProfile,
  selectedIndex: number
): {
  updatedProfile: PlayerProfile;
  isCorrect: boolean;
  rewardCoins: number;
  rewardXp: number;
  explanation: string;
} {
  const ensured = ensureDailyPuzzleState(profile);
  const riddle = getTodayRiddle();
  const state = ensured.dailyPuzzleState!;

  const isCorrect = selectedIndex === riddle.correctAnswerIndex;

  if (!isCorrect) {
    const updatedProfile: PlayerProfile = {
      ...ensured,
      dailyPuzzleState: {
        ...state,
        attemptsCount: (state.attemptsCount || 0) + 1,
      },
    };
    saveProfile(updatedProfile);
    return {
      updatedProfile,
      isCorrect: false,
      rewardCoins: 0,
      rewardXp: 0,
      explanation: riddle.explanation,
    };
  }

  // Correct answer!
  if (state.completed) {
    // Already completed previously
    return {
      updatedProfile: ensured,
      isCorrect: true,
      rewardCoins: 0,
      rewardXp: 0,
      explanation: riddle.explanation,
    };
  }

  const coinsEarned = riddle.rewardCoins;
  const xpEarned = riddle.rewardXp;

  const updatedProfile: PlayerProfile = {
    ...ensured,
    coins: ensured.coins + coinsEarned,
    xp: ensured.xp + xpEarned,
    dailyPuzzleState: {
      ...state,
      completed: true,
      claimed: true,
      attemptsCount: (state.attemptsCount || 0) + 1,
    },
  };

  saveProfile(updatedProfile);

  return {
    updatedProfile,
    isCorrect: true,
    rewardCoins: coinsEarned,
    rewardXp: xpEarned,
    explanation: riddle.explanation,
  };
}
