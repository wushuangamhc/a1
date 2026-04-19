import { EVENT_NAMES, NET_TABLES } from "@shared/config";
import { HeroId, MatchStateSnapshot, PlayerCombatState, ScoreboardEntry } from "@shared/types";

export function getLocalPlayerId(): PlayerID {
  return Game.GetLocalPlayerID() as PlayerID;
}

export function getPlayerState(playerId: PlayerID): PlayerCombatState | undefined {
  const value = CustomNetTables.GetTableValue(NET_TABLES.playerState, `${playerId}`);
  return value === null ? undefined : (value as unknown as PlayerCombatState);
}

export function getScoreboardEntries(): ScoreboardEntry[] {
  const raw = CustomNetTables.GetTableValue(NET_TABLES.matchState, "scoreboard");
  if (!raw) {
    return [];
  }
  return Object.keys(raw).map((key) => (raw as unknown as Record<string, ScoreboardEntry>)[key]).sort((a, b) => b.kills - a.kills);
}

export function getMatchSnapshot(): MatchStateSnapshot | undefined {
  const value = CustomNetTables.GetTableValue(NET_TABLES.matchState, "snapshot");
  return value === null ? undefined : (value as unknown as MatchStateSnapshot);
}

export function selectHero(heroId: HeroId): void {
  GameEvents.SendCustomGameEventToServer(EVENT_NAMES.selectHero, { heroId });
}

export function interactPickup(pickupId: string): void {
  GameEvents.SendCustomGameEventToServer(EVENT_NAMES.interactPickup, { pickupId });
}

export function useTeleport(sourceId: string): void {
  GameEvents.SendCustomGameEventToServer(EVENT_NAMES.teleportUsed, { sourceId });
}
