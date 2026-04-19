import { FireProjectileRequest } from "@shared/types";
import { OneShotGameMode } from "../game_mode";


const AbilityBase = CDOTA_Ability_Lua as any;
export class ability_roller_shot extends AbilityBase {
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
        return 1000;
    }
}
