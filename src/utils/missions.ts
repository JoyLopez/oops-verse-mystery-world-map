import { PlayerProfile, DailyMission, DailyMissionsState, MissionType } from '../types';
import { saveProfile } from './storage';

export const MISSION_TEMPLATES: Omit<DailyMission, 'id' | 'currentCount' | 'completed' | 'claimed'>[] = [
  {
    type: 'find_clues',
    title: 'Clue Collector',
    desc: 'Examine crime scenes and uncover 3 clues.',
    icon: '🔎',
    targetCount: 3,
    rewardCoins: 80,
    rewardXp: 120,
  },
  {
    type: 'speed_solve',
    title: 'Speed Sleuth',
    desc: 'Solve any case in under 2 minutes (120s).',
    icon: '⚡',
    targetCount: 1,
    rewardCoins: 120,
    rewardXp: 160,
  },
  {
    type: 'solve_case',
    title: 'Case Closed',
    desc: 'Successfully solve any mystery investigation.',
    icon: '📁',
    targetCount: 1,
    rewardCoins: 75,
    rewardXp: 100,
  },
  {
    type: 'perfect_stars',
    title: '3-Star Investigator',
    desc: 'Complete a case with a perfect 3-star rating.',
    icon: '⭐',
    targetCount: 1,
    rewardCoins: 100,
    rewardXp: 150,
  },
  {
    type: 'interview_witness',
    title: 'Witness Interviewer',
    desc: 'Interrogate a witness to gather testimony.',
    icon: '🗣️',
    targetCount: 1,
    rewardCoins: 60,
    rewardXp: 90,
  },
  {
    type: 'reconstruct_timeline',
    title: 'Master Chronologist',
    desc: 'Reconstruct the exact timeline of events.',
    icon: '⌛',
    targetCount: 1,
    rewardCoins: 70,
    rewardXp: 100,
  },
  {
    type: 'find_secret',
    title: 'Secret Finder',
    desc: 'Discover a hidden secret clue in a scene.',
    icon: '✨',
    targetCount: 1,
    rewardCoins: 150,
    rewardXp: 200,
  },
];

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Generate 3 unique daily missions seeded by today's date
export function generateDailyMissionsForDate(dateStr: string): DailyMission[] {
  // Simple hash of date string to pick 3 distinct templates
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed += dateStr.charCodeAt(i);
  }

  const templatesCopy = [...MISSION_TEMPLATES];
  const selected: DailyMission[] = [];

  for (let i = 0; i < 3; i++) {
    const index = (seed + i * 3) % templatesCopy.length;
    const tmpl = templatesCopy.splice(index, 1)[0] || MISSION_TEMPLATES[i];
    selected.push({
      id: `m_${dateStr}_${i}_${tmpl.type}`,
      ...tmpl,
      currentCount: 0,
      completed: false,
      claimed: false,
    });
  }

  return selected;
}

export function ensureDailyMissions(profile: PlayerProfile): PlayerProfile {
  const today = getTodayDateString();
  const current = profile.dailyMissionsState;

  if (!current || current.lastMissionDate !== today || !current.missions || current.missions.length === 0) {
    const newMissions = generateDailyMissionsForDate(today);
    const updatedState: DailyMissionsState = {
      lastMissionDate: today,
      missions: newMissions,
      bonusClaimed: false,
    };

    const updatedProfile: PlayerProfile = {
      ...profile,
      dailyMissionsState: updatedState,
    };

    saveProfile(updatedProfile);
    return updatedProfile;
  }

  return profile;
}

export function updateMissionProgress(
  profile: PlayerProfile,
  type: MissionType,
  increment: number = 1,
  metadata?: { timeSeconds?: number; stars?: number }
): PlayerProfile {
  const ensuredProfile = ensureDailyMissions(profile);
  const state = ensuredProfile.dailyMissionsState;
  if (!state || !state.missions) return ensuredProfile;

  let changed = false;
  const updatedMissions = state.missions.map((m) => {
    if (m.type !== type || m.completed) return m;

    // Special condition checks
    if (type === 'speed_solve') {
      if (metadata?.timeSeconds === undefined || metadata.timeSeconds > 120) {
        return m;
      }
    }
    if (type === 'perfect_stars') {
      if (metadata?.stars === undefined || metadata.stars < 3) {
        return m;
      }
    }

    const newCount = Math.min(m.targetCount, m.currentCount + increment);
    const isNowCompleted = newCount >= m.targetCount;

    if (newCount !== m.currentCount || isNowCompleted !== m.completed) {
      changed = true;
      return {
        ...m,
        currentCount: newCount,
        completed: isNowCompleted,
      };
    }

    return m;
  });

  if (!changed) return ensuredProfile;

  const updatedProfile: PlayerProfile = {
    ...ensuredProfile,
    dailyMissionsState: {
      ...state,
      missions: updatedMissions,
    },
  };

  saveProfile(updatedProfile);
  return updatedProfile;
}

export function claimMissionReward(profile: PlayerProfile, missionId: string): PlayerProfile {
  const state = profile.dailyMissionsState;
  if (!state || !state.missions) return profile;

  let coinsEarned = 0;
  let xpEarned = 0;

  const updatedMissions = state.missions.map((m) => {
    if (m.id === missionId && m.completed && !m.claimed) {
      coinsEarned = m.rewardCoins;
      xpEarned = m.rewardXp;
      return { ...m, claimed: true };
    }
    return m;
  });

  if (coinsEarned === 0 && xpEarned === 0) return profile;

  const updatedProfile: PlayerProfile = {
    ...profile,
    coins: profile.coins + coinsEarned,
    xp: profile.xp + xpEarned,
    dailyMissionsState: {
      ...state,
      missions: updatedMissions,
    },
  };

  saveProfile(updatedProfile);
  return updatedProfile;
}

export function claimDailyBonus(profile: PlayerProfile): PlayerProfile {
  const state = profile.dailyMissionsState;
  if (!state || !state.missions || state.bonusClaimed) return profile;

  const allClaimed = state.missions.every((m) => m.claimed);
  if (!allClaimed) return profile;

  const bonusCoins = 200;
  const bonusXp = 300;

  const updatedProfile: PlayerProfile = {
    ...profile,
    coins: profile.coins + bonusCoins,
    xp: profile.xp + bonusXp,
    dailyMissionsState: {
      ...state,
      bonusClaimed: true,
    },
  };

  saveProfile(updatedProfile);
  return updatedProfile;
}

export function getUnclaimedMissionsCount(profile: PlayerProfile): number {
  const ensured = ensureDailyMissions(profile);
  const missions = ensured.dailyMissionsState?.missions || [];

  let count = missions.filter((m) => m.completed && !m.claimed).length;

  const allClaimed = missions.length > 0 && missions.every((m) => m.claimed);
  if (allClaimed && !ensured.dailyMissionsState?.bonusClaimed) {
    count += 1; // bonus claimable
  }

  return count;
}
