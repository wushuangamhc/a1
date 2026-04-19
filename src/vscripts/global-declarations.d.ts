import {
  BlessingId,
  FireProjectileRequest,
  HeroId,
  MapObjectState,
  MatchStateSnapshot,
  PickupCompletedEvent,
  PickupStartedEvent,
  PlayerCombatState,
  ProjectileFiredEvent,
  ProjectileHitEvent,
  RuneId,
  ScoreboardEntry
} from "@shared/types";

declare global {
  interface CustomGameEventDeclarations {
    oss_select_hero: { heroId: HeroId };
    oss_fire_projectile: FireProjectileRequest;
    oss_interact_pickup: { pickupId: string };
    oss_projectile_fired: ProjectileFiredEvent;
    oss_projectile_hit: ProjectileHitEvent;
    oss_pickup_started: PickupStartedEvent;
    oss_pickup_completed: PickupCompletedEvent;
    oss_kill_feed: { attackerId: PlayerID; victimId: PlayerID; heroId: HeroId };
    oss_match_ended: MatchStateSnapshot;
    oss_teleport_used: { sourceId: string };
  }

  interface CustomNetTableDeclarations {
    oss_player_state: Record<string, PlayerCombatState>;
    oss_match_state: {
      scoreboard: Record<string, ScoreboardEntry>;
      snapshot: MatchStateSnapshot;
    };
    oss_map_state: Record<string, MapObjectState>;
    oss_pickup_state: Record<string, unknown>;
    oss_team_state: Record<string, unknown>;
  }

  // Vector arithmetic extensions for TypeScriptToLua
  interface Vector {
    __add(other: Vector): Vector;
    __sub(other: Vector): Vector;
    __mul(this: Vector, scalar: number): Vector;
    __div(this: Vector, scalar: number): Vector;
    __unm(): Vector;
  }
}

export {};
