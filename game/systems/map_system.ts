import { BUSH_FADEOUT_SECONDS, EVENT_NAMES, MAP_ENTITY_PREFIX, TELEPORT_COOLDOWN_SECONDS } from "@shared/config";
import { MapObjectState, TeleportUsedEvent } from "@shared/types";
import { RuntimeState } from "@game/state";
import { syncMapObjects, syncPlayerState } from "@game/net_tables";
import { now, schedule } from "@game/lib/time";

interface TeleportNode {
  id: string;
  trigger?: CBaseEntity;
  destination?: Vector;
}

export class MapSystem {
  private readonly mapObjects: MapObjectState[] = [];
  private readonly teleportNodes = new Map<string, TeleportNode>();
  private readonly teleportCooldowns = new Map<PlayerID, number>();

  constructor(private readonly state: RuntimeState) {}

  initialize(): void {
    this.cacheTeleportNodes();
    this.cacheStaticMapObjects();
    syncMapObjects(this.mapObjects);
  }

  tick(): void {
    this.syncBushStates();
  }

  useTeleport(playerId: PlayerID, sourceId: string): void {
    const hero = PlayerResource.GetSelectedHeroEntity(playerId);
    const sourceNode = this.teleportNodes.get(sourceId);
    const currentTime = now();
    const cooldown = this.teleportCooldowns.get(playerId) ?? 0;
    if (!hero || !sourceNode?.destination || cooldown > currentTime) {
      return;
    }

    FindClearSpaceForUnit(hero, sourceNode.destination, true);
    hero.AddNewModifier(hero, undefined, "modifier_invulnerable", { duration: 0.2 });
    this.teleportCooldowns.set(playerId, currentTime + TELEPORT_COOLDOWN_SECONDS);

    const eventPayload: TeleportUsedEvent = {
      playerId,
      sourceId,
      destinationId: `${sourceId}_dest`
    };
    CustomGameEventManager.Send_ServerToAllClients(EVENT_NAMES.teleportUsed, eventPayload);
  }

  private cacheTeleportNodes(): void {
    for (let index = 1; index <= 8; index += 1) {
      const trigger = Entities.FindByName(undefined, `${MAP_ENTITY_PREFIX.teleport}${index}`);
      const destinationMarker = Entities.FindByName(undefined, `${MAP_ENTITY_PREFIX.teleport}${index}_dest`);
      if (!trigger || !destinationMarker) {
        continue;
      }
      this.teleportNodes.set(`${MAP_ENTITY_PREFIX.teleport}${index}`, {
        id: `${MAP_ENTITY_PREFIX.teleport}${index}`,
        trigger,
        destination: destinationMarker.GetAbsOrigin()
      });
    }
  }

  private cacheStaticMapObjects(): void {
    for (let index = 1; index <= 12; index += 1) {
      this.addIfExists(`${MAP_ENTITY_PREFIX.breakable}${index}`, "breakable");
      this.addIfExists(`${MAP_ENTITY_PREFIX.bush}${index}`, "bush");
      this.addIfExists(`${MAP_ENTITY_PREFIX.wall}${index}`, "wall");
      this.addIfExists(`${MAP_ENTITY_PREFIX.blessingShrine}${index}`, "blessing");
      this.addIfExists(`${MAP_ENTITY_PREFIX.runeSpawn}${index}`, "rune");
    }
    for (const teleportId of this.teleportNodes.keys()) {
      this.mapObjects.push({ id: teleportId, kind: "teleport", isActive: true, destinationId: `${teleportId}_dest` });
    }
  }

  private addIfExists(id: string, kind: MapObjectState["kind"]): void {
    if (!Entities.FindByName(undefined, id)) {
      return;
    }
    this.mapObjects.push({ id, kind, isActive: true });
  }

  private syncBushStates(): void {
    for (const [playerId, playerState] of this.state.players) {
      const hero = PlayerResource.GetSelectedHeroEntity(playerId);
      if (!hero || !playerState.isAlive) {
        continue;
      }

      let inBush = false;
      for (let index = 1; index <= 12; index += 1) {
        const bush = Entities.FindByName(undefined, `${MAP_ENTITY_PREFIX.bush}${index}`);
        if (!bush) {
          continue;
        }

        if ((hero.GetAbsOrigin() - bush.GetAbsOrigin() as Vector).Length2D() <= 280) {
          inBush = true;
          break;
        }
      }

      if (inBush !== playerState.inBush) {
        playerState.inBush = inBush;
        if (inBush) {
          hero.AddNewModifier(hero, undefined, "modifier_rune_invis", { duration: 0.1 });
        } else {
          schedule(BUSH_FADEOUT_SECONDS, () => {
            if (!playerState.inBush && hero.IsAlive()) {
              hero.RemoveModifierByName("modifier_rune_invis");
            }
          });
        }
        syncPlayerState(this.state, playerId);
      }
    }
  }
}
