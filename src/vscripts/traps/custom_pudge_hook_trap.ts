export {};

declare const _G: Record<string, any>;
declare const thisEntity: CDOTA_BaseNPC;

function Spawn(this: void, kv: CScriptKeyValues): void {
    const ability = thisEntity.AddAbility("custom_pudge_hook_trap");
    if (ability != null) {
        ability.SetLevel(1);
    }
}

_G.Spawn = Spawn;
