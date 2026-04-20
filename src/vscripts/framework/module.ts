/**
 * 基础模块：所有框架模块的基类。
 * 从 c1 项目迁移：提供统一的初始化/重载入口。
 */

declare global {
	/** 全局模块列表（单例，跨脚本重载共享） */
	var Modules: CModule[];
}

globalThis.Modules ??= [];

export class CModule {
	isModule: boolean = true;

	init(_reload: boolean): void {
		// override in subclass
	}

	initPriority(): number {
		return 0;
	}

	constructor() {
		Modules.push(this);
	}

	dispose(): void {
		const idx = Modules.indexOf(this);
		if (idx >= 0) {
			Modules.splice(idx, 1);
		}
	}

	static initialize(): void {
		Modules
			.sort((a, b) => b.initPriority() - a.initPriority())
			.forEach((m) => m.init(false));
	}

	static reload(): void {
		Modules
			.sort((a, b) => b.initPriority() - a.initPriority())
			.forEach((m) => m.init(true));
	}

	print(...args: any[]): void {
		print(`[${(this.constructor as any).name}${IsClient() ? " Client" : ""}]: `, ...args);
	}

	error(...args: any[]): void {
		print(`[${(this.constructor as any).name} ERROR${IsClient() ? " Client" : ""}]: `, ...args);
	}

	reset(): void {
		// override in subclass
	}

	static reset(): void {
		Modules.forEach((m) => m.reset());
	}
}
