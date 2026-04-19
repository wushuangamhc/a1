import { EVENT_NAMES } from "@shared/config";
import { FireProjectileRequest, ProjectileFiredEvent, ProjectileHitEvent } from "@shared/types";
import { RuntimeState } from "@game/state";
import { HERO_DEFINITIONS } from "@game/hero_definitions";
import { syncPlayerState, syncScoreboard } from "@game/net_tables";
import { now } from "@game/lib/time";
import { PickupSystem } from "@game/systems/pickup_system";

export class CombatSystem {
  constructor(
    private readonly state: RuntimeState,
    private readonly pickups: PickupSystem
  ) {}

  handleFire(playerId: PlayerID, payload: FireProjectileRequest): void {
    const player = this.state.players.get(playerId);
    const hero = PlayerResource.GetSelectedHeroEntity(playerId);
    if (!player || !hero || !player.isAlive) {
      return;
    }

    const currentTime = now();
    if (currentTime < player.fireCooldownEndsAt) {
      return;
    }

    const heroDefinition = HERO_DEFINITIONS[player.heroId];
    const origin = hero.GetAbsOrigin();
    const baseDirection = Vector(payload.targetX - origin.x, payload.targetY - origin.y, 0 as never);
    const direction = baseDirection.Normalized();
    const chargePct = math.max(0, math.min(payload.chargePct ?? 0, 1));

    const rangeBonusPct = heroDefinition.chargeRangeBonusPct ?? 0;
    const range = heroDefinition.maxRange * (1 + rangeBonusPct * chargePct);
    const cooldownScale = player.activeRuneId === "frenzy" ? 0.6 : 1;
    player.fireCooldownEndsAt = currentTime + heroDefinition.cooldown * cooldownScale;
    syncPlayerState(this.state, playerId);

    const firedEvent: ProjectileFiredEvent = {
      shooterId: playerId,
      heroId: player.heroId,
      projectileType: heroDefinition.projectileType,
      origin: { x: origin.x, y: origin.y, z: origin.z },
      target: { x: payload.targetX, y: payload.targetY, z: payload.targetZ }
    };
    CustomGameEventManager.Send_ServerToAllClients(EVENT_NAMES.projectileFired, firedEvent);

    const shots = player.multishotCount;
    for (let shotIndex = 0; shotIndex < shots; shotIndex += 1) {
      const sideOffset = shots > 1 ? (shotIndex === 0 ? -48 : 48) : 0;
      const adjustedOrigin = (origin as any) + Vector(-direction.y * sideOffset, direction.x * sideOffset, 0);
      this.resolveLineHit(playerId, adjustedOrigin, direction, range, heroDefinition.projectileWidth);
    }
  }

  registerKill(attackerId: PlayerID, victimId: PlayerID, projectileType: ProjectileHitEvent["projectileType"]): void {
    const attacker = this.state.players.get(attackerId);
    const victim = this.state.players.get(victimId);
    const victimHero = PlayerResource.GetSelectedHeroEntity(victimId);
    if (!attacker || !victim || !victimHero) {
      return;
    }

    if (victim.hasShield) {
      victim.hasShield = false;
      victim.blessingId = "none";
      syncPlayerState(this.state, victimId);
      const shieldEvent: ProjectileHitEvent = {
        attackerId,
        victimId,
        projectileType,
        consumedShield: true
      };
      CustomGameEventManager.Send_ServerToAllClients(EVENT_NAMES.projectileHit, shieldEvent);
      return;
    }

    victim.deaths += 1;
    victim.isAlive = false;
    victimHero.Kill(undefined, PlayerResource.GetSelectedHeroEntity(attackerId));
    this.pickups.clearBlessing(victimId);
    this.state.resetRespawn(victimId);

    attacker.kills += 1;
    const currentTeamKills = this.state.teamKills.get(attacker.teamId) ?? 0;
    this.state.teamKills.set(attacker.teamId, currentTeamKills + 1);

    syncPlayerState(this.state, attackerId);
    syncPlayerState(this.state, victimId);
    syncScoreboard(this.state);

    const hitEvent: ProjectileHitEvent = {
      attackerId,
      victimId,
      projectileType,
      consumedShield: false
    };
    CustomGameEventManager.Send_ServerToAllClients(EVENT_NAMES.projectileHit, hitEvent);
    CustomGameEventManager.Send_ServerToAllClients(EVENT_NAMES.killFeed, {
      attackerId,
      victimId,
      heroId: attacker.heroId
    });
  }

  private resolveLineHit(
    attackerId: PlayerID,
    origin: Vector,
    direction: Vector,
    range: number,
    width: number
  ): void {
    const destination = (origin as any) + (direction as any) * range;
    const attackerTeam = PlayerResource.GetTeam(attackerId);
    const enemies = FindUnitsInLine(
      attackerTeam,
      origin,
      destination,
      undefined,
      width,
      UnitTargetTeam.ENEMY,
      UnitTargetType.HERO,
      UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.NO_INVIS
    );

    const victim = enemies[0];
    if (!victim) {
      return;
    }

    const victimId = victim.GetPlayerOwnerID();
    if (victimId === undefined || victimId < 0) {
      return;
    }

    const player = this.state.players.get(attackerId);
    if (!player) {
      return;
    }

    this.registerKill(attackerId, victimId, HERO_DEFINITIONS[player.heroId].projectileType);
  }

}
