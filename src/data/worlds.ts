import { WorldData, WorldId } from '../types';
import { DISASTER_CITY_WORLD } from './world1';
import { MYSTERY_ISLAND_WORLD } from './world2';
import { SPACE_STATION_WORLD } from './world3';
import { FANTASY_KINGDOM_WORLD } from './world4';
import { MOON_BASE_WORLD } from './world5';
import { TIME_DIMENSION_WORLD } from './world6';

export const ALL_WORLDS: WorldData[] = [
  DISASTER_CITY_WORLD,
  MYSTERY_ISLAND_WORLD,
  SPACE_STATION_WORLD,
  FANTASY_KINGDOM_WORLD,
  MOON_BASE_WORLD,
  TIME_DIMENSION_WORLD,
];

export function getWorldById(worldId: WorldId): WorldData {
  const found = ALL_WORLDS.find((w) => w.id === worldId);
  return found || DISASTER_CITY_WORLD;
}

export function getAllCasesFlat() {
  return ALL_WORLDS.flatMap((w) => w.cases);
}

export function getCaseById(caseId: string) {
  return getAllCasesFlat().find((c) => c.id === caseId);
}
