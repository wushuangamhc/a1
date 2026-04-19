export {};

declare const _G: Record<string, any>;
declare const thisEntity: CBaseEntity;

let triggerActive = true;
let n = 0;

function OnStartTouch(this: void, trigger: { activator: CDOTA_BaseNPC }): void {
    const triggerName = thisEntity.GetName();
    const model = triggerName + "_model";
    const npc = Entities.FindByNameWithin(null as any, triggerName + "_npc", thisEntity.GetAbsOrigin(), 6000) as CDOTA_BaseNPC | undefined;
    if (!npc) {
        return;
    }
    if ((npc as any).fNextAttackTime && (npc as any).fNextAttackTime >= GameRules.GetGameTime()) {
        return;
    }
    const target = Entities.FindByNameWithin(null as any, triggerName + "_target", thisEntity.GetAbsOrigin(), 6000) as CDOTA_BaseNPC | undefined;
    const fireTrap = npc.FindAbilityByName("custom_pudge_hook_trap");
    const fire_delay = 0.03;
    const reset_time = 3;
    const activator = trigger.activator;

    npc.SetContextThink(
        "pudge_hook_trap_anim",
        () => {
            DoEntFire(model, "SetAnimation", "fang_attack", 0.4, undefined as any, undefined as any);
            npc.SetContextThink(
                "pudge_hook_trap_cast",
                () => {
                    (fireTrap as any).activator = activator;
                    const offset = Vector(math.random(-500, 500), math.random(-500, 500), 0);
                    const targetPos = target!.GetOrigin().__add(offset);
                    npc.CastAbilityOnPosition(targetPos, fireTrap!, -1);
                    return undefined;
                },
                0.3
            );
            return undefined;
        },
        fire_delay
    );

    const heroIndex = trigger.activator.GetEntityIndex();
    const heroHandle = EntIndexToHScript(heroIndex);
    print("Trap Button Trigger Entered", (heroHandle as CDOTA_BaseNPC).GetUnitName());

    (npc as any).KillerToCredit = heroHandle;
    triggerActive = false;
    (npc as any).fRefireTime = 1.8;
    (npc as any).fQuickRefireTime = reset_time;
    (npc as any).bNextAttackIsNormal = false;
    (npc as any).nQuickRefires = 0;
    (npc as any).fNextAttackTime = GameRules.GetGameTime() + (npc as any).fQuickRefireTime;
}

function OnEndTouch(this: void, trigger: any): void {
    // no-op
}

_G.OnStartTouch = OnStartTouch;
_G.OnEndTouch = OnEndTouch;
