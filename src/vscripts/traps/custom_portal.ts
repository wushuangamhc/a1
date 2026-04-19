export {};

declare const _G: Record<string, any>;
declare const thisEntity: CDOTA_BaseNPC;

function Spawn(this: void, kv: CScriptKeyValues): void {
    const skin = kv.GetValue("skin") as unknown as string;
    const type = skin === "1" ? 1 : 0;
    thisEntity.AddNewModifier(thisEntity, undefined, "modifier_custom_portal", { type: type });
}

_G.Spawn = Spawn;
