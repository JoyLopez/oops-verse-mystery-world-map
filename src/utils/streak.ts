import { PlayerProfile } from '../types';
import { saveProfile } from './storage';

export interface StreakMilestone {
  days: number;
  title: string;
  icon: string;
  badgeText: string;
  color: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, title: '3-Day Flame', icon: '🔥', badgeText: '3d 🔥', color: 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950' },
  { days: 7, title: '7-Day Veteran', icon: '⚡', badgeText: '7d ⚡', color: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950' },
  { days: 14, title: '14-Day Master Sleuth', icon: '🌟', badgeText: '14d 🌟', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
  { days: 30, title: '30-Day HQ Legend', icon: '👑', badgeText: '30d 👑', color: 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-slate-950' },
  { days: 50, title: '50-Day Grand Master', icon: '🏆', badgeText: '50d 🏆', color: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950' },
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentStreakMilestone(streak: number): StreakMilestone | null {
  const achieved = STREAK_MILESTONES.filter((m) => streak >= m.days);
  return achieved.length > 0 ? achieved[achieved.length - 1] : null;
}

export function getNextStreakMilestone(streak: number): StreakMilestone | null {
  return STREAK_MILESTONES.find((m) => streak < m.days) || null;
}

export function checkAndUpdateDailyStreak(profile: PlayerProfile): PlayerProfile {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const lastLogin = profile.lastLoginDate;

  let newStreak = profile.loginStreak || 0;
  let updated = false;

  if (!lastLogin) {
    // First time initializing streak
    newStreak = 1;
    updated = true;
  } else if (lastLogin === today) {
    // Already logged in today, ensure streak is at least 1
    if (newStreak === 0) {
      newStreak = 1;
      updated = true;
    }
  } else if (lastLogin === yesterday) {
    // Logged in on consecutive day!
    newStreak = newStreak + 1;
    updated = true;
  } else {
    // Missed a day or more, reset streak to 1
    newStreak = 1;
    updated = true;
  }

  if (updated || lastLogin !== today) {
    const updatedProfile: PlayerProfile = {
      ...profile,
      loginStreak: newStreak,
      lastLoginDate: today,
    };
    saveProfile(updatedProfile);
    return updatedProfile;
  }

  return profile;
}

export function simulateNextDayLogin(profile: PlayerProfile): PlayerProfile {
  const currentStreak = profile.loginStreak || 0;
  const newStreak = currentStreak + 1;
  const today = getTodayDateString();

  const updatedProfile: PlayerProfile = {
    ...profile,
    loginStreak: newStreak,
    lastLoginDate: today,
    coins: profile.coins + 50,
    xp: profile.xp + 50,
  };

  saveProfile(updatedProfile);
  return updatedProfile;
}
