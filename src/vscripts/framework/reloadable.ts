/**
 * 重载装饰器
 * 从 c1 项目迁移：用于在脚本重载时复用同一个原型对象，保留运行时引用。
 */

const reloadGlobal = globalThis as typeof globalThis & { reloadCache: Record<string, any> };
if (reloadGlobal.reloadCache === undefined) {
	reloadGlobal.reloadCache = {};
}

export function reloadable<T extends { new(...args: any[]): {} }>(constructor: T): T {
	const className = (constructor as any).name as string;
	if (reloadGlobal.reloadCache[className] === undefined) {
		reloadGlobal.reloadCache[className] = constructor;
	}

	Object.assign(reloadGlobal.reloadCache[className].prototype, constructor.prototype);
	return reloadGlobal.reloadCache[className];
}
