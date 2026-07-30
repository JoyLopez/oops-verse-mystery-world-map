import { PlayerProfile } from '../types';
import { calculateTotalStars, getAllSavedAccounts } from './storage';

export interface LeaderboardEntry {
  rank: number;
  badgeId: string;
  username: string;
  avatar: string;
  title: string;
  totalStars: number;
  casesSolved: number;
  avgSpeedSeconds: number; // average time per case
  fastestSolveSeconds: number; // best time for a single case
  xp: number;
  country: string;
  isCurrentUser?: boolean;
  specialBadge?: string;
}

// Global HQ rival detectives benchmark data
const GLOBAL_DETECTIVES_DATA: Omit<LeaderboardEntry, 'rank'>[] = [
  {
    badgeId: 'DET-9901',
    username: 'Sherlock V',
    avatar: '🕵️‍♂️',
    title: 'Legendary Detective',
    totalStars: 178,
    casesSolved: 60,
    avgSpeedSeconds: 28,
    fastestSolveSeconds: 12,
    xp: 6200,
    country: '🇬🇧',
    specialBadge: '👑 HQ Champion',
  },
  {
    badgeId: 'DET-8842',
    username: 'Agent Cipher',
    avatar: '🤖',
    title: 'Time Lord Detective',
    totalStars: 165,
    casesSolved: 56,
    avgSpeedSeconds: 32,
    fastestSolveSeconds: 14,
    xp: 5400,
    country: '🇯🇵',
    specialBadge: '⚡ Speedmaster',
  },
  {
    badgeId: 'DET-7719',
    username: 'Sleuth Maya',
    avatar: '🕵️‍♀️',
    title: 'Space Sleuth',
    totalStars: 152,
    casesSolved: 52,
    avgSpeedSeconds: 38,
    fastestSolveSeconds: 16,
    xp: 4800,
    country: '🇺🇸',
    specialBadge: '🌟 Star Collector',
  },
  {
    badgeId: 'DET-6630',
    username: 'Inspector Clouseau',
    avatar: '🧙',
    title: 'Kingdom Detective',
    totalStars: 134,
    casesSolved: 46,
    avgSpeedSeconds: 45,
    fastestSolveSeconds: 21,
    xp: 3900,
    country: '🇫🇷',
  },
  {
    badgeId: 'DET-5511',
    username: 'Nova Spectre',
    avatar: '🛸',
    title: 'Disaster Specialist',
    totalStars: 118,
    casesSolved: 40,
    avgSpeedSeconds: 41,
    fastestSolveSeconds: 19,
    xp: 3200,
    country: '🇩🇪',
  },
  {
    badgeId: 'DET-4409',
    username: 'Shadow Fox',
    avatar: '🥷',
    title: 'Disaster Specialist',
    totalStars: 98,
    casesSolved: 34,
    avgSpeedSeconds: 49,
    fastestSolveSeconds: 22,
    xp: 2600,
    country: '🇰🇷',
  },
  {
    badgeId: 'DET-3388',
    username: 'Dr. Quantum',
    avatar: '👾',
    title: 'Clue Hunter',
    totalStars: 82,
    casesSolved: 28,
    avgSpeedSeconds: 52,
    fastestSolveSeconds: 25,
    xp: 2100,
    country: '🇨🇦',
  },
  {
    badgeId: 'DET-2240',
    username: 'Baron Byte',
    avatar: '🦾',
    title: 'Clue Hunter',
    totalStars: 64,
    casesSolved: 22,
    avgSpeedSeconds: 58,
    fastestSolveSeconds: 29,
    xp: 1500,
    country: '🇦🇺',
  },
  {
    badgeId: 'DET-1105',
    username: 'Rookie Rex',
    avatar: '🐯',
    title: 'Rookie Detective',
    totalStars: 42,
    casesSolved: 15,
    avgSpeedSeconds: 64,
    fastestSolveSeconds: 31,
    xp: 950,
    country: '🇧🇷',
  },
];

export type LeaderboardSortMode = 'stars' | 'speed' | 'cases';

export function getLeaderboardEntries(
  currentProfile: PlayerProfile,
  sortMode: LeaderboardSortMode = 'stars'
): LeaderboardEntry[] {
  // Compute profile statistics
  const computeUserStats = (prof: PlayerProfile): Omit<LeaderboardEntry, 'rank'> => {
    const solvedRecords = Object.values(prof.solvedCases || {});
    const casesSolved = solvedRecords.length;
    const totalStars = calculateTotalStars(prof);

    let totalTime = 0;
    let fastestSolveSeconds = 999;

    solvedRecords.forEach((r) => {
      const t = r.timeSeconds || 60;
      totalTime += t;
      if (t < fastestSolveSeconds) fastestSolveSeconds = t;
    });

    if (fastestSolveSeconds === 999) fastestSolveSeconds = 0;
    const avgSpeedSeconds = casesSolved > 0 ? Math.round(totalTime / casesSolved) : 0;

    return {
      badgeId: prof.badgeId || 'DET-1001',
      username: prof.username || 'Detective',
      avatar: prof.avatar || '🕵️',
      title: prof.title || 'Rookie Detective',
      totalStars,
      casesSolved,
      avgSpeedSeconds,
      fastestSolveSeconds,
      xp: prof.xp || 0,
      country: '🌐',
      isCurrentUser: prof.badgeId === currentProfile.badgeId,
    };
  };

  // 1. Gather all local accounts
  const savedAccounts = getAllSavedAccounts();
  const localEntriesMap = new Map<string, Omit<LeaderboardEntry, 'rank'>>();

  savedAccounts.forEach((acc) => {
    // replace active current profile with current state
    if (acc.badgeId === currentProfile.badgeId) {
      localEntriesMap.set(acc.badgeId, computeUserStats(currentProfile));
    } else {
      localEntriesMap.set(acc.badgeId, computeUserStats(acc));
    }
  });

  // Ensure current profile is in map
  if (!localEntriesMap.has(currentProfile.badgeId)) {
    localEntriesMap.set(currentProfile.badgeId, computeUserStats(currentProfile));
  }

  // Combine local entries and global competitors
  const allEntries: Omit<LeaderboardEntry, 'rank'>[] = [...localEntriesMap.values()];

  // Add global competitors if not already existing by badgeId
  GLOBAL_DETECTIVES_DATA.forEach((g) => {
    if (!localEntriesMap.has(g.badgeId)) {
      allEntries.push(g);
    }
  });

  // Sort based on sortMode
  allEntries.sort((a, b) => {
    if (sortMode === 'stars') {
      if (b.totalStars !== a.totalStars) return b.totalStars - a.totalStars;
      if (b.casesSolved !== a.casesSolved) return b.casesSolved - a.casesSolved;
      return a.avgSpeedSeconds - b.avgSpeedSeconds;
    } else if (sortMode === 'speed') {
      // Fastest average solve speed (lower seconds is better, but filter out 0s to end if cases solved = 0)
      if (a.casesSolved === 0 && b.casesSolved > 0) return 1;
      if (b.casesSolved === 0 && a.casesSolved > 0) return -1;
      if (a.avgSpeedSeconds !== b.avgSpeedSeconds) return a.avgSpeedSeconds - b.avgSpeedSeconds;
      return b.totalStars - a.totalStars;
    } else {
      // Cases solved
      if (b.casesSolved !== a.casesSolved) return b.casesSolved - a.casesSolved;
      return b.totalStars - a.totalStars;
    }
  });

  // Assign ranks
  return allEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export function formatTimeSeconds(seconds: number): string {
  if (!seconds || seconds <= 0) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}
