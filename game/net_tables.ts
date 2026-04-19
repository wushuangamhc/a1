import { NET_TABLES } from "@shared/config";
import { MapObjectState, ScoreboardEntry } from "@shared/types";
import { RuntimeState } from "@game/state";

export function syncPlayerState(state: RuntimeState, playerId: PlayerID): void {
  const player = state.players.get(playerId);
  if (!player) {
    return;
  }

  CustomNetTables.SetTableValue(NET_TABLES.playerState, tostring(playerId), {
    ...player
  });
}

export function syncScoreboard(state: RuntimeState): void {
  const entries: Record<string, ScoreboardEntry> = {};
  for (const [playerId, player] of state.players) {
    const name = PlayerResource.GetPlayerName(playerId) || `Player ${playerId}`;
    entries[tostring(playerId)] = {
      playerId,
      playerName: name,
      heroId: player.heroId,
      kills: player.kills,
      deaths: player.deaths,
      blessingId: player.blessingId,
      isAlive: player.isAlive,
      teamId: player.teamId
    };
  }

  CustomNetTables.SetTableValue(NET_TABLES.matchState, "scoreboard", entries);
  CustomNetTables.SetTableValue(NET_TABLES.matchState, "snapshot", state.snapshot());
}

export function syncMapObjects(objects: MapObjectState[]): void {
  for (const objectState of objects) {
    CustomNetTables.SetTableValue(NET_TABLES.mapState, objectState.id, objectState);
  }
}
