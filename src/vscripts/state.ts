import { MatchStateSnapshot, MatchMode, PlayerCombatState } from "@shared/types";
import { DUO_KILL_TARGET, FFA_KILL_TARGET, FAST_RESPAWN_SECONDS, GAME_LENGTH_SECONDS } from "@shared/config";
import { now } from "@game/lib/time";

export class RuntimeState {
  public readonly players = new Map<PlayerID, PlayerCombatState>();
  public readonly teamKills = new Map<DOTATeam_t, number>();
  public readonly brokenObjects = new Set<string>();
  public matchMode: MatchMode = "ffa";
  public phase: MatchStateSnapshot["phase"] = "warmup";
  public startedAt = 0;
  public winnerTeamId?: DOTATeam_t;

  ensurePlayer(playerId: PlayerID, teamId: DOTATeam_t): PlayerCombatState {
    const existing = this.players.get(playerId);
    if (existing) {
      return existing;
    }

    const created: PlayerCombatState = {
      playerId,
      heroId: "windrunner",
      blessingId: "none",
      activeRuneId: "none",
      kills: 0,
      deaths: 0,
      isAlive: true,
      hasShield: false,
      moveSpeedBonusPct: 0,
      multishotCount: 1,
      fireCooldownEndsAt: 0,
      runeExpiresAt: 0,
      respawnAt: 0,
      teamId,
      inBush: false
    };

    this.players.set(playerId, created);
    return created;
  }

  start(mode: MatchMode): void {
    this.matchMode = mode;
    this.phase = "in_progress";
    this.startedAt = now();
    this.winnerTeamId = undefined;
    this.teamKills.clear();
  }

  resetRespawn(playerId: PlayerID): void {
    const player = this.players.get(playerId);
    if (!player) {
      return;
    }

    player.isAlive = false;
    player.respawnAt = now() + FAST_RESPAWN_SECONDS;
  }

  snapshot(): MatchStateSnapshot {
    const killTarget = this.matchMode === "ffa" ? FFA_KILL_TARGET : DUO_KILL_TARGET;
    const elapsed = this.startedAt > 0 ? now() - this.startedAt : 0;
    const timeRemaining = math.max(0, GAME_LENGTH_SECONDS - elapsed);
    return {
      phase: this.phase,
      mode: this.matchMode,
      timeRemaining,
      killTarget,
      winnerTeamId: this.winnerTeamId
    };
  }
}
