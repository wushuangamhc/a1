import { BLESSING_CHANNEL_SECONDS, EVENT_NAMES } from "@shared/config";
import { BlessingId, PickupCompletedEvent, PickupStartedEvent, RuneId } from "@shared/types";
import { RuntimeState } from "@game/state";
import { syncPlayerState } from "@game/net_tables";
import { now, schedule } from "@game/lib/time";

interface PickupTarget {
  id: string;
  pickupType: "blessing" | "rune";
  blessingId?: BlessingId;
  runeId?: RuneId;
}

export class PickupSystem {
  constructor(private readonly state: RuntimeState) {}

  handleInteract(playerId: PlayerID, payload: { pickupId?: string }): void {
    if (!payload.pickupId) {
      return;
    }

    const target = this.resolvePickup(payload.pickupId);
    if (!target) {
      return;
    }

    if (target.pickupType === "blessing") {
      const startEvent: PickupStartedEvent = {
        playerId,
        pickupId: target.id,
        pickupType: "blessing",
        channelSeconds: BLESSING_CHANNEL_SECONDS
      };
      CustomGameEventManager.Send_ServerToAllClients(EVENT_NAMES.pickupStarted, startEvent);
      schedule(BLESSING_CHANNEL_SECONDS, () => this.finishBlessingPickup(playerId, target));
      return;
    }

    this.finishRunePickup(playerId, target);
  }

  tick(): void {
    for (const [playerId, player] of this.state.players) {
      if (player.activeRuneId !== "none" && player.runeExpiresAt > 0 && player.runeExpiresAt <= now()) {
        player.activeRuneId = "none";
        player.runeExpiresAt = 0;
        syncPlayerState(this.state, playerId);
      }
    }
  }

  clearBlessing(playerId: PlayerID): void {
    const player = this.state.players.get(playerId);
    if (!player) {
      return;
    }

    player.blessingId = "none";
    player.hasShield = false;
    player.multishotCount = 1;
    player.moveSpeedBonusPct = 0;
    syncPlayerState(this.state, playerId);
  }

  private finishBlessingPickup(playerId: PlayerID, target: PickupTarget): void {
    const player = this.state.players.get(playerId);
    if (!player || !player.isAlive || target.pickupType !== "blessing" || !target.blessingId) {
      return;
    }

    player.blessingId = target.blessingId;
    player.hasShield = target.blessingId === "shield";
    player.multishotCount = target.blessingId === "multishot" ? 2 : 1;
    player.moveSpeedBonusPct = target.blessingId === "swiftness" ? 18 : 0;
    syncPlayerState(this.state, playerId);

    const completedEvent: PickupCompletedEvent = {
      playerId,
      pickupId: target.id,
      pickupType: "blessing",
      blessingId: target.blessingId
    };
    CustomGameEventManager.Send_ServerToAllClients(EVENT_NAMES.pickupCompleted, completedEvent);
  }

  private finishRunePickup(playerId: PlayerID, target: PickupTarget): void {
    const player = this.state.players.get(playerId);
    if (!player || target.pickupType !== "rune" || !target.runeId) {
      return;
    }

    player.activeRuneId = target.runeId;
    player.runeExpiresAt = now() + 5;
    syncPlayerState(this.state, playerId);

    const completedEvent: PickupCompletedEvent = {
      playerId,
      pickupId: target.id,
      pickupType: "rune",
      runeId: target.runeId
    };
    CustomGameEventManager.Send_ServerToAllClients(EVENT_NAMES.pickupCompleted, completedEvent);
  }

  private resolvePickup(pickupId: string): PickupTarget | undefined {
    if (pickupId.includes("shield")) {
      return { id: pickupId, pickupType: "blessing", blessingId: "shield" };
    }
    if (pickupId.includes("multishot")) {
      return { id: pickupId, pickupType: "blessing", blessingId: "multishot" };
    }
    if (pickupId.includes("swiftness")) {
      return { id: pickupId, pickupType: "blessing", blessingId: "swiftness" };
    }
    if (pickupId.includes("haste")) {
      return { id: pickupId, pickupType: "rune", runeId: "haste" };
    }
    if (pickupId.includes("ambush")) {
      return { id: pickupId, pickupType: "rune", runeId: "ambush" };
    }
    if (pickupId.includes("frenzy")) {
      return { id: pickupId, pickupType: "rune", runeId: "frenzy" };
    }
    return undefined;
  }
}
