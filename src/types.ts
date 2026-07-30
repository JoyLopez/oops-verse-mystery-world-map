export type WorldId = 'disaster-city' | 'mystery-island' | 'space-station' | 'fantasy-kingdom' | 'moon-base' | 'time-dimension';

export interface Clue {
  id: string;
  icon: string;
  title: string;
  desc: string;
  note: string;
  isSecret?: boolean;
}

export interface Hotspot {
  x: number; // percentage
  y: number; // percentage
  clueId: string;
}

export interface Witness {
  avatar: string;
  name: string;
  quote: string;
  footage: string;
}

export interface TimelineCard {
  id: string;
  label: string;
}

export interface Timeline {
  correctOrder: string[]; // card ids in order
  cards: Record<string, string>; // id -> label text
}

export interface Culprit {
  id: string;
  name: string;
  emoji: string;
  isCorrect: boolean;
  wrongMessage?: string;
}

export type MechanicType = 'standard' | 'water-puzzle' | 'laser-puzzle' | 'magic-potion' | 'low-gravity' | 'time-rewind' | 'robot-hacking' | string;

export interface RepairStage {
  title: string;
  brokenEmoji: string;
  fixedEmoji: string;
  steps: string[];
  holdLabel: string;
}

export interface CaseData {
  id: string;
  num: string; // e.g. "001"
  worldId: WorldId;
  title: string;
  emoji: string;
  desc: string;
  isBoss?: boolean;
  mechanicType?: MechanicType;
  scene: {
    bgGradient: string[];
    mainEmoji: string;
    decorEmojis: string[];
  };
  clues: Record<string, Clue>;
  hotspots: Hotspot[];
  witness: Witness;
  timeline: Timeline;
  culprits: Culprit[];
  repair: RepairStage;
  badge: string;
  secretBadge?: string;
  ending: Record<number, string>; // 1, 2, 3 stars -> text
}

export interface WorldData {
  id: WorldId;
  name: string;
  emoji: string;
  theme: string;
  desc: string;
  color: string;
  accentColor: string;
  mechanics: string[];
  bossTitle: string;
  unlockRequirementText: string;
  prevWorldId?: WorldId;
  cases: CaseData[];
}

export interface SolvedCaseRecord {
  caseId?: string;
  stars: number;
  timeSeconds: number;
  secretFound: boolean;
  perfect?: boolean;
  badge?: string;
  solvedAt: string;
}

export type MissionType =
  | 'find_clues'
  | 'interview_witness'
  | 'reconstruct_timeline'
  | 'solve_case'
  | 'speed_solve'
  | 'perfect_stars'
  | 'find_secret';

export interface DailyMission {
  id: string;
  title: string;
  desc: string;
  icon: string;
  targetCount: number;
  currentCount: number;
  rewardCoins: number;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
  type: MissionType;
}

export interface DailyMissionsState {
  lastMissionDate: string; // YYYY-MM-DD
  missions: DailyMission[];
  bonusClaimed?: boolean;
}

export interface DailyPuzzleState {
  lastPuzzleDate: string; // YYYY-MM-DD
  completed: boolean;
  claimed: boolean;
  puzzleId: string;
  attemptsCount?: number;
}

export interface AmbientWorldToggles {
  'disaster-city': boolean;
  'mystery-island': boolean;
  'space-station': boolean;
  'fantasy-kingdom': boolean;
  'moon-base': boolean;
  'time-dimension': boolean;
}

export interface AmbientSoundSettings {
  masterEnabled: boolean;
  volume: number; // 0.0 to 1.0
  worldToggles: AmbientWorldToggles;
}

export interface SeasonalEventOption {
  id: string;
  suspectName: string;
  role: string;
  motive: string;
  alibi: string;
  avatar: string;
  statement: string;
}

export interface SeasonalEvent {
  id: string;
  title: string;
  season: 'summer' | 'halloween' | 'winter' | 'spring' | 'autumn';
  seasonLabel: string;
  emoji: string;
  themeColor: string;
  borderColor: string;
  bgGradient: string;
  startDate: string; // e.g. "07-01"
  endDate: string; // e.g. "08-31"
  activeMonths: number[]; // 1-indexed months, e.g. [7, 8]
  location: string;
  synopsis: string;
  clueNarrative: string;
  evidenceItems: Array<{ icon: string; name: string; detail: string }>;
  options: SeasonalEventOption[];
  correctOptionId: string;
  rewardCoins: number;
  rewardXp: number;
  rewardBadgeTitle: string;
  rewardBadgeEmoji: string;
  rewardCosmeticId: string;
  rewardCosmeticName: string;
  rewardCosmeticType: 'hat' | 'tool' | 'pet';
  rewardCosmeticValue: string;
}

export interface SeasonalEventsState {
  completedEventIds: string[];
  claimedRewards: string[];
}

export interface PlayerProfile {
  badgeId: string; // e.g. DET-8492
  username: string;
  pinCode?: string; // 4-digit PIN for passcode lock
  accountType?: 'guest' | 'detective' | 'hq_cloud';
  isLoggedIn?: boolean;
  email?: string;
  title: string;
  avatar: string;
  hat: string;
  tool: string;
  pet: string;
  coins: number;
  xp: number;
  unlockedWorlds: WorldId[];
  solvedCases: Record<string, SolvedCaseRecord>; // caseId -> record
  unlockedCosmetics: string[];
  achievements: string[];
  loginStreak: number;
  lastLoginDate: string | null;
  dailyMissionsState?: DailyMissionsState;
  dailyPuzzleState?: DailyPuzzleState;
  seasonalEventsState?: SeasonalEventsState;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  darkMode: boolean;
  ambientSoundSettings?: AmbientSoundSettings;
  customCases: Array<{
    id: string;
    title: string;
    location: string;
    problem: string;
    cause: string;
    solution: string;
    emoji: string;
    createdAt: string;
  }>;
}

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  desc: string;
  rewardCoins: number;
  rewardXp: number;
}
