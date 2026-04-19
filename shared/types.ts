export interface HeroDefinition {
  id: HeroId;
  displayName: string;
  displayNameCn: string;
  description: string;
  difficulty: "low" | "medium" | "high" | "extreme";
  projectileType: ProjectileType;
  maxRange: number;
  projectileWidth: number;
  cooldown: number;
  maxChargeTime?: number;
  chargeRangeBonusPct?: number;
  returnWidthMultiplier?: number;
}

export const HERO_IDS = ["striker", "deadeye", "boomerang"] as const;
export type HeroId = (typeof HERO_IDS)[number];

export const PROJECTILE_TYPES = ["instant_line", "charged_line", "returning_line"] as const;
export type ProjectileType = (typeof PROJECTILE_TYPES)[number];

export const BLESSING_IDS = ["none", "shield", "multishot", "swiftness"] as const;
export type BlessingId = (typeof BLESSING_IDS)[number];

export const RUNE_IDS = ["none", "haste", "ambush", "frenzy"] as const;
export type RuneId = (typeof RUNE_IDS)[number];

export const GAME_PHASES = ["warmup", "pregame", "in_progress", "post_game"] as const;
export type GamePhase = (typeof GAME_PHASES)[number];

export type MatchMode = "ffa" | "duo";

export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface PlayerCombatState {
  playerId: PlayerID;
  heroId: HeroId;
  blessingId: BlessingId;
  activeRuneId: RuneId;
  kills: number;
  deaths: number;
  isAlive: boolean;
  hasShield: boolean;
  moveSpeedBonusPct: number;
  multishotCount: number;
  fireCooldownEndsAt: number;
  runeExpiresAt: number;
  respawnAt: number;
  teamId: DOTATeam_t;
  inBush: boolean;
}

export interface ScoreboardEntry {
  playerId: PlayerID;
  playerName: string;
  heroId: HeroId;
  kills: number;
  deaths: number;
  blessingId: BlessingId;
  isAlive: boolean;
  teamId: DOTATeam_t;
}

export interface FireProjectileRequest {
  targetX: number;
  targetY: number;
  targetZ: number;
  chargePct?: number;
}

export interface ProjectileFiredEvent {
  shooterId: PlayerID;
  heroId: HeroId;
  projectileType: ProjectileType;
  origin: Vec3;
  target: Vec3;
}

export interface ProjectileHitEvent {
  attackerId: PlayerID;
  victimId: PlayerID;
  projectileType: ProjectileType;
  consumedShield: boolean;
}

export interface PickupStartedEvent {
  playerId: PlayerID;
  pickupId: string;
  pickupType: "blessing" | "rune";
  channelSeconds: number;
}

export interface PickupCompletedEvent {
  playerId: PlayerID;
  pickupId: string;
  pickupType: "blessing" | "rune";
  blessingId?: BlessingId;
  runeId?: RuneId;
}

export interface TeleportUsedEvent {
  playerId: PlayerID;
  sourceId: string;
  destinationId: string;
}

export interface MatchStateSnapshot {
  phase: GamePhase;
  mode: MatchMode;
  timeRemaining: number;
  killTarget: number;
  winnerTeamId?: DOTATeam_t;
}

export interface MapObjectState {
  id: string;
  kind: "breakable" | "teleport" | "bush" | "wall" | "blessing" | "rune";
  isActive: boolean;
  respawnAt?: number;
  destinationId?: string;
}
