import { PlayerProfile, WorldId } from '../types';

const STORAGE_KEY = 'oopsverse_player_profile';
const ACCOUNTS_MAP_KEY = 'oopsverse_accounts_map';
const ACTIVE_BADGE_KEY = 'oopsverse_active_badge_id';

export const LEVEL_TITLES: Array<{ minLevel: number; title: string }> = [
  { minLevel: 1, title: 'Rookie Detective' },
  { minLevel: 3, title: 'Clue Hunter' },
  { minLevel: 5, title: 'Disaster Specialist' },
  { minLevel: 10, title: 'Master Investigator' },
  { minLevel: 15, title: 'Kingdom Detective' },
  { minLevel: 20, title: 'Space Sleuth' },
  { minLevel: 25, title: 'Time Lord Detective' },
  { minLevel: 30, title: 'Legendary Detective' },
];

export function getLevelInfo(xp: number) {
  let level = 1;
  let remainingXp = xp;
  let requiredForNext = 100;

  while (remainingXp >= requiredForNext) {
    remainingXp -= requiredForNext;
    level++;
    requiredForNext = level * 100;
  }

  let title = LEVEL_TITLES[0].title;
  for (const t of LEVEL_TITLES) {
    if (level >= t.minLevel) {
      title = t.title;
    }
  }

  return {
    level,
    intoLevel: remainingXp,
    requiredForNext,
    title,
    progressPercent: Math.min(100, Math.round((remainingXp / requiredForNext) * 100)),
  };
}

export function generateBadgeId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `DET-${num}`;
}

export function getDefaultProfile(customUsername?: string, customBadgeId?: string): PlayerProfile {
  return {
    badgeId: customBadgeId || 'DET-1001',
    username: customUsername || 'Detective Joy',
    pinCode: '1234',
    accountType: 'detective',
    isLoggedIn: true,
    title: 'Rookie Detective',
    avatar: '🕵️',
    hat: 'none',
    tool: '🔎',
    pet: 'none',
    coins: 150,
    xp: 0,
    unlockedWorlds: ['disaster-city'], // starts with Disaster City
    solvedCases: {},
    unlockedCosmetics: ['🕵️', '🔎'],
    achievements: [],
    loginStreak: 1,
    lastLoginDate: new Date().toISOString().split('T')[0],
    soundEnabled: true,
    hapticEnabled: true,
    darkMode: false,
    ambientSoundSettings: {
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
    },
    customCases: [],
  };
}

export function getAllSavedAccounts(): PlayerProfile[] {
  try {
    const rawMap = localStorage.getItem(ACCOUNTS_MAP_KEY);
    if (rawMap) {
      const parsed = JSON.parse(rawMap);
      return Object.values(parsed);
    }
  } catch (e) {
    console.error('Failed to parse accounts map', e);
  }
  // If no accounts map exists, seed with default profile
  const def = getDefaultProfile();
  saveProfileToAccountsMap(def);
  return [def];
}

export function saveProfileToAccountsMap(profile: PlayerProfile) {
  try {
    const rawMap = localStorage.getItem(ACCOUNTS_MAP_KEY);
    const map = rawMap ? JSON.parse(rawMap) : {};
    map[profile.badgeId] = profile;
    localStorage.setItem(ACCOUNTS_MAP_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save to accounts map', e);
  }
}

export function loadProfile(): PlayerProfile {
  return loadProfileFromStorage();
}

export function saveProfile(profile: PlayerProfile) {
  saveProfileToStorage(profile);
}

export function createNewDetectiveAccount(data: {
  username: string;
  pinCode: string;
  avatar: string;
  accountType?: 'detective' | 'hq_cloud';
  email?: string;
}): PlayerProfile {
  const newBadgeId = generateBadgeId();
  const newProfile: PlayerProfile = {
    ...getDefaultProfile(data.username, newBadgeId),
    avatar: data.avatar || '🕵️',
    pinCode: data.pinCode || '1234',
    accountType: data.accountType || 'detective',
    email: data.email,
    isLoggedIn: true,
    unlockedCosmetics: [data.avatar || '🕵️', '🔎'],
  };

  saveProfileToAccountsMap(newProfile);
  try {
    localStorage.setItem(ACTIVE_BADGE_KEY, newBadgeId);
  } catch (e) {
    console.error('Failed to set active badge', e);
  }
  saveProfileToStorage(newProfile);
  return newProfile;
}

export function switchActiveAccount(badgeId: string): PlayerProfile | null {
  const accounts = getAllSavedAccounts();
  const match = accounts.find((a) => a.badgeId.toLowerCase() === badgeId.toLowerCase());
  if (match) {
    const updated = { ...match, isLoggedIn: true };
    try {
      localStorage.setItem(ACTIVE_BADGE_KEY, match.badgeId);
    } catch (e) {
      console.error('Failed to set active badge', e);
    }
    saveProfileToStorage(updated);
    saveProfileToAccountsMap(updated);
    return updated;
  }
  return null;
}

export function authenticateAndSwitchAccount(identifier: string, pin: string): { success: boolean; profile?: PlayerProfile; error?: string } {
  const accounts = getAllSavedAccounts();
  const match = accounts.find(
    (a) =>
      a.badgeId.toLowerCase() === identifier.trim().toLowerCase() ||
      a.username.toLowerCase() === identifier.trim().toLowerCase() ||
      (a.email && a.email.toLowerCase() === identifier.trim().toLowerCase())
  );

  if (!match) {
    return { success: false, error: 'No detective badge or callsign found with that ID.' };
  }

  if (match.pinCode && match.pinCode !== pin) {
    return { success: false, error: 'Invalid 4-digit Security PIN code.' };
  }

  const updated = { ...match, isLoggedIn: true };
  try {
    localStorage.setItem(ACTIVE_BADGE_KEY, match.badgeId);
  } catch (e) {
    console.error('Failed to set active badge', e);
  }
  saveProfileToStorage(updated);
  saveProfileToAccountsMap(updated);
  return { success: true, profile: updated };
}

export function logoutCurrentAccount(): PlayerProfile {
  const current = loadProfileFromStorage();
  const loggedOut = { ...current, isLoggedIn: false };
  saveProfileToAccountsMap(loggedOut);

  // Switch to or create guest profile
  const guestBadge = 'DET-GUEST';
  const guestProfile: PlayerProfile = {
    ...getDefaultProfile('Guest Detective', guestBadge),
    accountType: 'guest',
    isLoggedIn: false,
  };
  saveProfileToAccountsMap(guestProfile);
  try {
    localStorage.setItem(ACTIVE_BADGE_KEY, guestBadge);
  } catch (e) {
    console.error('Failed to set guest badge', e);
  }
  saveProfileToStorage(guestProfile);
  return guestProfile;
}

export function saveCaseSolve(
  profile: PlayerProfile,
  caseId: string,
  stars: number,
  secretFound: boolean,
  timeSeconds: number
): PlayerProfile {
  const existing = profile.solvedCases[caseId];
  const newStars = Math.max(existing?.stars || 0, stars);

  const updatedSolved = {
    ...profile.solvedCases,
    [caseId]: {
      caseId,
      solvedAt: new Date().toISOString(),
      stars: newStars,
      secretFound: secretFound || existing?.secretFound || false,
      timeSeconds,
    },
  };

  const coinBonus = secretFound ? 150 : 100;
  const xpBonus = 100;

  const updatedProfile: PlayerProfile = {
    ...profile,
    coins: profile.coins + coinBonus,
    xp: profile.xp + xpBonus,
    solvedCases: updatedSolved,
  };

  saveProfileToStorage(updatedProfile);
  return updatedProfile;
}

export function loadProfileFromStorage(): PlayerProfile {
  try {
    const activeBadge = localStorage.getItem(ACTIVE_BADGE_KEY);
    const rawMap = localStorage.getItem(ACCOUNTS_MAP_KEY);
    if (activeBadge && rawMap) {
      const map = JSON.parse(rawMap);
      if (map[activeBadge]) {
        return {
          ...getDefaultProfile(),
          ...map[activeBadge],
          unlockedWorlds: map[activeBadge].unlockedWorlds?.length > 0
            ? map[activeBadge].unlockedWorlds
            : ['disaster-city'],
        };
      }
    }

    // Fallback to legacy STORAGE_KEY
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const profile = {
        ...getDefaultProfile(),
        ...parsed,
        badgeId: parsed.badgeId || 'DET-1001',
        unlockedWorlds: parsed.unlockedWorlds && parsed.unlockedWorlds.length > 0
          ? parsed.unlockedWorlds
          : ['disaster-city'],
      };
      saveProfileToAccountsMap(profile);
      return profile;
    }
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  const defaultProf = getDefaultProfile();
  saveProfileToAccountsMap(defaultProf);
  return defaultProf;
}

export function saveProfileToStorage(profile: PlayerProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    saveProfileToAccountsMap(profile);
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function calculateTotalStars(profile: PlayerProfile): number {
  return Object.values(profile.solvedCases).reduce((sum, record) => sum + (record.stars || 0), 0);
}

export function countWorldSolvedCases(profile: PlayerProfile, worldId: WorldId): number {
  // caseIds are structured like "disaster-city-001"
  return Object.keys(profile.solvedCases).filter((caseId) => caseId.startsWith(worldId)).length;
}
