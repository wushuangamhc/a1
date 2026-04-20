/**
 * 计时器系统 —— 从 c1 项目迁移。
 * Bullet 系统重度依赖 Timer.GameTimer / Timer.StopTimer。
 */
import { CModule } from "@game/framework/module";
import { reloadable } from "@game/framework/reloadable";
import "@game/framework/helpers";

declare global {
	var Timer: CTimer;
}

@reloadable
class CTimer extends CModule {
	logicTimer?: CBaseEntity;
	index: number = 1;
	timerList: Record<string, {
		interval: number;
		stack: number;
		type: "GameTimer" | "Timer" | "Modifier";
		entity: any;
		callback: () => number | void;
	}> = {};
	record: number = 0;

	Think(): void {
		this.record++;
		const frame = FrameTime();
		const keys = Object.keys(this.timerList).sort();
		for (let i = keys.length; i >= 1; i--) {
			const index = keys[i - 1] as unknown as number;
			const timerData = this.timerList[index];
			if (timerData == undefined) {
				continue;
			}
			if (GameRules.IsGamePaused() && (timerData.type == "GameTimer" || timerData.type == "Modifier")) {
				continue;
			}
			if (timerData.entity != undefined && !IsValid(timerData.entity)) {
				// @ts-ignore
				this.timerList[index] = undefined;
				continue;
			}
			timerData.stack += frame;
			if (timerData.stack >= timerData.interval) {
				const [_, interval] = xpcall(timerData.callback as any, (err: any) => traceback(err), timerData.entity ?? this);
				if (typeof interval == "number") {
					timerData.stack -= timerData.interval;
					timerData.interval = interval;
				} else if (timerData.type == "Modifier") {
					timerData.stack -= timerData.interval;
				} else {
					// @ts-ignore
					this.timerList[index] = undefined;
				}
			}
		}
	}

	init(reload: boolean): void {
		if (!reload) {
			if (IsServer()) {
				this.logicTimer = SpawnEntityFromTableSynchronous("logic_timer", {
					origin: "0 0 0",
					RefireTime: 0,
				});
				const scope = this.logicTimer!.GetOrCreatePrivateScriptScope() as Record<string, (...args: unknown[]) => void>;
				scope.OnTimer = () => {
					this.Think();
				};
				this.logicTimer!.RedirectOutput("OnTimer", "OnTimer", this.logicTimer!);
			}
		}
	}

	StartThink(
		type: "Timer" | "GameTimer" | "Modifier",
		entity: any,
		fInterval: number,
		funcThink: () => number | void
	): string {
		fInterval = math.max(fInterval, FrameTime());
		this.timerList[this.index] = {
			interval: fInterval,
			stack: 0,
			type: type,
			entity: entity,
			callback: funcThink,
		};
		this.index++;
		return tostring(this.index - 1);
	}

	Timer(fInterval: number, funcThink: () => any, _?: any): string;
	Timer(entity: any, fInterval: number, funcThink: () => number | void): string;
	Timer(entity: any, fInterval: any, funcThink?: () => number | void): string {
		if (funcThink == undefined) {
			funcThink = fInterval;
			fInterval = entity;
			entity = undefined;
		}
		return this.StartThink("Timer", entity, fInterval, funcThink!);
	}

	GameTimer(fInterval: number, funcThink: () => any, _?: any): string;
	GameTimer(entity: any, fInterval: number, funcThink: () => number | void): string;
	GameTimer(entity: any, fInterval: any, funcThink?: any): string {
		if (funcThink == undefined) {
			funcThink = fInterval;
			fInterval = entity;
			entity = undefined;
		}
		return this.StartThink("GameTimer", entity, fInterval, funcThink);
	}

	StartIntervalThink(modifier: any, fInterval: number, funcThink: () => void): string {
		return this.StartThink("Modifier", modifier, fInterval, funcThink);
	}

	StopTimer(index: string): void {
		const id = tonumber(index) as unknown as string;
		if (this.timerList[id]) {
			delete this.timerList[id];
		}
	}

	RestartTimer(index: string): void {
		const id = tonumber(index) as unknown as string;
		if (this.timerList[id]) {
			this.timerList[id].stack = 0;
		}
	}
}

(globalThis as any).Timer ??= new CTimer();

export { CTimer };
