import { FireProjectileRequest } from "@shared/types";
import { OneShotGameMode } from "../game_mode";
import { AbilityBase } from "./base_ability";

export class ability_boomerang_shot extends AbilityBase {
    OnSpellStart(): void {
        const self = (this as unknown) as CDOTA_Ability_Lua;
        const caster = self.GetCaster();
        const playerId = caster.GetPlayerOwnerID();
        if (playerId === undefined || playerId < 0) {
            return;
        }

        const target = self.GetCursorPosition();
        const payload: FireProjectileRequest = {
            targetX: target.x,
            targetY: target.y,
            targetZ: target.z,
            chargePct: 0
        };

        const gameMode = (GameRules as any).OneShotGameMode as OneShotGameMode;
        gameMode.combat.handleFire(playerId, payload);
    }

    GetCastRange(location: Vector, target: CDOTA_BaseNPC | undefined): number {
        return 900;
    }
}
