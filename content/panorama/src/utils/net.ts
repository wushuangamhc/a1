import { EVENT_NAMES, NET_TABLES } from "@shared/config";
import { FireProjectileRequest, HeroId, MatchStateSnapshot, PlayerCombatState, ScoreboardEntry } from "@shared/types";

export function getLocalPlayerId(): PlayerID {
  return Game.GetLocalPlayerID() as PlayerID;
}

export function getPlayerState(playerId: PlayerID): PlayerCombatState | undefined {
  return CustomNetTables.GetTableValue(NET_TABLES.playerState, `${playerId}`) as PlayerCombatState | undefined;
}

export function getScoreboardEntries(): ScoreboardEntry[] {
  const raw = CustomNetTables.GetTableValue(NET_TABLES.matchState, "scoreboard") as Record<string, ScoreboardEntry> | undefined;
  if (!raw) {
    return [];
  }
  return Object.keys(raw).map((key) => raw[key]).sort((a, b) => b.kills - a.kills);
}

export function getMatchSnapshot(): MatchStateSnapshot | undefined {
  return CustomNetTables.GetTableValue(NET_TABLES.matchState, "snapshot") as MatchStateSnapshot | undefined;
}

export function selectHero(heroId: HeroId): void {
  GameEvents.SendCustomGameEventToServer(EVENT_NAMES.selectHero, { heroId });
}

export function sendFireRequest(request: FireProjectileRequest): void {
  GameEvents.SendCustomGameEventToServer(EVENT_NAMES.fireProjectile, request);
}

export function interactPickup(pickupId: string): void {
  GameEvents.SendCustomGameEventToServer(EVENT_NAMES.interactPickup, { pickupId });
}

export function useTeleport(sourceId: string): void {
  GameEvents.SendCustomGameEventToServer(EVENT_NAMES.teleportUsed, { sourceId });
}
