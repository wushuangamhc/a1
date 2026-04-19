export {};

declare const _G: Record<string, any>;
declare const thisEntity: CBaseEntity;

function OnStartTouch(this: void, trigger: any): void {
    // no-op
}

function OnEndTouch(this: void, trigger: any): void {
    // no-op
}

function StartLogic(this: void, trigger: any): void {
    const triggerName = thisEntity.GetName();
    const npc = Entities.FindByNameWithin(null as any, triggerName + "_npc", thisEntity.GetAbsOrigin(), 4000) as CDOTA_BaseNPC | undefined;
    if (!npc) {
        return;
    }
    const target = Entities.FindByNameWithin(null as any, triggerName + "_target", thisEntity.GetAbsOrigin(), 4000) as CDOTA_BaseNPC | undefined;
    if (!target) {
        return;
    }

    (thisEntity as any).bindNpc = npc;
    const breatheFire = npc.FindAbilityByName("breathe_fire");
    if (!breatheFire) {
        print("ERROR: thisEntity.hBreatheFireAbility not found");
        return;
    }
    (thisEntity as any).hBreatheFireAbility = breatheFire;

    const model = triggerName + "_model";
    (thisEntity as any).modelName = model;
    (thisEntity as any).fRefireTime = 1.8;
    (thisEntity as any).fQuickRefireTime = 0.5;
    (thisEntity as any).bNextAttackIsNormal = false;
    (thisEntity as any).hTarget = target;
    (thisEntity as any).nQuickRefires = 0;
    (thisEntity as any).fNextAttackTime = GameRules.GetGameTime() + (thisEntity as any).fQuickRefireTime;

    thisEntity.SetContextThink(
        "FireTrapActivateAlternating",
        () => FireTrapActivateAlternating(),
        0
    );
}

function DisableTrap(this: void, trigger: any): void {
    (thisEntity as any).bDisabled = true;
}

function FireTrapActivateAlternating(this: void): number | undefined {
    if (!IsServer()) {
        return undefined;
    }
    if ((thisEntity as any).bDisabled) {
        return -1;
    }
    if (GameRules.IsGamePaused()) {
        return 0.5;
    }
    if (GameRules.GetGameTime() >= (thisEntity as any).fNextAttackTime) {
        if ((thisEntity as any).bNextAttackIsNormal === false) {
            return QuickRefire();
        } else {
            return NormalRefire();
        }
    }
    return 0.25;
}

function QuickRefire(this: void): number {
    DoEntFire((thisEntity as any).modelName, "SetAnimation", "bark_attack", 0.4, undefined as any, undefined as any);
    (thisEntity as any).bindNpc.SetContextThink(
        "QuickRefireCast",
        () => {
            (thisEntity as any).bindNpc.CastAbilityOnPosition(
                (thisEntity as any).hTarget.GetAbsOrigin(),
                (thisEntity as any).hBreatheFireAbility,
                -1
            );
            return undefined;
        },
        0.3
    );

    (thisEntity as any).nQuickRefires = (thisEntity as any).nQuickRefires + 1;
    if ((thisEntity as any).nQuickRefires <= 2) {
        (thisEntity as any).fNextAttackTime = GameRules.GetGameTime() + (thisEntity as any).fQuickRefireTime;
    } else {
        (thisEntity as any).bNextAttackIsNormal = true;
        (thisEntity as any).fNextAttackTime = GameRules.GetGameTime() + (thisEntity as any).fRefireTime;
        (thisEntity as any).nQuickRefires = 0;
    }
    return 0.25;
}

function NormalRefire(this: void): number {
    DoEntFire((thisEntity as any).modelName, "SetAnimation", "bark_attack", 0.4, undefined as any, undefined as any);
    (thisEntity as any).bindNpc.SetContextThink(
        "NormalRefireCast",
        () => {
            (thisEntity as any).bindNpc.CastAbilityOnPosition(
                (thisEntity as any).hTarget.GetAbsOrigin(),
                (thisEntity as any).hBreatheFireAbility,
                -1
            );
            return undefined;
        },
        0.3
    );

    (thisEntity as any).fNextAttackTime = GameRules.GetGameTime() + (thisEntity as any).fRefireTime;
    (thisEntity as any).bNextAttackIsNormal = false;
    return 0.25;
}

_G.OnStartTouch = OnStartTouch;
_G.OnEndTouch = OnEndTouch;
_G.StartLogic = StartLogic;
_G.DisableTrap = DisableTrap;
_G.FireTrapActivateAlternating = FireTrapActivateAlternating;
_G.QuickRefire = QuickRefire;
_G.NormalRefire = NormalRefire;
