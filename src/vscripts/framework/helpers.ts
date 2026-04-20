/**
 * 弹道系统迁移用的通用辅助函数和全局类型声明。
 * 仅保留 bullet.ts 需要的部分，保持手术式最小改动。
 */

declare global {
	/** Vector 加法（TSTL 语言扩展：编译为 a + b） */
	const Vadd: LuaAddition<Vector, Vector, Vector>;
	/** Vector 减法（TSTL 语言扩展：编译为 a - b） */
	const Vsub: LuaSubtraction<Vector, Vector, Vector>;
	/** Vector 乘法（TSTL 语言扩展：编译为 a * b） */
	const Vmul: LuaMultiplication<Vector, Vector | number, Vector>;
	/** Vector 除法（TSTL 语言扩展：编译为 a / b） */
	const Vdiv: LuaDivision<Vector, Vector | number, Vector>;

	/** 零向量常量（Dota 引擎全局） */
	var vec3_zero: Vector;

	/** Source 引擎 Lua 运行时全局函数（dota-lua-types 中未声明） */
	function VectorIsZero(v: Vector): boolean;
	function VectorLerp(t: number, a: Vector, b: Vector): Vector;
	function RemapValClamped(val: number, a: number, b: number, c: number, d: number): number;

	/** 判断一个 handle 是否有效 */
	function IsValid(h: CEntityInstance | undefined): h is CEntityInstance;
	function IsValid(h: CDOTA_Buff | undefined): h is CDOTA_Buff;

	/** xpcall 用的回溯函数 */
	function traceback<T>(this: void, message: T): T;

	/** 浅拷贝表（Dota 引擎全局） */
	function shallowcopy<T>(t: T): T;

	/** 从数组中移除第一个等于 value 的元素（原地修改） */
	function ArrayRemove<T>(arr: T[], value: T): void;
	/** 在数组/表中查找 value 对应的键（索引），找不到返回 undefined */
	function TableFindKey<T>(arr: T[] | Record<string | number, T>, value: T): number | string | undefined;
	/** 四舍五入到指定小数位 */
	function Round(value: number, decimals?: number): number;
	/** 2D 方向向量（忽略 z） */
	function CalcDirection2D(from: Vector, to: Vector): Vector;
	/** 角度差 */
	function AngleDiff(a: number, b: number): number;

	/** 以下为 c1 项目残留的游戏逻辑钩子，在 A1 中暂无对应实现，提供空实现以保证编译通过 */
	function GetRingTrackRadius(caster: CDOTA_BaseNPC | undefined): number;

	enum StateEnum {
		DODGE_BULLET = "dodge_bullet",
	}

	interface CDOTA_BaseNPC {
		/** c1 扩展方法：检查单位是否处于某个状态。A1 暂未实现状态系统，永远返回 false。 */
		HasState(state: StateEnum | string): boolean;
	}

	namespace Event {
		/** c1 事件系统占位实现 */
		function Fire(eventName: string, data: any): void;
	}

	/** 扩大 SetParticleControlEnt 的 attachment 为可空（兼容 c1 调用） */
	interface CScriptParticleManager {
		SetParticleControlEnt(
			particle: ParticleID,
			controlPoint: number,
			unit: CBaseEntity,
			particleAttach: ParticleAttachment_t,
			attachment: string | undefined,
			offset: Vector,
			lockOrientation: boolean,
		): void;
	}
}

// Runtime implementations (仅当 Lua 运行时没有提供时提供兜底)
{
	const g = globalThis as any;

	if (g.vec3_zero === undefined) {
		g.vec3_zero = Vector(0, 0, 0);
	}

	if (typeof g.IsValid !== "function") {
		g.IsValid = (h: any) => h !== undefined && h !== null && typeof h.IsNull === "function" && !h.IsNull();
	}

	if (typeof g.traceback !== "function") {
		g.traceback = (message: any) => {
			print("[Error]: " + tostring(message));
			return message;
		};
	}

	if (typeof g.shallowcopy !== "function") {
		g.shallowcopy = <T>(t: T): T => {
			if (typeof t !== "object" || t === null) return t;
			const copy: any = {};
			for (const [k, v] of pairs(t as any)) {
				copy[k as any] = v;
			}
			return copy as T;
		};
	}

	if (typeof g.VectorIsZero !== "function") {
		g.VectorIsZero = (v: Vector) => v.x === 0 && v.y === 0 && v.z === 0;
	}

	if (typeof g.VectorLerp !== "function") {
		g.VectorLerp = (t: number, a: Vector, b: Vector) => Vector(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
	}

	if (typeof g.RemapValClamped !== "function") {
		g.RemapValClamped = (val: number, a: number, b: number, c: number, d: number) => {
			if (a === b) return val >= b ? d : c;
			let t = (val - a) / (b - a);
			if (t < 0) t = 0;
			if (t > 1) t = 1;
			return c + (d - c) * t;
		};
	}

	if (typeof g.ArrayRemove !== "function") {
		g.ArrayRemove = (arr: any[], value: any) => {
			if (arr == undefined) return;
			const idx = arr.indexOf(value);
			if (idx >= 0) {
				arr.splice(idx, 1);
			}
		};
	}

	if (typeof g.TableFindKey !== "function") {
		g.TableFindKey = (arr: any, value: any) => {
			if (arr == undefined) return undefined;
			for (const [k, v] of pairs(arr)) {
				if (v === value) return k;
			}
			return undefined;
		};
	}

	if (typeof g.Round !== "function") {
		g.Round = (value: number, decimals?: number) => {
			const factor = 10 ** (decimals ?? 0);
			return math.floor(value * factor + 0.5) / factor;
		};
	}

	if (typeof g.CalcDirection2D !== "function") {
		g.CalcDirection2D = (from: Vector, to: Vector) => {
			const dx = to.x - from.x;
			const dy = to.y - from.y;
			const len = math.sqrt(dx * dx + dy * dy);
			if (len < 0.0001) return Vector(0, 0, 0);
			return Vector(dx / len, dy / len, 0);
		};
	}

	if (typeof g.AngleDiff !== "function") {
		g.AngleDiff = (a: number, b: number) => {
			let diff = a - b;
			while (diff > 180) diff -= 360;
			while (diff < -180) diff += 360;
			return diff;
		};
	}


	if (typeof g.GetRingTrackRadius !== "function") {
		g.GetRingTrackRadius = (_caster: any) => 0;
	}

	if (g.StateEnum === undefined) {
		g.StateEnum = { DODGE_BULLET: "dodge_bullet" };
	}

	if (g.Event === undefined) {
		g.Event = {
			Fire: (_eventName: string, _data: any) => {
				// no-op 占位
			},
		};
	}
}

// CDOTA_BaseNPC.HasState —— c1 状态系统占位实现，A1 中始终返回 false
{
	const baseNpcProto = (CDOTA_BaseNPC as any)?.prototype;
	if (baseNpcProto != undefined && typeof baseNpcProto.HasState !== "function") {
		baseNpcProto.HasState = function (_state: any) {
			return false;
		};
	}
}

export { };
