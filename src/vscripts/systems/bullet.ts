import { CModule } from "@game/framework/module";
import { reloadable } from "@game/framework/reloadable";
import { BULLET_TYPE, TEMPORARY_BLOCK_TYPE } from "@game/framework/bullet_enums";
import "@game/framework/helpers";
import "@game/framework/timer";

/** 弹道 */
@reloadable
class CBullet extends CModule {
	/** 存所有弹道的ID */
	bulletList: {
		[k: number]: LinearBulletData | TrackingBulletData | GuidedBulletData | RingBulletData | SurroundBulletData | CustomBulletData;
	};
	/** 自增的弹道索引，每次创建弹道+1 */
	bulletIndex: number;
	/** 主计时器 */
	mainTimer: string | undefined;
	/** 默认弹道生命周期 */
	defaultLifetime = 10;
	/** 减速系数，不扩展暂时就这么写 */
	slowFactor = 1;
	/** debug模式 */
	debug: boolean;

	/** 存环绕弹道组，环绕弹道组有中心位置、角速度、当前方向等相关信息，组里的环绕弹道会根据这些信息排布 */
	surroundGroup: Record<string, SurroundGroupData>;

	/** 弹道数量缓存，避免每帧计算 */
	private bulletCount: number = 0;
	/** 待删除的弹道列表，延迟删除避免遍历时修改 */
	private pendingRemoval: number[] = [];

	/** 空间分区：网格大小（单位：游戏单位） */
	private readonly GRID_SIZE = 1024;
	/** 空间分区：网格存储 {gridKey: bulletIndexes[]} */
	private spatialGrid: Record<string, number[]> = {};

	/** 对象池：已销毁的弹道数据对象池，按类型分类 */
	private bulletPool: {
		[BULLET_TYPE.LINEAR]: LinearBulletData[],
		[BULLET_TYPE.TRACKING]: TrackingBulletData[],
		[BULLET_TYPE.GUIDED]: GuidedBulletData[],
		[BULLET_TYPE.RING]: RingBulletData[],
		[BULLET_TYPE.SURROUND]: SurroundBulletData[],
		[BULLET_TYPE.CUSTOM]: CustomBulletData[],
	} = {
			[BULLET_TYPE.LINEAR]: [],
			[BULLET_TYPE.TRACKING]: [],
			[BULLET_TYPE.GUIDED]: [],
			[BULLET_TYPE.RING]: [],
			[BULLET_TYPE.SURROUND]: [],
			[BULLET_TYPE.CUSTOM]: [],
		};
	/** 对象池最大容量（每种类型） */
	private readonly POOL_MAX_SIZE = 50;

	/** 批量处理：按类型分组的弹道索引 */
	private bulletsByType: {
		[BULLET_TYPE.LINEAR]: number[],
		[BULLET_TYPE.TRACKING]: number[],
		[BULLET_TYPE.GUIDED]: number[],
		[BULLET_TYPE.RING]: number[],
		[BULLET_TYPE.SURROUND]: number[],
		[BULLET_TYPE.CUSTOM]: number[],
	} = {
			[BULLET_TYPE.LINEAR]: [],
			[BULLET_TYPE.TRACKING]: [],
			[BULLET_TYPE.GUIDED]: [],
			[BULLET_TYPE.RING]: [],
			[BULLET_TYPE.SURROUND]: [],
			[BULLET_TYPE.CUSTOM]: [],
		};

	//********************************************************************************
	// 碰撞反弹系统
	//********************************************************************************

	/** 临时阻挡区域索引 */
	private temporaryBlockIndex: number = 0;
	/** 临时阻挡区域列表 */
	private temporaryBlocks: Record<number, TemporaryBlockData> = {};
	/** 碰撞检测步进距离 */
	private readonly TICK_DISTANCE = 10;
	/** 碰撞精确检测步进距离 */
	private readonly BLOCK_TICK_DISTANCE = 1;
	/** 法向量计算圆周精度 */
	private readonly CIRCLE_ACCURACY = 8;
	/** 法向量计算圆半径 */
	private readonly CIRCLE_RADIUS = 10;
	init(bReload: boolean): void {
		if (!bReload) {
			this.bulletList = {};
			this.bulletIndex = 1;
			this.surroundGroup = {};
			this.bulletCount = 0;
			this.pendingRemoval = [];
			this.spatialGrid = {};
			this.bulletsByType = {
				[BULLET_TYPE.LINEAR]: [],
				[BULLET_TYPE.TRACKING]: [],
				[BULLET_TYPE.GUIDED]: [],
				[BULLET_TYPE.RING]: [],
				[BULLET_TYPE.SURROUND]: [],
				[BULLET_TYPE.CUSTOM]: [],
			};
		}
		this.debug = false;
		// 优化：使用 pairs 直接遍历，避免创建临时数组
		for (const [index, projInfo] of pairs(this.bulletList)) {
			this.DestroyBullet(projInfo);
		}
		this.bulletList = {};
		this.bulletCount = 0;
		this.spatialGrid = {};


		if (this.mainTimer != undefined) {
			Timer.StopTimer(this.mainTimer);
			this.mainTimer = undefined;
		}
		this.mainTimer = Timer.GameTimer(FrameTime(), () => {
			// 优化：使用缓存的弹道数量，避免每次计算
			if (this.bulletCount > 500) {
				// 优化：改进清理策略，只清理超过1秒的旧弹道
				const currentTime = GameRules.GetGameTime();
				let deleteCount = this.bulletCount - 400;
				let deleted = 0;
				for (const [index, projInfo] of pairs(this.bulletList)) {
					if (deleted >= deleteCount) break;
					// 只清理生命周期超过1秒的弹道，避免误删新创建的弹道
					const bulletAge = currentTime - (projInfo.__createdTime ?? currentTime);
					if (bulletAge > 1.0 && (projInfo.__projType == BULLET_TYPE.LINEAR || projInfo.__projType == BULLET_TYPE.TRACKING || projInfo.__projType == BULLET_TYPE.GUIDED)) {
						const casterName = IsValid(projInfo.caster) ? projInfo.caster.GetUnitName() : "invalidUnit";
						const abilityName = IsValid(projInfo.ability) ? projInfo.ability.GetAbilityName() : "invalidAbility";
						const effectName = projInfo.effectName ?? "invalidEffect";
						// 标记为待删除，而不是立即删除
						table.insert(this.pendingRemoval, projInfo.__projIndex);
						deleted++;
					}
				}
			}

			// 批量处理优化：按类型分组更新
			this.BatchUpdateLinearBullets();
			this.BatchUpdateTrackingBullets();
			this.BatchUpdateGuidedBullets();
			this.BatchUpdateRingBullets();
			this.BatchUpdateCustomBullets();

			for (const [groupName, groupInfo] of pairs(this.surroundGroup)) {
				const [success, errorMessage] = xpcall(() => this.OnSurroundGroupThink(groupInfo), (err: any) => traceback(err));
				if (!success) {
					this.SafePrint(`Surround group think failed: ${tostring(groupName)} => ${tostring(errorMessage)}`);
				}
			}

			// 处理延迟删除的弹道
			if (this.pendingRemoval.length > 0) {
				for (const [_, index] of ipairs(this.pendingRemoval)) {
					const bulletData = this.bulletList[index];
					if (bulletData != undefined) {
						// 先调用销毁逻辑（清理特效、马甲等）
						this.DestroyBullet(bulletData);
					}
				}
				this.pendingRemoval = [];
			}

			return FrameTime();
		});
	}


	//********************************************************************************
	// 创建
	//********************************************************************************

	/** 创建线性弹道 */
	CreateLinearBullet(params: LinearCreateParams) {
		if (params.caster != undefined && !IsValid(params.caster)) return;
		if (params.ability != undefined && !IsValid(params.ability)) return;
		if (params.caster?.GetTeamNumber() == DOTATeam_t.DOTA_TEAM_BADGUYS) {
			params.moveSpeed = params.moveSpeed * this.slowFactor;
		}
		let bulletData: LinearBulletData = Object.assign({
			__position: params.spawnOrigin,
			__velocity: Vmul(params.direction.Normalized(), params.moveSpeed),
			__lifeTime: params.distance / params.moveSpeed,
			__lifeTimeRemaining: params.distance / params.moveSpeed,
			__projType: BULLET_TYPE.LINEAR,
			__projIndex: this.bulletIndex,
			__nextThink: params.interval != undefined ? (GameRules.GetGameTime() + params.interval) : undefined,
			__hitRecord: [],
			__teamNumber: params.caster?.GetTeamNumber() ?? DOTATeam_t.DOTA_TEAM_GOODGUYS,
			__thinker: params.thinker ? SpawnEntityFromTableSynchronous("prop_dynamic", { origin: params.spawnOrigin, model: "models/development/invisiblebox.vmdl" }) as CDOTA_BaseNPC : undefined,
			teamFilter: params.ability != undefined ? params.ability.GetAbilityTargetTeam() : DOTA_UNIT_TARGET_TEAM.DOTA_UNIT_TARGET_TEAM_NONE,
			typeFilter: params.ability != undefined ? params.ability.GetAbilityTargetType() : DOTA_UNIT_TARGET_TYPE.DOTA_UNIT_TARGET_NONE,
			flagFilter: params.ability != undefined ? params.ability.GetAbilityTargetFlags() : DOTA_UNIT_TARGET_FLAGS.DOTA_UNIT_TARGET_FLAG_NONE,
		}, params);

		// 创建特效
		if (params.ParticleCreator != undefined) {
			bulletData.__particleID = params.ParticleCreator(bulletData);
		} else if (params.effectName) {
			const particleID = ParticleManager.CreateParticle(params.effectName, ParticleAttachment_t.PATTACH_CUSTOMORIGIN, params.caster);
			ParticleManager.SetParticleControlTransformForward(particleID, 0, params.spawnOrigin, (bulletData.__velocity as Vector).Normalized());
			ParticleManager.SetParticleControl(particleID, 1, bulletData.__velocity);
			bulletData.__particleID = particleID;
		}

		return this.InitBullet(bulletData);
	}

	/** 创建追踪弹道 */
	CreateTrackingBullet(params: TrackingCreateParams) {
		if (params.caster != undefined && !IsValid(params.caster)) return;
		if (params.target != undefined && !IsValid(params.target)) return;
		if (params.ability != undefined && !IsValid(params.ability)) return;
		if (params.caster?.GetTeamNumber() == DOTATeam_t.DOTA_TEAM_BADGUYS) {
			params.moveSpeed = params.moveSpeed * this.slowFactor;
		}
		let bulletData: TrackingBulletData = Object.assign({
			__position: params.spawnOrigin,
			__target: params.target.GetAbsOrigin(),
			__velocity: Vmul(Vsub(params.target.GetAbsOrigin(), params.spawnOrigin).Normalized(), params.moveSpeed),
			__projType: BULLET_TYPE.TRACKING,
			__projIndex: this.bulletIndex,
			__nextThink: params.interval != undefined ? (GameRules.GetGameTime() + params.interval) : undefined,
			__hitRecord: [params.target],
			__teamNumber: params.caster?.GetTeamNumber() ?? DOTATeam_t.DOTA_TEAM_GOODGUYS,
			teamFilter: params.ability != undefined ? params.ability.GetAbilityTargetTeam() : DOTA_UNIT_TARGET_TEAM.DOTA_UNIT_TARGET_TEAM_NONE,
			typeFilter: params.ability != undefined ? params.ability.GetAbilityTargetType() : DOTA_UNIT_TARGET_TYPE.DOTA_UNIT_TARGET_NONE,
			flagFilter: params.ability != undefined ? params.ability.GetAbilityTargetFlags() : DOTA_UNIT_TARGET_FLAGS.DOTA_UNIT_TARGET_FLAG_NONE,
		}, params);

		// 创建特效
		if (params.ParticleCreator != undefined) {
			bulletData.__particleID = params.ParticleCreator(bulletData);
		} else if (params.effectName) {
			const particleID = ParticleManager.CreateParticle(params.effectName, ParticleAttachment_t.PATTACH_CUSTOMORIGIN, params.caster);
			ParticleManager.SetParticleControlTransformForward(particleID, 0, params.spawnOrigin, (bulletData.__velocity as Vector).Normalized());
			ParticleManager.SetParticleControlEnt(particleID, 1, bulletData.target, ParticleAttachment_t.PATTACH_POINT_FOLLOW, "attach_hitloc", bulletData.target.GetAbsOrigin(), false);
			ParticleManager.SetParticleControl(particleID, 2, Vector(bulletData.moveSpeed, 0, 0));
			bulletData.__particleID = particleID;
		}

		return this.InitBullet(bulletData);
	}

	/** 创建一组环绕弹道（一般使用这个创建环绕弹道，会自动排布弹道间隔并计算额外环绕弹道数量等通用处理） */
	CreateGroupSurroundBullet(count: number, params: SurroundCreateParams) {
		if (params.caster != undefined && !IsValid(params.caster)) return [];
		if (params.ability != undefined && !IsValid(params.ability)) return [];
		const surroundGroup = this.surroundGroup[params.group ?? "default"] ?? this.CreateSurroundGroup({
			caster: params.caster,
			group: params.group ?? "default",
			angle: params.angle ?? RandomInt(0, 360),
			circleRadius: params.circleRadius,
			angularVelocity: params.angularVelocity,
			bulletList: [],
			__position: params.caster?.GetAbsOrigin(),
		});

		const bulletList: number[] = [];

		for (let i = 0; i < count; i++) {
			let copyParams = shallowcopy(params);
			if (surroundGroup.bulletList.length == 0) {
				copyParams.angle = surroundGroup.angle + 360 / count * i;
			} else {
				copyParams.angle = surroundGroup.angle + (360 / surroundGroup.bulletList.length) * (surroundGroup.bulletList.length + i);
			}
			let projIndex = this.CreateSurroundBullet(copyParams);
			if (projIndex != undefined) {
				bulletList.push(projIndex);
			}
		}
		surroundGroup.bulletList = surroundGroup.bulletList.concat(bulletList);

		return bulletList;
	}
	/** 创建环绕弹道TODO: 优化private */
	CreateSurroundBullet(params: SurroundCreateParams) {
		if (params.caster != undefined && !IsValid(params.caster)) return;
		if (params.ability != undefined && !IsValid(params.ability)) return;
		const surroundGroup = this.surroundGroup[params.group ?? "default"] ?? this.CreateSurroundGroup({
			caster: params.caster,
			group: params.group ?? "default",
			angle: params.angle ?? RandomInt(0, 360),
			circleRadius: params.circleRadius,
			angularVelocity: params.angularVelocity,
			bulletList: [],
			__position: params.caster?.GetAbsOrigin(),
		});
		let bulletData: SurroundBulletData = Object.assign({
			__position: params.spawnOrigin ?? (surroundGroup.__position + AnglesToVector(QAngle(0, params.angle, 0)) * params.circleRadius!) as Vector,
			__projType: BULLET_TYPE.SURROUND,
			__projIndex: this.bulletIndex,
			__nextThink: params.interval != undefined ? (GameRules.GetGameTime() + params.interval) : undefined,
			__hitRecord: [],
			__teamNumber: params.caster?.GetTeamNumber() ?? DOTATeam_t.DOTA_TEAM_GOODGUYS,
			__lifeTime: params.lifeTime,
			__lifeTimeRemaining: params.lifeTime,
			__thinker: SpawnEntityFromTableSynchronous("prop_dynamic", { origin: params.spawnOrigin, model: "models/development/invisiblebox.vmdl" }) as CDOTA_BaseNPC,
			group: params.group ?? "default",
			angle: params.angle ?? RandomInt(0, 360),
			track: params.track ?? true,
			offset: params.offset ?? 0,
			teamFilter: params.ability != undefined ? params.ability.GetAbilityTargetTeam() : DOTA_UNIT_TARGET_TEAM.DOTA_UNIT_TARGET_TEAM_NONE,
			typeFilter: params.ability != undefined ? params.ability.GetAbilityTargetType() : DOTA_UNIT_TARGET_TYPE.DOTA_UNIT_TARGET_NONE,
			flagFilter: params.ability != undefined ? params.ability.GetAbilityTargetFlags() : DOTA_UNIT_TARGET_FLAGS.DOTA_UNIT_TARGET_FLAG_NONE,
		}, params);

		// 创建特效
		if (params.ParticleCreator != undefined) {
			bulletData.__particleID = params.ParticleCreator(bulletData);
		} else if (params.effectName) {
			const particleID = ParticleManager.CreateParticle(params.effectName, ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, bulletData.__thinker);
			ParticleManager.SetParticleControlEnt(particleID, 3, bulletData.__thinker, ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, undefined, bulletData.__thinker.GetAbsOrigin(), false);
			bulletData.__particleID = particleID;
		}

		return this.InitBullet(bulletData);
	}

	/** 创建自定义弹道 */
	CreateGuidedBullet(params: GuidedCreateParams) {
		if (params.caster != undefined && !IsValid(params.caster)) return;
		if (params.target != undefined && !IsValid(params.target)) return;
		if (params.ability != undefined && !IsValid(params.ability)) return;
		if (params.caster?.GetTeamNumber() == DOTATeam_t.DOTA_TEAM_BADGUYS) {
			params.moveSpeed = params.moveSpeed * this.slowFactor;
		}
		const direction = params.direction ?? (params.target ? Vsub(params.target.GetAbsOrigin(), params.spawnOrigin).Normalized() : RandomVector(1));
		const targetPos = (params.target ? params.target.GetAbsOrigin() : (params.spawnOrigin + direction * params.moveSpeed * FrameTime())) as Vector;
		const angles = VectorToAngles(direction.Normalized());
		const thinkerPos = params.spawnOrigin + direction * params.moveSpeed * FrameTime();
		let bulletData: GuidedBulletData = Object.assign({
			__position: params.spawnOrigin,
			__target: targetPos,
			__lifeTime: params.lifeTime ?? this.defaultLifetime,
			__lifeTimeRemaining: params.lifeTime ?? this.defaultLifetime,
			__velocity: Vmul(direction, params.moveSpeed),
			__projType: BULLET_TYPE.GUIDED,
			__projIndex: this.bulletIndex,
			__nextThink: params.interval != undefined ? (GameRules.GetGameTime() + params.interval) : undefined,
			__hitRecord: [],
			__teamNumber: params.caster?.GetTeamNumber() ?? DOTATeam_t.DOTA_TEAM_GOODGUYS,
			__thinker: SpawnEntityFromTableSynchronous("prop_dynamic", { origin: thinkerPos, angles: `${angles.x} ${angles.y} ${angles.z}`, model: "models/development/invisiblebox.vmdl" }) as CDOTA_BaseNPC,
			teamNumber: params.caster?.GetTeamNumber(),
			teamFilter: params.ability != undefined ? params.ability.GetAbilityTargetTeam() : DOTA_UNIT_TARGET_TEAM.DOTA_UNIT_TARGET_TEAM_NONE,
			typeFilter: params.ability != undefined ? params.ability.GetAbilityTargetType() : DOTA_UNIT_TARGET_TYPE.DOTA_UNIT_TARGET_NONE,
			flagFilter: params.ability != undefined ? params.ability.GetAbilityTargetFlags() : DOTA_UNIT_TARGET_FLAGS.DOTA_UNIT_TARGET_FLAG_NONE,
		}, params);

		// 创建特效
		if (params.ParticleCreator != undefined) {
			bulletData.__particleID = params.ParticleCreator(bulletData);
		} else if (params.effectName) {
			const particleID = ParticleManager.CreateParticle(params.effectName, ParticleAttachment_t.PATTACH_CUSTOMORIGIN, params.caster);
			ParticleManager.SetParticleControlTransformForward(particleID, 0, params.spawnOrigin, (bulletData.__velocity as Vector).Normalized());
			ParticleManager.SetParticleControlEnt(particleID, 1, bulletData.__thinker, ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, undefined, bulletData.__thinker.GetAbsOrigin(), false);
			ParticleManager.SetParticleControl(particleID, 2, Vector(bulletData.moveSpeed, 0, 0));
			bulletData.__particleID = particleID;
		}

		return this.InitBullet(bulletData);
	}

	/** 创建环形弹道 */
	CreateRingBullet(params: RingCreateParams) {
		params.startRadius = params.startRadius ?? 0;
		params.endRadius = params.endRadius ?? params.radius ?? 0;
		let bulletData: RingBulletData = Object.assign({
			__position: params.spawnOrigin,
			__lifeTime: params.lifeTime,
			__lifeTimeRemaining: params.lifeTime,
			__radius: 0,
			__projType: BULLET_TYPE.RING,
			__projIndex: this.bulletIndex,
			__nextThink: params.interval != undefined ? (GameRules.GetGameTime() + params.interval) : undefined,
			__hitRecord: [],
			__teamNumber: params.caster?.GetTeamNumber() ?? DOTATeam_t.DOTA_TEAM_GOODGUYS,
			teamFilter: params.ability != undefined ? params.ability.GetAbilityTargetTeam() : DOTA_UNIT_TARGET_TEAM.DOTA_UNIT_TARGET_TEAM_NONE,
			typeFilter: params.ability != undefined ? params.ability.GetAbilityTargetType() : DOTA_UNIT_TARGET_TYPE.DOTA_UNIT_TARGET_NONE,
			flagFilter: params.ability != undefined ? params.ability.GetAbilityTargetFlags() : DOTA_UNIT_TARGET_FLAGS.DOTA_UNIT_TARGET_FLAG_NONE,
		}, params);

		// 创建特效
		if (params.ParticleCreator != undefined) {
			bulletData.__particleID = params.ParticleCreator(bulletData);
		} else if (params.effectName) {
			const particleID = ParticleManager.CreateParticle(params.effectName, ParticleAttachment_t.PATTACH_CUSTOMORIGIN, params.caster);
			if (params.followEntity == undefined) {
				ParticleManager.SetParticleControl(particleID, 0, params.spawnOrigin);
			} else {
				ParticleManager.SetParticleControlEnt(particleID, 0, params.followEntity, ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, undefined, params.followEntity.GetAbsOrigin(), false);
			}
			ParticleManager.SetParticleControl(particleID, 1, Vector(params.endRadius, params.endRadius, params.endRadius));
			bulletData.__particleID = particleID;
		}

		return this.InitBullet(bulletData);
	}

	/** 创建自定义弹道，需要自己定义行动路径，搜寻单位，特效创建等 */
	CreateCustomBullet(params: CustomCreateParams) {
		if (params.caster != undefined && !IsValid(params.caster)) return;
		if (params.ability != undefined && !IsValid(params.ability)) return;
		params.direction = params.direction ?? vec3_zero;
		params.moveSpeed = params.moveSpeed ?? 0;
		let bulletData: CustomBulletData = Object.assign({
			__position: params.spawnOrigin,
			__velocity: Vmul(params.direction.Normalized(), params.moveSpeed),
			__lifeTime: params.lifeTime,
			__lifeTimeRemaining: params.lifeTime,
			__projType: BULLET_TYPE.CUSTOM,
			__projIndex: this.bulletIndex,
			__nextThink: params.interval != undefined ? (GameRules.GetGameTime() + params.interval) : undefined,
			__hitRecord: [],
			__teamNumber: params.caster?.GetTeamNumber() ?? DOTATeam_t.DOTA_TEAM_GOODGUYS,
			__thinker: params.hasThinker ? SpawnEntityFromTableSynchronous("prop_dynamic", { origin: params.spawnOrigin, model: "models/development/invisiblebox.vmdl" }) as CDOTA_BaseNPC : undefined,
		}, params);

		// 创建特效
		if (params.ParticleCreator != undefined) {
			bulletData.__particleID = params.ParticleCreator(bulletData);
		}

		return this.InitBullet(bulletData);
	}

	/** 分裂操作 */
	SplitAction(direction: Vector, splitCount: number, angleInterval: number, callback: (direction: Vector, index: number) => void) {
		let angle = (splitCount - 1) * angleInterval;
		// if (angle >= 360) {
		// 	angleInterval = 360 / splitCount;
		// 	angle = (splitCount - 1) * angleInterval;
		// }
		let directionList: Vector[] = [];
		for (let i = 1; i <= splitCount; i++) {
			table.insert(directionList, RotatePosition(Vector(0, 0, 0), QAngle(0, -angle * 0.5 + (i - 1) * angleInterval, 0), direction));
		}
		for (const [i, direction] of ipairs(directionList)) {
			callback(direction, i);
		}
	}

	/** Action */
	/** 躲避追踪弹道 */
	BulletDodge(unit: CDOTA_BaseNPC) {
		ProjectileManager.ProjectileDodge(unit);
		for (const [k, v] of pairs(this.bulletList)) {
			if (v.__projType == BULLET_TYPE.TRACKING && (v as TrackingBulletData).target == unit) {
				// @ts-ignore
				(v as TrackingBulletData).target = undefined;
			}
		}
	}

	/** 存数据 */
	SaveData(id: number, key: string, value: any) {
		if (this.bulletList == undefined) {
			return;
		}
		if (this.bulletList[id] == undefined) {
			return;
		}
		// @ts-ignore
		this.bulletList[id][key] = value;
	}
	GetData<T>(id: number, key: string, defaultValue?: T) {
		// @ts-ignore
		return this.bulletList?.[id]?.[key] ?? defaultValue;
	}

	/** 获取数据 */
	GetBulletData<T extends CustomBulletData | LinearBulletData | TrackingBulletData | GuidedBulletData | RingBulletData | SurroundBulletData>(id: number) {
		return this.bulletList[id] as T;
	}

	/** 销毁弹道 */
	DestroyBullet(bulletData: any) {
		if (bulletData.__particleID != undefined) {
			ParticleManager.DestroyParticle(bulletData.__particleID, false);
		}
		if (bulletData.__thinker != undefined && IsValid(bulletData.__thinker)) {
			UTIL_Remove(bulletData.__thinker);
		}
		if (bulletData.OnBulletDestroy) {
			xpcall(bulletData.OnBulletDestroy as any, (err: any) => traceback(err), bulletData);
		}

		// 销毁环绕弹道的记录
		if (bulletData.__projType == BULLET_TYPE.SURROUND) {
			const surroundGroup = this.surroundGroup[bulletData.group];
			if (surroundGroup != undefined) {
				ArrayRemove(surroundGroup.bulletList, bulletData.__projIndex);
				// 如果组里面为空，销毁该组
				if (surroundGroup.bulletList.length == 0) {
					// @ts-ignore
					this.surroundGroup[bulletData.group] = undefined;
				}
			}
		}

		// 从类型分组中移除
		const type = bulletData.__projType as BULLET_TYPE;
		if (this.bulletsByType[type]) {
			ArrayRemove(this.bulletsByType[type], bulletData.__projIndex);
		}

		// 从空间分区中移除
		this.RemoveFromSpatialGrid(bulletData);

		// 回收到对象池
		this.ReturnToPool(bulletData);

		// 减少弹道计数
		this.bulletCount = math.max(0, this.bulletCount - 1);

		// @ts-ignore
		this.bulletList[bulletData.__projIndex] = undefined;
	}

	/** 销毁弹道 */
	DestroyBulletByID(id: number) {
		let bulletData = this.bulletList[id];
		if (bulletData == undefined) {
			return;
		}
		this.DestroyBullet(bulletData);
	}

	//********************************************************************************
	// private
	//********************************************************************************

	/** 封装一层画点 */
	private _DebugDrawCircle(vPosition: Vector, vColor: Vector, flAlpha: number, flRadius: number, bZTest: boolean, flDuration: number) {
		if (this.debug) {
			DebugDrawCircle(vPosition, vColor, flAlpha, flRadius, bZTest, flDuration);
		}
	}

	private SafePrint(message: string) {
		print(`[Bullet] ${message}`);
	}

	private SafeUpdateBullet<T extends BulletData>(bulletData: T, updateFn: (bulletData: T) => void, label: string) {
		const [success, errorMessage] = xpcall(() => updateFn(bulletData), (err: any) => traceback(err));
		if (!success) {
			this.SafePrint(`${label} failed: proj=${tostring(bulletData.__projIndex)} type=${tostring(bulletData.__projType)} error=${tostring(errorMessage)}`);
			if (this.bulletList[bulletData.__projIndex] != undefined) {
				this.DestroyBullet(bulletData);
			}
		}
	}

	private SafeUnitFilter(bulletData: any, unit: CDOTA_BaseNPC): boolean {
		if (bulletData.FuncUnitFilter == undefined) {
			return true;
		}

		const [success, passed] = xpcall(bulletData.FuncUnitFilter as any, (err: any) => traceback(err), unit);
		if (!success) {
			this.SafePrint(`FuncUnitFilter failed: proj=${tostring(bulletData.__projIndex)} unit=${unit.GetUnitName()} error=${tostring(passed)}`);
			if (this.bulletList[bulletData.__projIndex] != undefined) {
				this.DestroyBullet(bulletData);
			}
			return false;
		}

		return passed == true;
	}

	//********************************************************************************
	// 空间分区系统
	//********************************************************************************

	/** 获取网格key */
	private GetGridKey(position: Vector): string {
		const gridX = math.floor(position.x / this.GRID_SIZE);
		const gridY = math.floor(position.y / this.GRID_SIZE);
		return `${gridX}_${gridY}`;
	}

	/** 添加弹道到空间分区 */
	private AddToSpatialGrid(bulletData: any) {
		const gridKey = this.GetGridKey(bulletData.__position);
		if (this.spatialGrid[gridKey] == undefined) {
			this.spatialGrid[gridKey] = [];
		}
		this.spatialGrid[gridKey].push(bulletData.__projIndex);
		bulletData.__gridKey = gridKey;
	}

	/** 从空间分区移除弹道 */
	private RemoveFromSpatialGrid(bulletData: any) {
		if (bulletData.__gridKey != undefined) {
			const grid = this.spatialGrid[bulletData.__gridKey];
			if (grid != undefined) {
				ArrayRemove(grid, bulletData.__projIndex);
				if (grid.length == 0) {
					// @ts-ignore
					this.spatialGrid[bulletData.__gridKey] = undefined;
				}
			}
		}
	}

	/** 更新弹道在空间分区中的位置 */
	private UpdateSpatialGrid(bulletData: any) {
		const newGridKey = this.GetGridKey(bulletData.__position);
		if (bulletData.__gridKey != newGridKey) {
			this.RemoveFromSpatialGrid(bulletData);
			const gridKey = newGridKey;
			if (this.spatialGrid[gridKey] == undefined) {
				this.spatialGrid[gridKey] = [];
			}
			this.spatialGrid[gridKey].push(bulletData.__projIndex);
			bulletData.__gridKey = gridKey;
		}
	}

	/** 获取附近网格的所有弹道（用于碰撞检测优化） */
	private GetNearbyBullets(position: Vector, radius: number): number[] {
		const gridRadius = math.ceil(radius / this.GRID_SIZE);
		const centerGridX = math.floor(position.x / this.GRID_SIZE);
		const centerGridY = math.floor(position.y / this.GRID_SIZE);

		let nearbyBullets: number[] = [];
		for (let dx = -gridRadius; dx <= gridRadius; dx++) {
			for (let dy = -gridRadius; dy <= gridRadius; dy++) {
				const gridKey = `${centerGridX + dx}_${centerGridY + dy}`;
				const grid = this.spatialGrid[gridKey];
				if (grid != undefined) {
					nearbyBullets = nearbyBullets.concat(grid);
				}
			}
		}
		return nearbyBullets;
	}

	/**
	 * 获取圆形范围内的所有弹道
	 * @param center 圆心位置
	 * @param radius 半径
	 * @returns 弹道数据数组
	 */
	GetBulletInRadius(center: Vector, radius: number): Array<LinearBulletData | TrackingBulletData | GuidedBulletData | RingBulletData | SurroundBulletData | CustomBulletData> {
		const nearbyIndexes = this.GetNearbyBullets(center, radius);
		const result: Array<LinearBulletData | TrackingBulletData | GuidedBulletData | RingBulletData | SurroundBulletData | CustomBulletData> = [];

		const radiusSq = radius * radius;

		for (let i = 0; i < nearbyIndexes.length; i++) {
			const bulletData = this.bulletList[nearbyIndexes[i]];
			if (bulletData !== undefined) {
				const distSq = (bulletData.__position.x - center.x) ** 2 + (bulletData.__position.y - center.y) ** 2;
				if (distSq <= radiusSq) {
					result.push(bulletData);
				}
			}
		}

		return result;
	}

	/**
	 * 获取多边形范围内的所有弹道
	 * @param polygon 多边形顶点数组（按顺序）
	 * @returns 弹道数据数组
	 */
	GetBulletInPolygon(polygon: Vector[]): Array<LinearBulletData | TrackingBulletData | GuidedBulletData | RingBulletData | SurroundBulletData | CustomBulletData> {
		if (polygon.length < 3) {
			return [];
		}

		// 计算多边形的边界框
		let minX = polygon[0].x;
		let maxX = polygon[0].x;
		let minY = polygon[0].y;
		let maxY = polygon[0].y;

		for (let i = 1; i < polygon.length; i++) {
			if (polygon[i].x < minX) minX = polygon[i].x;
			if (polygon[i].x > maxX) maxX = polygon[i].x;
			if (polygon[i].y < minY) minY = polygon[i].y;
			if (polygon[i].y > maxY) maxY = polygon[i].y;
		}

		// 计算边界框中心和半径，用于获取附近网格
		const centerX = (minX + maxX) / 2;
		const centerY = (minY + maxY) / 2;
		const center = Vector(centerX, centerY, 0);
		const radius = math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2) / 2;

		const nearbyIndexes = this.GetNearbyBullets(center, radius);
		const result: Array<LinearBulletData | TrackingBulletData | GuidedBulletData | RingBulletData | SurroundBulletData | CustomBulletData> = [];

		// 使用射线法判断点是否在多边形内
		for (let i = 0; i < nearbyIndexes.length; i++) {
			const bulletData = this.bulletList[nearbyIndexes[i]];
			if (bulletData !== undefined) {
				if (this.IsPointInPolygon(bulletData.__position, polygon)) {
					result.push(bulletData);
				}
			}
		}

		return result;
	}

	/**
	 * 获取线段范围内的所有弹道
	 * @param start 起点
	 * @param end 终点
	 * @param width 线段宽度（半宽）
	 * @returns 弹道数据数组
	 */
	GetBulletInLine(start: Vector, end: Vector, width: number): Array<LinearBulletData | TrackingBulletData | GuidedBulletData | RingBulletData | SurroundBulletData | CustomBulletData> {
		// 计算线段的边界框
		const minX = math.min(start.x, end.x) - width;
		const maxX = math.max(start.x, end.x) + width;
		const minY = math.min(start.y, end.y) - width;
		const maxY = math.max(start.y, end.y) + width;

		// 计算边界框中心和半径
		const centerX = (minX + maxX) / 2;
		const centerY = (minY + maxY) / 2;
		const center = Vector(centerX, centerY, 0);
		const radius = math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2) / 2;

		const nearbyIndexes = this.GetNearbyBullets(center, radius);
		const result: Array<LinearBulletData | TrackingBulletData | GuidedBulletData | RingBulletData | SurroundBulletData | CustomBulletData> = [];

		// 计算点到线段的距离
		const lineLengthSq = (end.x - start.x) ** 2 + (end.y - start.y) ** 2;

		for (let i = 0; i < nearbyIndexes.length; i++) {
			const bulletData = this.bulletList[nearbyIndexes[i]];
			if (bulletData !== undefined) {
				const pos = bulletData.__position;

				// 计算投影参数 t
				let t = ((pos.x - start.x) * (end.x - start.x) + (pos.y - start.y) * (end.y - start.y)) / lineLengthSq;
				t = math.max(0, math.min(1, t)); // 限制在 [0, 1]

				// 计算最近点
				const closestX = start.x + t * (end.x - start.x);
				const closestY = start.y + t * (end.y - start.y);

				// 计算距离
				const distSq = (pos.x - closestX) ** 2 + (pos.y - closestY) ** 2;

				if (distSq <= width * width) {
					result.push(bulletData);
				}
			}
		}

		return result;
	}

	/** 获取单位的环绕物数量 */
	GetRingBulletCount(caster: CDOTA_BaseNPC): number {
		let count = 0;
		for (const [groupName, groupData] of pairs(this.surroundGroup)) {
			if (groupData.caster === caster) {
				count += groupData.bulletList.length;
			}
		}
		return count;
	}

	/** 判断是否为线性弹道 */
	IsLinearBullet(bulletData: any): bulletData is LinearBulletData {
		return bulletData.__projType === BULLET_TYPE.LINEAR;
	}
	/** 判断是否为追踪弹道 */
	IsTrackingBullet(bulletData: any): bulletData is TrackingBulletData {
		return bulletData.__projType === BULLET_TYPE.TRACKING;
	}
	/** 判断是否为引导弹道 */
	IsGuidedBullet(bulletData: any): bulletData is GuidedBulletData {
		return bulletData.__projType === BULLET_TYPE.GUIDED;
	}
	/** 判断是否为环形弹道 */
	IsRingBullet(bulletData: any): bulletData is RingBulletData {
		return bulletData.__projType === BULLET_TYPE.RING;
	}
	/** 判断是否为环绕弹道 */
	IsSurroundBullet(bulletData: any): bulletData is SurroundBulletData {
		return bulletData.__projType === BULLET_TYPE.SURROUND;
	}
	/** 判断是否为自定义弹道 */
	IsCustomBullet(bulletData: any): bulletData is CustomBulletData {
		return bulletData.__projType === BULLET_TYPE.CUSTOM;
	}

	/** 是否可以被敌人反弹 */
	IsReflectable(bulletData: any): boolean {
		return bulletData.reflectable ?? false;
	}
	/**
	 * 射线法判断点是否在多边形内
	 * @param point 待判断的点
	 * @param polygon 多边形顶点数组
	 * @returns 是否在多边形内
	 */
	private IsPointInPolygon(point: Vector, polygon: Vector[]): boolean {
		let inside = false;
		const n = polygon.length;

		for (let i = 0; i < n; i++) {
			const j = (i + 1) % n;
			const xi = polygon[i].x;
			const yi = polygon[i].y;
			const xj = polygon[j].x;
			const yj = polygon[j].y;

			const intersect = ((yi > point.y) !== (yj > point.y)) &&
				(point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

			if (intersect) {
				inside = !inside;
			}
		}

		return inside;
	}

	//********************************************************************************
	// 对象池系统
	//********************************************************************************

	/** 从对象池获取弹道数据对象 */
	private GetFromPool<T>(type: BULLET_TYPE): T | undefined {
		const pool = this.bulletPool[type];
		if (pool.length > 0) {
			return pool.pop() as T;
		}
		return undefined;
	}

	/** 回收弹道数据对象到对象池 */
	private ReturnToPool(bulletData: any) {
		const type = bulletData.__projType as BULLET_TYPE;
		const pool = this.bulletPool[type];
		if (pool && pool.length < this.POOL_MAX_SIZE) {
			// 清理引用，避免内存泄漏
			bulletData.caster = undefined;
			bulletData.ability = undefined;
			bulletData.target = undefined;
			bulletData.__thinker = undefined;
			bulletData.OnBulletCreated = undefined;
			bulletData.OnBulletThink = undefined;
			bulletData.OnBulletHit = undefined;
			bulletData.OnBulletDestroy = undefined;
			bulletData.OnIntervalThink = undefined;
			bulletData.FuncUnitFinder = undefined;
			bulletData.FuncUnitFilter = undefined;
			bulletData.ParticleCreator = undefined;
			bulletData.PathFunction = undefined;
			bulletData.__hitRecord = [];

			pool.push(bulletData);
		}
	}

	//********************************************************************************
	// 批量处理系统
	//********************************************************************************

	/** 批量更新线性弹道 */
	private BatchUpdateLinearBullets() {
		const bullets = this.bulletsByType[BULLET_TYPE.LINEAR];
		for (const [_, index] of ipairs(bullets)) {
			const bulletData = this.bulletList[index] as LinearBulletData;
			if (bulletData != undefined) {
				this.SafeUpdateBullet(bulletData, (currentBullet) => this.OnLinearBulletThink(currentBullet), "Linear bullet update");
			}
		}
	}

	/** 批量更新追踪弹道 */
	private BatchUpdateTrackingBullets() {
		const bullets = this.bulletsByType[BULLET_TYPE.TRACKING];
		for (const [_, index] of ipairs(bullets)) {
			const bulletData = this.bulletList[index] as TrackingBulletData;
			if (bulletData != undefined) {
				this.SafeUpdateBullet(bulletData, (currentBullet) => this.OnTrackingBulletThink(currentBullet), "Tracking bullet update");
			}
		}
	}

	/** 批量更新引导弹道 */
	private BatchUpdateGuidedBullets() {
		const bullets = this.bulletsByType[BULLET_TYPE.GUIDED];
		for (const [_, index] of ipairs(bullets)) {
			const bulletData = this.bulletList[index] as GuidedBulletData;
			if (bulletData != undefined) {
				this.SafeUpdateBullet(bulletData, (currentBullet) => this.OnGuidedBulletThink(currentBullet), "Guided bullet update");
			}
		}
	}

	/** 批量更新环形弹道 */
	private BatchUpdateRingBullets() {
		const bullets = this.bulletsByType[BULLET_TYPE.RING];
		for (const [_, index] of ipairs(bullets)) {
			const bulletData = this.bulletList[index] as RingBulletData;
			if (bulletData != undefined) {
				this.SafeUpdateBullet(bulletData, (currentBullet) => this.OnRingBulletThink(currentBullet), "Ring bullet update");
			}
		}
	}

	/** 批量更新自定义弹道 */
	private BatchUpdateCustomBullets() {
		const bullets = this.bulletsByType[BULLET_TYPE.CUSTOM];
		for (const [_, index] of ipairs(bullets)) {
			const bulletData = this.bulletList[index] as CustomBulletData;
			if (bulletData != undefined) {
				this.SafeUpdateBullet(bulletData, (currentBullet) => this.OnCustomBulletThink(currentBullet), "Custom bullet update");
			}
		}
	}

	//********************************************************************************
	// 碰撞反弹系统方法
	//********************************************************************************

	/** 创建临时阻挡区域 */
	CreateTemporaryBlock(blockData: TemporaryBlockData, duration?: number): number {
		const index = this.temporaryBlockIndex;
		this.temporaryBlocks[index] = blockData;
		if (duration != undefined) {
			Timer.GameTimer(duration, () => {
				// @ts-ignore
				this.temporaryBlocks[index] = undefined;
			});
		}
		this.temporaryBlockIndex++;
		return index;
	}

	/** 移除临时阻挡区域 */
	RemoveTemporaryBlock(index: number) {
		// @ts-ignore
		this.temporaryBlocks[index] = undefined;
	}

	/** 判断位置是否可通行 */
	private IsValidPosition(position: Vector): boolean {
		if (this.IsPositionInTemporaryBlock(position)) return false;
		if (!GridNav.IsTraversable(position) || GridNav.IsBlocked(position)) {
			// 额外检查是否是地图坑洞，需要地形铺设block bullets材质，高度从地面往下5000开始往上3000进行trace，确保能穿过坑洞底部
			let startVector = Vadd(GetGroundPosition(position, undefined), Vector(0, 0, -5000));
			let traceTable: TraceLineInputs = {
				startpos: startVector,
				endpos: startVector + Vector(0, 0, 3000) as Vector,
				mask: 33570827,
			};
			if (TraceLine(traceTable)) {
				if (traceTable.hit) {
					// DebugDrawLine(traceTable.startpos, traceTable.pos, 0, 255, 0, true, 1);
					// DebugDrawLine(traceTable.pos, (traceTable.pos + traceTable.normal * 10) as Vector, 0, 0, 255, true, 1);
					return true;
				} else {
					// DebugDrawLine(traceTable.startpos, traceTable.endpos, 255, 0, 0, true, 1);
					return false;
				}
			};
		}
		return true;
	}

	/** 判断位置是否在临时阻挡区域内 */
	private IsPositionInTemporaryBlock(position: Vector): boolean {
		for (const [_, blockData] of pairs(this.temporaryBlocks)) {
			if (blockData.type == TEMPORARY_BLOCK_TYPE.CIRCLE && blockData.center && blockData.radius) {
				if (Vsub(blockData.center, position).Length2D() <= blockData.radius) {
					return true;
				}
			} else if (blockData.type == TEMPORARY_BLOCK_TYPE.POLYGON && blockData.points) {
				if (this.IsPointInPolygon(position, blockData.points)) {
					return true;
				}
			}
		}
		return false;
	}

	/** 获取位置所在的临时阻挡区域 */
	private GetTemporaryBlocksInPosition(position: Vector): TemporaryBlockData[] {
		const blocks: TemporaryBlockData[] = [];
		for (const [_, blockData] of pairs(this.temporaryBlocks)) {
			if (blockData.type == TEMPORARY_BLOCK_TYPE.CIRCLE && blockData.center && blockData.radius) {
				if (Vsub(blockData.center, position).Length2D() <= blockData.radius) {
					table.insert(blocks, blockData);
				}
			} else if (blockData.type == TEMPORARY_BLOCK_TYPE.POLYGON && blockData.points) {
				if (this.IsPointInPolygon(position, blockData.points)) {
					table.insert(blocks, blockData);
				}
			}
		}
		return blocks;
	}

	/** 检测路径上是否有碰撞物 */
	private IsBlockInLine(bulletData: any): LuaMultiReturn<[boolean, Vector]> {
		let hasBlock = false;
		let blockPosition = bulletData.__previous ?? bulletData.__position;
		const direction = (bulletData.__velocity as Vector).Normalized();

		while (Vsub(blockPosition, bulletData.__position).Length2D() > this.TICK_DISTANCE) {
			blockPosition = Vadd(blockPosition, Vmul(direction, this.TICK_DISTANCE));
			if (!this.IsValidPosition(blockPosition)) {
				hasBlock = true;
				break;
			}
		}
		return $multi(hasBlock, blockPosition);
	}

	/** 计算最接近障碍物的位置 */
	private GetBlockPosition(bulletData: any): Vector {
		let blockPosition = bulletData.__position;
		const direction = (bulletData.__velocity as Vector).Normalized();

		while (Vsub(blockPosition, bulletData.__previous ?? bulletData.__position).Length2D() > this.BLOCK_TICK_DISTANCE) {
			blockPosition = Vsub(blockPosition, Vmul(direction, this.BLOCK_TICK_DISTANCE));
			if (this.IsValidPosition(blockPosition)) {
				break;
			}
		}
		return blockPosition;
	}

	/** 计算法向量 */
	/** 计算障碍物法线向量（公开给modifier使用） */
	GetNormal(blockPosition: Vector): Vector {
		let normal = vec3_zero;
		for (let i = 1; i <= this.CIRCLE_ACCURACY; i++) {
			const angle = (360 / this.CIRCLE_ACCURACY) * i;
			const circlePoint = Vadd(blockPosition, RotatePosition(vec3_zero, QAngle(0, angle, 0), Vector(0, this.CIRCLE_RADIUS, 0)));
			if (!this.IsValidPosition(circlePoint)) {
				this._DebugDrawCircle(circlePoint, Vector(255, 0, 0), 50, 5, true, 1);
			} else {
				normal = Vadd(normal, RotatePosition(vec3_zero, QAngle(0, angle, 0), Vector(0, this.CIRCLE_RADIUS, 0)));
				this._DebugDrawCircle(circlePoint, Vector(0, 255, 0), 50, 5, true, 1);
			}
		}
		return normal.Normalized();
	}

	/** 计算反射向量 */
	private GetReflection(blockPosition: Vector, direction: Vector): Vector {
		const normal = this.GetNormal(blockPosition);
		// 反射公式: R = D - 2(D·N)N
		const dotProduct = direction.Dot(Vmul(normal.Normalized(), -1));
		const reflection = Vsub(direction, Vmul(Vmul(normal.Normalized(), -1), 2 * dotProduct));
		return reflection.Normalized();
	}

	/** 处理碰撞反弹 */
	private HandleBounce(bulletData: any, blockPosition: Vector): boolean {
		// 触发临时阻挡区域的回调
		const blocks = this.GetTemporaryBlocksInPosition(bulletData.__position);
		for (const [_, block] of ipairs(blocks)) {
			if (block.callback) {
				xpcall(block.callback as any, (err: any) => traceback(err), bulletData);
			}
		}

		this._DebugDrawCircle(blockPosition, Vector(255, 255, 0), 0, 10, true, 1);

		if (bulletData.bounce != undefined && bulletData.bounce > 0) {
			// 有反弹次数，执行反弹
			if (bulletData.OnBulletBounceStart) {
				xpcall(bulletData.OnBulletBounceStart, traceback, bulletData);
			}

			bulletData.bounce = bulletData.bounce - 1;

			// 计算反射向量
			const direction = (bulletData.__velocity as Vector).Normalized();
			const reflection = this.GetReflection(blockPosition, direction);
			const moveSpeed = (bulletData.__velocity as Vector).Length();

			// 更新弹道方向和速度
			bulletData.__velocity = Vmul(reflection, moveSpeed);

			// 更新位置（补偿剩余移动距离）
			const remainingDistance = moveSpeed * FrameTime() - Vsub(blockPosition, bulletData.__previous ?? bulletData.__position).Length2D();
			bulletData.__position = Vadd(blockPosition, Vmul(reflection, remainingDistance));

			this._DebugDrawCircle(bulletData.__position, Vector(0, 255, 255), 50, 10, true, 1);

			// 重新创建特效
			// if (bulletData.__particleID != undefined) {
			// 	ParticleManager.DestroyParticle(bulletData.__particleID, false);
			// 	bulletData.__particleID = undefined;
			// }

			// 反弹后清空命中记录
			bulletData.__hitRecord = [];

			if (bulletData.OnBulletBounceEnd) {
				xpcall(bulletData.OnBulletBounceEnd, traceback, bulletData);
			}

			return true;
		} else {
			// 没有反弹次数
			if (bulletData.destroyOnBounce == undefined || bulletData.destroyOnBounce == true) {
				this.DestroyBullet(bulletData);
				return false;
			} else {
				// 停止移动
				if (!VectorIsZero(bulletData.__velocity)) {
					bulletData.__velocity = vec3_zero;
					bulletData.__position = blockPosition;
					// 重新创建特效
					if (bulletData.__particleID != undefined) {
						ParticleManager.DestroyParticle(bulletData.__particleID, false);
						bulletData.__particleID = undefined;
					}
				}
				return true;
			}
		}
	}

	//********************************************************************************
	// 弹道更新逻辑
	//********************************************************************************

	/** 记录弹道数据，触发创建回调 */
	private InitBullet(bulletData: any): number {
		this.bulletList[bulletData.__projIndex] = bulletData;
		// 递增index和计数
		this.bulletIndex++;
		this.bulletCount++;

		// 记录创建时间，用于自动清理
		bulletData.__createdTime = GameRules.GetGameTime();

		// 添加到空间分区
		this.AddToSpatialGrid(bulletData);

		// 添加到类型分组
		const type = bulletData.__projType as BULLET_TYPE;
		this.bulletsByType[type].push(bulletData.__projIndex);

		// 创建回调
		if (bulletData.OnBulletCreated != undefined) {
			xpcall(bulletData.OnBulletCreated, traceback, bulletData);
		}

		return bulletData.__projIndex;
	}

	private OnLinearBulletThink(bulletData: LinearBulletData) {
		if (bulletData.__nextThink != undefined && bulletData.interval != undefined && bulletData.OnIntervalThink != undefined && GameRules.GetGameTime() >= bulletData.__nextThink) {
			let [success, result] = xpcall<[LinearBulletData], number | void, number>(bulletData.OnIntervalThink, traceback, bulletData);
			if (success) {
				if (result != undefined) {
					bulletData.interval = result < 0 ? undefined : result;
					bulletData.__nextThink = result < 0 ? undefined : GameRules.GetGameTime() + result;
				} else {
					bulletData.__nextThink = GameRules.GetGameTime() + bulletData.interval;
				}
			}
		}

		bulletData.__lifeTimeRemaining = bulletData.__lifeTimeRemaining - FrameTime();


		const privious = bulletData.__previous ?? bulletData.__position;
		// 优化：缓存帧时间和速度向量，避免重复计算
		const frameTime = FrameTime();

		// 碰撞检测（如果不忽略障碍物）
		if (bulletData.ignoreBlock != true) {
			const [hasBlock, blockPosition] = this.IsBlockInLine(bulletData);
			if (!this.IsValidPosition(bulletData.__position) || hasBlock) {
				this._DebugDrawCircle(bulletData.__position, Vector(255, 0, 0), 0, 10, true, 1);
				// 计算精确的碰撞点
				const finalBlockPosition = hasBlock ? blockPosition : this.GetBlockPosition(bulletData);
				// 处理反弹
				if (!this.HandleBounce(bulletData, finalBlockPosition)) {
					return; // 弹道已销毁
				}
			} else {
				this._DebugDrawCircle(bulletData.__position, Vector(0, 255, 0), 0, 10, true, 1);
			}
		}

		// 更新空间分区
		this.UpdateSpatialGrid(bulletData);

		// 重新创建特效（如果被销毁了）
		if (bulletData.__particleID == undefined && bulletData.effectName) {
			const particleID = ParticleManager.CreateParticle(bulletData.effectName, ParticleAttachment_t.PATTACH_CUSTOMORIGIN, bulletData.caster);
			ParticleManager.SetParticleControlTransformForward(particleID, 0, bulletData.__position, (bulletData.__velocity as Vector).Normalized());
			ParticleManager.SetParticleControl(particleID, 1, bulletData.__velocity);
			bulletData.__particleID = particleID;
		}

		if (bulletData.__thinker != undefined) {
			bulletData.__thinker.SetLocalOrigin(bulletData.__position);
		}
		// DebugDrawCircle(bulletData.__position, Vector(0, 0, 255), 50, 15, true, 1);
		if (bulletData.OnBulletThink != undefined) {
			xpcall(bulletData.OnBulletThink, traceback, bulletData.__position, bulletData);
		}
		// 计算命中单位
		if (bulletData.caster != undefined && bulletData.OnBulletHit != undefined) {
			const lifeProgress = (bulletData.__lifeTime - bulletData.__lifeTimeRemaining - frameTime) / bulletData.__lifeTime;
			const startRadius = bulletData.radius ?? RemapValClamped(lifeProgress, 0, 1, bulletData.startRadius ?? 0, bulletData.endRadius ?? 0);
			const endRadius = bulletData.radius ?? RemapValClamped((bulletData.__lifeTime - bulletData.__lifeTimeRemaining) / bulletData.__lifeTime, 0, 1, bulletData.startRadius ?? 0, bulletData.endRadius ?? 0);
			let targets: CDOTA_BaseNPC[] = [];
			if (bulletData.FuncUnitFinder != undefined) {
				let [a, b] = xpcall(bulletData.FuncUnitFinder, traceback, privious, bulletData.__position, startRadius, endRadius, bulletData);
				if (a == true) {
					targets = b as CDOTA_BaseNPC[];
				}
			} else {
				// 画线
				if (bulletData.debug) {
					let direction = Vsub(privious, bulletData.__position).Normalized();
					let points = [
						Vadd(privious, Vmul(RotatePosition(vec3_zero, QAngle(0, 90, 0), direction), startRadius)),
						Vsub(privious, Vmul(RotatePosition(vec3_zero, QAngle(0, 90, 0), direction), startRadius)),
						Vsub(bulletData.__position, Vmul(RotatePosition(vec3_zero, QAngle(0, 90, 0), direction), endRadius)),
						Vadd(bulletData.__position, Vmul(RotatePosition(vec3_zero, QAngle(0, 90, 0), direction), endRadius)),
					];
					DebugDrawCircle(privious, Vector(255, 0, 0), 0, startRadius, true, 0.2);
					DebugDrawCircle(bulletData.__position, Vector(255, 0, 0), 0, endRadius, true, 0.2);
					DebugDrawLine(points[0], points[1], 255, 0, 0, true, 0.2);
					DebugDrawLine(points[1], points[2], 255, 0, 0, true, 0.2);
					DebugDrawLine(points[2], points[3], 255, 0, 0, true, 0.2);
					DebugDrawLine(points[3], points[0], 255, 0, 0, true, 0.2);
				}
				targets = this.FindUnitInLine(bulletData.__teamNumber, privious, bulletData.__position, startRadius, endRadius, bulletData.teamFilter, bulletData.typeFilter, bulletData.flagFilter);
			}
			if (bulletData.repeatHit == true) {
				for (const [_, unit] of ipairs(targets)) {
					if (TableFindKey(bulletData.__hitRecord, unit) == undefined) {
						if (this.SafeUnitFilter(bulletData, unit)) {
							let [success, result] = xpcall(bulletData.OnBulletHit, traceback, unit, bulletData.__position, bulletData);
							if (success == true && result == true) {
								this.DestroyBullet(bulletData);
								break;
							}
						}
					}
				}
				bulletData.__hitRecord = targets;
			} else {
				for (const [_, unit] of ipairs(targets)) {
					if (TableFindKey(bulletData.__hitRecord, unit) == undefined) {
						if (this.SafeUnitFilter(bulletData, unit)) {
							let [success, result] = xpcall(bulletData.OnBulletHit, traceback, unit, bulletData.__position, bulletData);
							table.insert(bulletData.__hitRecord, unit);
							if (success == true && result == true) {
								this.DestroyBullet(bulletData);
								break;
							}
						}
					}
				}
			}
		}

		// 计算生命周期，销毁
		if (bulletData.__lifeTimeRemaining <= 0) {
			this.DestroyBullet(bulletData);
		}
		// 判断是否有效弹道
		if (this.bulletList[bulletData.__projIndex] != undefined) {
			bulletData.__previous = bulletData.__position;  // 保存上一帧位置
			const velocityDelta = Vmul(bulletData.__velocity, frameTime);
			bulletData.__position = Vadd(bulletData.__position, velocityDelta);
		}
	}

	private OnTrackingBulletThink(bulletData: TrackingBulletData) {
		if (bulletData.__nextThink != undefined && bulletData.interval != undefined && bulletData.OnIntervalThink != undefined && GameRules.GetGameTime() >= bulletData.__nextThink) {
			let [success, result] = xpcall<[TrackingBulletData], number | void, number>(bulletData.OnIntervalThink, traceback, bulletData);
			if (success) {
				if (result != undefined) {
					bulletData.interval = result < 0 ? undefined : result;
					bulletData.__nextThink = result < 0 ? undefined : GameRules.GetGameTime() + result;
				} else {
					bulletData.__nextThink = GameRules.GetGameTime() + bulletData.interval;
				}
			}
		}

		const privious = bulletData.__previous ?? bulletData.__position;

		// 碰撞检测（如果不忽略障碍物）
		if (bulletData.ignoreBlock != true) {
			const [hasBlock, blockPosition] = this.IsBlockInLine(bulletData);
			if (!this.IsValidPosition(bulletData.__position) || hasBlock) {
				this._DebugDrawCircle(bulletData.__position, Vector(255, 0, 0), 0, 10, true, 1);
				// 计算精确的碰撞点
				const finalBlockPosition = hasBlock ? blockPosition : this.GetBlockPosition(bulletData);
				// 处理反弹（追踪弹道撞墙后变成线性弹道）
				if (!this.HandleBounce(bulletData, finalBlockPosition)) {
					return; // 弹道已销毁
				}
				// 反弹后更新目标位置为反弹方向的延长线
				bulletData.__target = Vadd(bulletData.__position, Vmul((bulletData.__velocity as Vector).Normalized(), Vsub(bulletData.__position, privious).Length2D()));

				// 反弹后重新创建特效（改为线性弹道风格）
				if (bulletData.effectName) {
					const particleID = ParticleManager.CreateParticle(bulletData.effectName, ParticleAttachment_t.PATTACH_CUSTOMORIGIN, bulletData.caster);
					ParticleManager.SetParticleControlTransformForward(particleID, 0, bulletData.__position, (bulletData.__velocity as Vector).Normalized());
					ParticleManager.SetParticleControl(particleID, 1, bulletData.__target);
					ParticleManager.SetParticleControl(particleID, 2, Vector(bulletData.moveSpeed, 0, 0));
					bulletData.__particleID = particleID;
				}
			} else {
				this._DebugDrawCircle(bulletData.__position, Vector(0, 255, 0), 0, 10, true, 1);
			}
		}

		// 更新空间分区
		this.UpdateSpatialGrid(bulletData);

		if (bulletData.OnBulletThink != undefined) {
			xpcall(bulletData.OnBulletThink, traceback, bulletData.__position, bulletData);
		}
		// 计算命中单位
		if (bulletData.caster != undefined && bulletData.radius != undefined && bulletData.radius > 0 && bulletData.OnBulletHit != undefined) {
			const startRadius = bulletData.radius ?? 0;
			const endRadius = bulletData.radius ?? 0;
			let targets: CDOTA_BaseNPC[] = [];
			if (bulletData.FuncUnitFinder != undefined) {
				let [a, b] = xpcall(bulletData.FuncUnitFinder, traceback, privious, bulletData.__position, startRadius, endRadius, bulletData);
				if (a == true) {
					targets = b as CDOTA_BaseNPC[];
				}
			} else {
				// 画线
				if (bulletData.debug) {
					let direction = Vsub(privious, bulletData.__position).Normalized();
					let points = [
						Vadd(privious, Vmul(RotatePosition(vec3_zero, QAngle(0, 90, 0), direction), startRadius)),
						Vsub(privious, Vmul(RotatePosition(vec3_zero, QAngle(0, 90, 0), direction), startRadius)),
						Vsub(bulletData.__position, Vmul(RotatePosition(vec3_zero, QAngle(0, 90, 0), direction), endRadius)),
						Vadd(bulletData.__position, Vmul(RotatePosition(vec3_zero, QAngle(0, 90, 0), direction), endRadius)),
					];
					DebugDrawCircle(privious, Vector(255, 0, 0), 0, startRadius, true, 0.2);
					DebugDrawCircle(bulletData.__position, Vector(255, 0, 0), 0, endRadius, true, 0.2);
					DebugDrawLine(points[0], points[1], 255, 0, 0, true, 0.2);
					DebugDrawLine(points[1], points[2], 255, 0, 0, true, 0.2);
					DebugDrawLine(points[2], points[3], 255, 0, 0, true, 0.2);
					DebugDrawLine(points[3], points[0], 255, 0, 0, true, 0.2);
				}
				targets = this.FindUnitInLine(bulletData.__teamNumber, privious, bulletData.__position, startRadius, endRadius, bulletData.teamFilter, bulletData.typeFilter, bulletData.flagFilter);
			}
			for (const [_, unit] of ipairs(targets)) {
				if (TableFindKey(bulletData.__hitRecord, unit) == undefined) {
					if (this.SafeUnitFilter(bulletData, unit)) {
						let [success, result] = xpcall(bulletData.OnBulletHit, traceback, unit, bulletData.__position, bulletData);
						table.insert(bulletData.__hitRecord, unit);
						if (success == true && result == true) {
							this.DestroyBullet(bulletData);
							break;
						}
					}
				}
			}
		}

		if (bulletData.__target == bulletData.__position) {
			let success, result;
			if (bulletData.OnBulletHit != undefined && IsValid(bulletData.target)) {
				[success, result] = xpcall(bulletData.OnBulletHit, traceback, bulletData.target, bulletData.__position, bulletData);
			}
			if (result == undefined || result == true) {
				this.DestroyBullet(bulletData);
			}
		}

		// 判断是否有效弹道
		if (this.bulletList[bulletData.__projIndex] != undefined) {
			bulletData.__previous = bulletData.__position;  // 保存上一帧位置
			// 更新目标位置
			if (IsValid(bulletData.target)) {
				bulletData.__target = bulletData.target.GetAbsOrigin();
			}
			// 优化：缓存方向向量和速度计算
			const direction = Vsub(bulletData.__target, bulletData.__position).Normalized();
			bulletData.__velocity = direction;
			const frameTime = FrameTime();
			const moveDistance = bulletData.moveSpeed * frameTime;
			const moveDelta = Vmul(direction, moveDistance);
			bulletData.__position = Vadd(bulletData.__position, moveDelta);

			// 如果这一帧的运动的距离会超过弹道与目标的距离则将位置修正为目标的位置
			if (Vsub(bulletData.__target, bulletData.__position).Length2D() < moveDistance) {
				bulletData.__position = bulletData.__target;
			}
		}
	}

	private OnGuidedBulletThink(bulletData: GuidedBulletData) {
		if (bulletData.__nextThink != undefined && bulletData.interval != undefined && bulletData.OnIntervalThink != undefined && GameRules.GetGameTime() >= bulletData.__nextThink) {
			let [success, result] = xpcall<[GuidedBulletData], number | void, number>(bulletData.OnIntervalThink, traceback, bulletData);
			if (success) {
				if (result != undefined) {
					bulletData.interval = result < 0 ? undefined : result;
					bulletData.__nextThink = result < 0 ? undefined : GameRules.GetGameTime() + result;
				} else {
					bulletData.__nextThink = GameRules.GetGameTime() + bulletData.interval;
				}
			}
		}
		if (bulletData.__lifeTimeRemaining != -1) {
			bulletData.__lifeTimeRemaining = bulletData.__lifeTimeRemaining - FrameTime();
		}

		const privious = bulletData.__previous ?? bulletData.__position;

		// 碰撞检测（如果不忽略障碍物）
		if (bulletData.ignoreBlock != true) {
			const [hasBlock, blockPosition] = this.IsBlockInLine(bulletData);
			if (!this.IsValidPosition(bulletData.__position) || hasBlock) {
				this._DebugDrawCircle(bulletData.__position, Vector(255, 0, 0), 0, 10, true, 1);
				// 计算精确的碰撞点
				const finalBlockPosition = hasBlock ? blockPosition : this.GetBlockPosition(bulletData);
				// 处理反弹
				if (!this.HandleBounce(bulletData, finalBlockPosition)) {
					return; // 弹道已销毁
				}
				// 反弹后更新马甲位置
				if (bulletData.__thinker != undefined && IsValid(bulletData.__thinker)) {
					bulletData.__thinker.SetLocalOrigin(bulletData.__position);
					bulletData.__thinker.SetForwardVector((bulletData.__velocity as Vector).Normalized());
				} else if (bulletData.__thinker != undefined) {
					this.DestroyBullet(bulletData);
					return;
				}
			} else {
				this._DebugDrawCircle(bulletData.__position, Vector(0, 255, 0), 0, 10, true, 1);
			}
		}

		if (bulletData.OnBulletThink != undefined) {
			xpcall(bulletData.OnBulletThink, traceback, bulletData.__position, bulletData);
		}
		// 计算命中单位
		if (bulletData.caster != undefined && bulletData.radius != undefined && bulletData.radius > 0 && bulletData.OnBulletHit != undefined) {
			const startRadius = bulletData.radius ?? 0;
			const endRadius = bulletData.radius ?? 0;
			let targets: CDOTA_BaseNPC[] = [];
			if (bulletData.FuncUnitFinder != undefined) {
				let [a, b] = xpcall(bulletData.FuncUnitFinder, traceback, privious, bulletData.__position, startRadius, endRadius, bulletData);
				if (a == true) {
					targets = b as CDOTA_BaseNPC[];
				}
			} else {
				// 画线
				if (bulletData.debug) {
					let direction = Vsub(privious, bulletData.__position).Normalized();
					let points = [
						Vadd(privious, Vmul(RotatePosition(vec3_zero, QAngle(0, 90, 0), direction), startRadius)),
						Vsub(privious, Vmul(RotatePosition(vec3_zero, QAngle(0, 90, 0), direction), startRadius)),
						Vsub(bulletData.__position, Vmul(RotatePosition(vec3_zero, QAngle(0, 90, 0), direction), endRadius)),
						Vadd(bulletData.__position, Vmul(RotatePosition(vec3_zero, QAngle(0, 90, 0), direction), endRadius)),
					];
					DebugDrawCircle(privious, Vector(255, 0, 0), 0, startRadius, true, 0.2);
					DebugDrawCircle(bulletData.__position, Vector(255, 0, 0), 0, endRadius, true, 0.2);
					DebugDrawLine(points[0], points[1], 255, 0, 0, true, 0.2);
					DebugDrawLine(points[1], points[2], 255, 0, 0, true, 0.2);
					DebugDrawLine(points[2], points[3], 255, 0, 0, true, 0.2);
					DebugDrawLine(points[3], points[0], 255, 0, 0, true, 0.2);
				}
				targets = this.FindUnitInLine(bulletData.__teamNumber, privious, bulletData.__position, startRadius, endRadius, bulletData.teamFilter, bulletData.typeFilter, bulletData.flagFilter);
			}
			for (const [_, unit] of ipairs(targets)) {
				if (TableFindKey(bulletData.__hitRecord, unit) == undefined) {
					if (this.SafeUnitFilter(bulletData, unit)) {
						let [success, result] = xpcall(bulletData.OnBulletHit, traceback, unit, bulletData.__position, bulletData);
						// table.insert(bulletData.__hitRecord, unit);
						if (success == true && result == true) {
							this.DestroyBullet(bulletData);
							break;
						}
					}
				}
			}
			bulletData.__hitRecord = targets;
		}

		// 计算生命周期，销毁
		if (bulletData.__lifeTimeRemaining <= 0 && bulletData.__lifeTimeRemaining != -1) {
			if (IsValid(bulletData.__thinker)) {
				bulletData.__thinker.SetLocalOrigin(bulletData.__position);
			}
			this.DestroyBullet(bulletData);
		}

		if (this.bulletList[bulletData.__projIndex] != undefined) {
			bulletData.__previous = bulletData.__position;  // 保存上一帧位置
			if (bulletData.PathFunction != undefined) {
				const [success, result] = xpcall(bulletData.PathFunction, traceback, bulletData.__position, bulletData);
				if (!success) {
					this.DestroyBullet(bulletData);
					return;
				}
				if (type(result) == "userdata") {
					bulletData.__position = result as Vector;
				}
			} else {
				if (!IsValid(bulletData.__thinker)) {
					this.DestroyBullet(bulletData);
					return;
				}
				// 如果目标存在则更新目标位置，否则弹道直线飞行
				if (IsValid(bulletData.target)) {
					bulletData.__target = bulletData.target.GetAbsOrigin();
					const direction = bulletData.__velocity.Normalized();
					const cross = Vsub(bulletData.__thinker.GetAbsOrigin(), privious).Normalized().Cross(Vsub(bulletData.__target, privious).Normalized());
					let flAngle = (bulletData.angularVelocity ?? 0) * FrameTime();
					const flAngleDiff = math.abs(AngleDiff(VectorToAngles(Vsub(bulletData.__target, privious).Normalized()).y, VectorToAngles(direction).y));
					if (flAngleDiff < flAngle) {
						flAngle = flAngleDiff;
					}
					if (cross.z > 0) {
						bulletData.__thinker.SetLocalOrigin((privious + RotatePosition(vec3_zero, QAngle(0, flAngle, 0), bulletData.__velocity.Normalized()) * bulletData.moveSpeed * FrameTime() * 4) as Vector);
					} else {
						bulletData.__thinker.SetLocalOrigin((privious + RotatePosition(vec3_zero, QAngle(0, -flAngle, 0), bulletData.__velocity.Normalized()) * bulletData.moveSpeed * FrameTime() * 4) as Vector);
					}
					bulletData.__velocity = Vmul(Vsub(bulletData.__thinker.GetAbsOrigin(), privious).Normalized(), bulletData.moveSpeed);	// 计算新的方向
					bulletData.__thinker.SetForwardVector(bulletData.__velocity.Normalized());
				} else {
					bulletData.__thinker.SetLocalOrigin(Vadd(bulletData.__position, Vmul(bulletData.__velocity, FrameTime() * 4)));
				}
				bulletData.__position = Vadd(bulletData.__position, Vmul(bulletData.__velocity, FrameTime()));
			}
		}

	}

	private OnRingBulletThink(bulletData: RingBulletData) {
		if (bulletData.__nextThink != undefined && bulletData.interval != undefined && bulletData.OnIntervalThink != undefined && GameRules.GetGameTime() >= bulletData.__nextThink) {
			let [success, result] = xpcall<[RingBulletData], number | void, number>(bulletData.OnIntervalThink, traceback, bulletData);
			if (success) {
				if (result != undefined) {
					bulletData.interval = result < 0 ? undefined : result;
					bulletData.__nextThink = result < 0 ? undefined : GameRules.GetGameTime() + result;
				} else {
					bulletData.__nextThink = GameRules.GetGameTime() + bulletData.interval;
				}
			}
		}

		bulletData.__lifeTimeRemaining = bulletData.__lifeTimeRemaining - FrameTime();

		if (bulletData.followEntity != undefined) {
			if (!IsValid(bulletData.followEntity)) {
				this.DestroyBullet(bulletData);
				return;
			}
			bulletData.__position = bulletData.followEntity.GetAbsOrigin();
		}
		if (bulletData.OnBulletThink != undefined) {
			xpcall(bulletData.OnBulletThink, traceback, bulletData.__position, bulletData);
		}
		// 计算命中单位
		if (bulletData.caster != undefined && bulletData.OnBulletHit != undefined) {
			const startRadius = bulletData.__radius;
			const endRadius = bulletData.__radius + bulletData.width;
			let targets: CDOTA_BaseNPC[] = [];
			if (bulletData.FuncUnitFinder != undefined) {
				let [a, b] = xpcall(bulletData.FuncUnitFinder, traceback, bulletData.__position, bulletData.__position, startRadius, endRadius, bulletData);
				if (a == true) {
					targets = b as CDOTA_BaseNPC[];
				}
			} else {
				targets = FindUnitsInRadius(bulletData.__teamNumber, bulletData.__position, undefined, endRadius, bulletData.teamFilter!, bulletData.typeFilter!, bulletData.flagFilter!, FindOrder.FIND_ANY_ORDER, false);
				targets = targets.filter(v => Vsub(v.GetAbsOrigin(), bulletData.__position).Length2D() >= startRadius && !v.HasState(StateEnum.DODGE_BULLET));
			}
			if (bulletData.debug) {
				DebugDrawCircle(bulletData.__position, Vector(255, 0, 0), 0, endRadius, true, 0.1);
			}
			for (const [_, unit] of ipairs(targets)) {
				if (TableFindKey(bulletData.__hitRecord, unit) == undefined) {
					if (this.SafeUnitFilter(bulletData, unit)) {
						let [success, result] = xpcall(bulletData.OnBulletHit, traceback, unit, bulletData.__position, bulletData);
						table.insert(bulletData.__hitRecord, unit);
						if (success == true && result == true) {
							break;
						}
					}
				}
			}
		}

		bulletData.__radius += bulletData.moveSpeed * FrameTime();

		// 计算生命周期，销毁
		if (bulletData.__lifeTimeRemaining <= 0) {
			this.DestroyBullet(bulletData);
		}
	}

	private CreateSurroundGroup(params: SurroundGroupData) {
		if (this.surroundGroup[params.group] == undefined) {
			this.surroundGroup[params.group] = params;
		}
		return this.surroundGroup[params.group];

	}
	private OnSurroundGroupThink(groupData: SurroundGroupData) {
		if (!IsValid(groupData.caster)) {
			// @ts-ignore
			groupData.caster = undefined;
		}
		groupData.__position = groupData.caster != undefined ? groupData.caster.GetAbsOrigin() : groupData.__position;
		groupData.angle = groupData.angle + groupData.angularVelocity * FrameTime();
		groupData.angle = groupData.angle % 360;

		const projIndexList = shallowcopy(groupData.bulletList);
		for (const [i, projIndex] of ipairs(projIndexList)) {
			this.OnSurroundBulletThink(projIndex, i - 1, groupData);
		}
	}
	private OnSurroundBulletThink(projIndex: number, groupIndex: number, groupData: SurroundGroupData) {
		let bulletData = this.bulletList[projIndex] as unknown as SurroundBulletData;
		if (bulletData == undefined) return;
		if (bulletData.__nextThink != undefined && bulletData.interval != undefined && bulletData.OnIntervalThink != undefined && GameRules.GetGameTime() >= bulletData.__nextThink) {
			let [success, result] = xpcall<[SurroundBulletData], number | void, number>(bulletData.OnIntervalThink, traceback, bulletData);
			if (success) {
				if (result != undefined) {
					bulletData.interval = result < 0 ? undefined : result;
					bulletData.__nextThink = result < 0 ? undefined : GameRules.GetGameTime() + result;
				} else {
					bulletData.__nextThink = GameRules.GetGameTime() + bulletData.interval;
				}
			}
		}

		let bulletCount = groupData.bulletList.length;
		let angleInterval = 360 / bulletCount;
		let targetAngle = groupData.angle + angleInterval * groupIndex;
		let angleDiff = Round(AngleDiff(targetAngle, bulletData.angle), 2);
		bulletData.angle = bulletData.angle! + (groupData.angularVelocity + angleDiff) * FrameTime();
		bulletData.angle = bulletData.angle % 360;

		let trackFix = 0;
		if (bulletData.caster != undefined && bulletData.track) {
			const trackRadius = GetRingTrackRadius(bulletData.caster);
			if (trackRadius > 0) {
				const targets = FindUnitsInRadius(bulletData.caster.GetTeamNumber(), groupData.__position, undefined, groupData.circleRadius + trackRadius, DOTA_UNIT_TARGET_TEAM.DOTA_UNIT_TARGET_TEAM_ENEMY, DOTA_UNIT_TARGET_TYPE.DOTA_UNIT_TARGET_HEROES_AND_CREEPS, DOTA_UNIT_TARGET_FLAGS.DOTA_UNIT_TARGET_FLAG_NONE, FindOrder.FIND_ANY_ORDER, false);
				for (const [i, unit] of ipairs(targets)) {
					const c = Vsub(unit.GetAbsOrigin(), groupData.__position).Length2D() - groupData.circleRadius;
					const a = -1 / 900 * c;
					const b = (900 * a + c) / 30;
					const x = math.min(math.abs(AngleDiff(VectorToAngles(CalcDirection2D(unit.GetAbsOrigin(), groupData.__position)).y, bulletData.angle!)), 30);
					trackFix = trackFix + a * x * x + b * x + c;
				}
				trackFix = math.min(trackFix, trackRadius);
			}
		}
		let circleRadius = bulletData.circleRadius + trackFix;

		const privious = bulletData.__position;
		bulletData.__position = (groupData.__position + AnglesToVector(QAngle(0, bulletData.angle, 0)) * circleRadius + Vector(0, 0, bulletData.offset)) as Vector;
		if (bulletData.debug) {
			DebugDrawCircle(bulletData.__position, Vector(0, 255, 0), 0, 10, true, 1);
		}
		if (IsValid(bulletData.__thinker)) {
			bulletData.__thinker.SetLocalOrigin(bulletData.__position);
		}

		if (bulletData.OnBulletThink != undefined) {
			xpcall(bulletData.OnBulletThink, traceback, bulletData.__position, bulletData);
		}

		// 计算命中单位
		if (bulletData.caster != undefined && bulletData.OnBulletHit != undefined) {
			const startRadius = bulletData.radius ?? 0;
			const endRadius = bulletData.radius ?? 0;
			let targets: CDOTA_BaseNPC[] = [];
			if (bulletData.FuncUnitFinder != undefined) {
				let [a, b] = xpcall(bulletData.FuncUnitFinder, traceback, privious, bulletData.__position, startRadius, endRadius, bulletData);
				if (a == true) {
					targets = b as CDOTA_BaseNPC[];
				}
			} else {
				targets = this.FindUnitInLine(bulletData.__teamNumber, privious, bulletData.__position, startRadius, endRadius, bulletData.teamFilter, bulletData.typeFilter, bulletData.flagFilter);
			}
			for (const [_, unit] of ipairs(targets)) {
				if (TableFindKey(bulletData.__hitRecord, unit) == undefined) {
					if (this.SafeUnitFilter(bulletData, unit)) {
						let [success, result] = xpcall(bulletData.OnBulletHit, traceback, unit, bulletData.__position, bulletData);
						// table.insert(bulletData.__hitRecord, unit);
						if (success == true && result == true) {
							this.DestroyBullet(bulletData);
							break;
						}
					}
				}
			}
			bulletData.__hitRecord = targets;
		}

		// 计算生命周期，销毁
		if (bulletData.__lifeTimeRemaining != undefined) {
			bulletData.__lifeTimeRemaining = bulletData.__lifeTimeRemaining - FrameTime();
			if (bulletData.__lifeTimeRemaining <= 0) {
				this.DestroyBullet(bulletData);
			}
		}
	}
	private OnCustomBulletThink(bulletData: CustomBulletData) {
		if (bulletData.__nextThink != undefined && bulletData.interval != undefined && bulletData.OnIntervalThink != undefined && GameRules.GetGameTime() >= bulletData.__nextThink) {
			let [success, result] = xpcall<[CustomBulletData], number | void, number>(bulletData.OnIntervalThink, traceback, bulletData);
			if (success) {
				if (result != undefined) {
					bulletData.interval = result < 0 ? undefined : result;
					bulletData.__nextThink = result < 0 ? undefined : GameRules.GetGameTime() + result;
				} else {
					bulletData.__nextThink = GameRules.GetGameTime() + bulletData.interval;
				}
			}
		}

		if (bulletData.__lifeTimeRemaining != undefined) {
			bulletData.__lifeTimeRemaining = bulletData.__lifeTimeRemaining - FrameTime();
		}

		const privious = bulletData.__previous ?? bulletData.__position;

		if (bulletData.debug) {
			DebugDrawCircle(bulletData.__position, Vector(0, 255, 0), 0, 10, true, 1);
		}
		if (IsValid(bulletData.__thinker)) {
			bulletData.__thinker.SetLocalOrigin(bulletData.__position);
		}

		if (bulletData.OnBulletThink != undefined) {
			xpcall(bulletData.OnBulletThink, traceback, bulletData.__position, bulletData);
		}

		// 计算命中单位
		if (bulletData.caster != undefined && bulletData.OnBulletHit != undefined) {
			let targets: CDOTA_BaseNPC[] = [];
			if (bulletData.FuncUnitFinder != undefined) {
				let [a, b] = xpcall(bulletData.FuncUnitFinder, traceback, privious, bulletData.__position, bulletData.radius ?? 0, bulletData);
				if (a == true) {
					targets = b as CDOTA_BaseNPC[];
				}
			}
			for (const [_, unit] of ipairs(targets)) {
				if (TableFindKey(bulletData.__hitRecord, unit) == undefined) {
					if (this.SafeUnitFilter(bulletData, unit)) {
						let [success, result] = xpcall(bulletData.OnBulletHit, traceback, unit, bulletData.__position, bulletData);
						table.insert(bulletData.__hitRecord, unit);
						if (success == true && result == true) {
							this.DestroyBullet(bulletData);
							break;
						}
					}
				}
			}
		}

		// 计算生命周期，销毁
		if (bulletData.__lifeTimeRemaining != undefined) {
			// 计算生命周期，销毁
			if (bulletData.__lifeTimeRemaining <= 0) {
				this.DestroyBullet(bulletData);
			}
		}

		// 判断是否有效弹道
		if (this.bulletList[bulletData.__projIndex] != undefined) {
			if (bulletData.PathFunction != undefined) {
				let [success, result] = xpcall(bulletData.PathFunction, traceback, bulletData.__position, bulletData);
				if (success == true) {
					bulletData.__previous = bulletData.__position;  // 保存上一帧位置
					bulletData.__position = result as Vector;
				} else {
					this.DestroyBullet(bulletData);
				}
			}
		}

	}

	FindUnitInLine(teamNumber: number, start: Vector, end: Vector, startRadius: number, endRadius: number, targetTeam: DOTA_UNIT_TARGET_TEAM = DOTA_UNIT_TARGET_TEAM.DOTA_UNIT_TARGET_TEAM_ENEMY, targetType: DOTA_UNIT_TARGET_TYPE = DOTA_UNIT_TARGET_TYPE.DOTA_UNIT_TARGET_BASIC + DOTA_UNIT_TARGET_TYPE.DOTA_UNIT_TARGET_HERO, targetFlags: DOTA_UNIT_TARGET_FLAGS = DOTA_UNIT_TARGET_FLAGS.DOTA_UNIT_TARGET_FLAG_NONE) {
		// 优化：缓存向量计算结果
		const direction = Vsub(start, end).Normalized();
		const lineLength = Vsub(start, end).Length2D();
		const radius = lineLength + startRadius + endRadius;
		const center = VectorLerp(0.5, Vadd(start, Vmul(direction, startRadius)), Vsub(end, Vmul(direction, endRadius)));

		// 优化：提前计算多边形顶点
		const perpendicular = RotatePosition(vec3_zero, QAngle(0, 90, 0), direction);
		const points = [
			Vadd(start, Vmul(perpendicular, startRadius)),
			Vsub(start, Vmul(perpendicular, startRadius)),
			Vsub(end, Vmul(perpendicular, endRadius)),
			Vadd(end, Vmul(perpendicular, endRadius)),
		];

		this._DebugDrawCircle(start, Vector(255, 0, 0), 0, startRadius, true, 0.2);
		this._DebugDrawCircle(end, Vector(255, 0, 0), 0, endRadius, true, 0.2);

		let targetInLine: CDOTA_BaseNPC[] = [];
		let targets = FindUnitsInRadius(teamNumber, center, undefined, radius, targetTeam, targetType, targetFlags, FindOrder.FIND_ANY_ORDER, false);

		// 优化：先过滤明显在范围外的单位，减少检测次数
		for (const [_, unit] of ipairs(targets)) {
			let unitPosition = unit.GetAbsOrigin();
			const distToEnd = Vsub(unitPosition, end).Length2D();

			// 先用中心点做一个非常便宜的快速命中（保留原有行为，减少后续 OBB 计算次数）
			let hit = false;
			if (distToEnd < endRadius && direction.Dot(Vsub(unitPosition, start).Normalized()) < 0) {
				hit = true;
			} else if (this.IsPointInPolygon(unitPosition, points)) {
				hit = true;
			}

			// 如果中心点没命中，再用 OBB 精算（考虑单位碰撞体积）
			if (hit == false) {
				const segInfo = this._CalcDistanceSegmentToEntityOBB2D(unit, start, end);
				const t = segInfo.t;
				const radiusAtT = startRadius + (endRadius - startRadius) * t;
				if (segInfo.distance <= radiusAtT) {
					hit = true;
				}
			}

			if (hit == true) {
				if (!unit.HasState(StateEnum.DODGE_BULLET)) {
					targetInLine.push(unit);
				} else {
					Event.Fire("avoid_damage", { unit: unit });
				}
			}
		}
		return targetInLine;
	}

	private _ProjectPointToSegmentT2D(point: Vector, start: Vector, end: Vector): number {
		const seg = Vsub(end, start);
		const segLen = seg.Length2D();
		if (segLen <= 0.001) {
			return 0;
		}
		const denom = segLen * segLen;
		let t = Vsub(point, start).Dot(seg) / denom;
		if (t < 0) t = 0;
		if (t > 1) t = 1;
		return t;
	}

	private _CalcDistancePointToEntityOBB2D(entity: CBaseEntity, point: Vector): number {
		const closest = CalcClosestPointOnEntityOBB(entity, point);
		return Vsub(point, closest).Length2D();
	}

	/**
	 * 近似计算 2D 线段到单位 OBB 的最小距离。
	 * 返回：distance（2D最小距离）、t（距离对应的线段插值参数[0,1]）
	 */
	private _CalcDistanceSegmentToEntityOBB2D(entity: CBaseEntity, start: Vector, end: Vector): { distance: number; t: number; } {
		const seg = Vsub(end, start);
		const segLen = seg.Length2D();
		if (segLen <= 0.001) {
			return { distance: this._CalcDistancePointToEntityOBB2D(entity, start), t: 0 };
		}

		// 迭代 2 次：用“线段->OBB 最近点”来修正线段投影点，效果接近 min distance(entity OBB, segment)
		let t = this._ProjectPointToSegmentT2D(entity.GetAbsOrigin(), start, end);
		let probe = Vadd(start, Vmul(seg, t));
		for (let i = 0; i < 2; i++) {
			const closest = CalcClosestPointOnEntityOBB(entity, probe);
			t = this._ProjectPointToSegmentT2D(closest, start, end);
			probe = Vadd(start, Vmul(seg, t));
		}

		const closestFinal = CalcClosestPointOnEntityOBB(entity, probe);
		const distance = Vsub(probe, closestFinal).Length2D();
		return { distance, t };
	}
}

declare global {
	var Bullet: CBullet;

	interface HitterParams {
		caster?: CDOTA_BaseNPC,
		ability?: CDOTABaseAbility,
		teamFilter?: DOTA_UNIT_TARGET_TEAM,
		typeFilter?: DOTA_UNIT_TARGET_TYPE,
		flagFilter?: DOTA_UNIT_TARGET_FLAGS,
		radius?: number,
		/** 过滤单位函数 */
		FuncUnitFilter?: (this: void, hUnit: CDOTA_BaseNPC) => boolean;
	}
	interface LinearHitterParams extends HitterParams {
		startRadius?: number,
		endRadius?: number,
		OnBulletHit?: (this: void, unit: CDOTA_BaseNPC, position: Vector, bulletData: LinearBulletData) => void | boolean;
		/** 覆盖搜索单位的函数 */
		FuncUnitFinder?: (this: void, privious: Vector, position: Vector, startRadius: number, endRadius: number, bulletData: LinearBulletData) => CDOTA_BaseNPC[];
	}
	interface TrackingHitterParams extends HitterParams {
		OnBulletHit?: (this: void, unit: CDOTA_BaseNPC, position: Vector, bulletData: TrackingBulletData) => void | boolean;
		/** 覆盖搜索单位的函数 */
		FuncUnitFinder?: (this: void, privious: Vector, position: Vector, startRadius: number, endRadius: number, bulletData: TrackingBulletData) => CDOTA_BaseNPC[];
	}
	interface GuidedHitterParams extends HitterParams {
		OnBulletHit?: (this: void, unit: CDOTA_BaseNPC, position: Vector, bulletData: GuidedBulletData) => void | boolean;
		/** 覆盖搜索单位的函数 */
		FuncUnitFinder?: (this: void, privious: Vector, position: Vector, startRadius: number, endRadius: number, bulletData: GuidedBulletData) => CDOTA_BaseNPC[];
	}
	interface RingHitterParams extends HitterParams {
		// 开始半径，默认是0
		startRadius?: number;
		// 结束半径，默认等于radius
		endRadius?: number;
		OnBulletHit?: (this: void, unit: CDOTA_BaseNPC, position: Vector, bulletData: RingBulletData) => void | boolean;
		/** 覆盖搜索单位的函数 */
		FuncUnitFinder?: (this: void, privious: Vector, position: Vector, startRadius: number, endRadius: number, bulletData: RingBulletData) => CDOTA_BaseNPC[];
	}
	interface SurroundHitterParams extends HitterParams {
		caster: CDOTA_BaseNPC,
		OnBulletHit?: (this: void, unit: CDOTA_BaseNPC, position: Vector, bulletData: SurroundBulletData) => void | boolean;
		/** 覆盖搜索单位的函数 */
		FuncUnitFinder?: (this: void, privious: Vector, position: Vector, startRadius: number, endRadius: number, bulletData: SurroundBulletData) => CDOTA_BaseNPC[];
	}
	interface CustomHitterParams extends HitterParams {
		OnBulletHit?: (this: void, unit: CDOTA_BaseNPC, position: Vector, bulletData: CustomBulletData) => void | boolean;
		/** 覆盖搜索单位的函数 */
		FuncUnitFinder?: (this: void, privious: Vector, position: Vector, radius: number, bulletData: CustomBulletData) => CDOTA_BaseNPC[];
	}

	interface BulletData {
		/** 当前位置 */
		__position: Vector,
		/** 弹道类型 */
		__projType: BULLET_TYPE;
		/** 记录粒子特效 */
		__particleID?: ParticleID;
		/** 记录计时器 */
		__nextThink?: number;
		/** 记录弹道索引 */
		__projIndex: number;
		/** 马甲 */
		__thinker?: CDOTA_BaseNPC;
		/** 记录击中过的单位 */
		__hitRecord: CDOTA_BaseNPC[];
		/** 记录teamNumber */
		__teamNumber: DOTATeam_t,
		/** 空间分区：当前所在网格key */
		__gridKey?: string;
		/** 创建时间，用于自动清理时判断弹道年龄 */
		__createdTime?: number;
		/** 上一帧的位置（用于碰撞检测） */
		__previous?: Vector;
		/** 剩余反弹次数 */
		bounce?: number;
		/** 是否无视障碍物 */
		ignoreBlock?: boolean;
		/** 弹道撞墙后是否销毁（没有反弹次数时） */
		destroyOnBounce?: boolean;
		/** 反弹开始回调 */
		OnBulletBounceStart?: (this: void, bulletData: any) => void;
		/** 反弹结束回调 */
		OnBulletBounceEnd?: (this: void, bulletData: any) => void;
	}

	/** 创建弹道需要的信息 */
	interface BaseCreateParams {
		effectName?: string;
		interval?: number;	/** 计时器 */
		debug?: boolean; 		/** 是否显示调试信息 */
		/** 是否允许被敌人反弹 */
		reflectable?: boolean;
		/** 碰撞反弹次数 */
		bounce?: number;
		/** 是否无视障碍物 */
		ignoreBlock?: boolean;
		/** 弹道撞墙后是否销毁（没有反弹次数时） */
		destroyOnBounce?: boolean;
		/** 反弹开始回调 */
		OnBulletBounceStart?: (this: void, bulletData: any) => void;
		/** 反弹结束回调 */
		OnBulletBounceEnd?: (this: void, bulletData: any) => void;
	}

	/** 创建线性弹道需要的信息 */
	interface LinearCreateParams extends BaseCreateParams, LinearHitterParams {
		spawnOrigin: Vector;
		moveSpeed: number;
		direction: Vector;
		distance: number;
		repeatHit?: boolean;
		thinker?: boolean;
		OnBulletCreated?: (this: void, bulletData: LinearBulletData) => void;
		OnBulletThink?: (this: void, position: Vector, bulletData: LinearBulletData) => void;
		OnBulletDestroy?: (this: void, bulletData: LinearBulletData) => void;
		ParticleCreator?: (this: void, bulletData: LinearBulletData) => ParticleID;
		OnIntervalThink?: (this: void, bulletData: LinearBulletData) => number | void;
	}

	/** 线性弹道的信息 */
	interface LinearBulletData extends LinearCreateParams, BulletData {
		/** 弹道的生命周期 */
		__lifeTime: number,
		/** 弹道的剩余生命 */
		__lifeTimeRemaining: number,
		/** 速度 */
		__velocity: Vector,
	}

	interface TrackingCreateParams extends BaseCreateParams, TrackingHitterParams {
		spawnOrigin: Vector;
		moveSpeed: number;
		target: CDOTA_BaseNPC;
		/** 是否有前面的椎体 */
		hasFrontalCone?: boolean;
		OnBulletCreated?: (this: void, bulletData: TrackingBulletData) => void;
		OnBulletThink?: (this: void, position: Vector, bulletData: TrackingBulletData) => void;
		OnBulletDestroy?: (this: void, bulletData: TrackingBulletData) => void;
		ParticleCreator?: (this: void, bulletData: TrackingBulletData) => ParticleID;
		OnIntervalThink?: (this: void, bulletData: TrackingBulletData) => number | void;
	}
	/** 追踪弹道的信息 */
	interface TrackingBulletData extends TrackingCreateParams, BulletData {
		__target: Vector;
		/** 速度 */
		__velocity: Vector,
	}

	interface GuidedCreateParams extends BaseCreateParams, GuidedHitterParams {
		spawnOrigin: Vector;
		moveSpeed: number;
		target?: CDOTA_BaseNPC;
		direction?: Vector;
		angularVelocity?: number;	/** 角速度 */
		lifeTime?: number;			/** 生命周期 */
		OnBulletCreated?: (this: void, bulletData: GuidedBulletData) => void;
		OnBulletThink?: (this: void, position: Vector, bulletData: GuidedBulletData) => void;
		OnBulletDestroy?: (this: void, bulletData: GuidedBulletData) => void;
		ParticleCreator?: (this: void, bulletData: GuidedBulletData) => ParticleID;
		PathFunction?: (this: void, position: Vector, bulletData: GuidedBulletData) => void | Vector;
		OnIntervalThink?: (this: void, bulletData: GuidedBulletData) => number | void;
	}
	/** 追踪弹道的信息 */
	interface GuidedBulletData extends GuidedCreateParams, BulletData {
		/** 弹道的生命周期 */
		__lifeTime: number,
		/** 弹道的剩余生命 */
		__lifeTimeRemaining: number,
		/** 目标位置 */
		__target: Vector;
		/** 速度 */
		__velocity: Vector,
		/** 马甲 */
		__thinker: CDOTA_BaseNPC;
	}
	/** 环形弹道参数 */
	interface RingCreateParams extends BaseCreateParams, RingHitterParams {
		spawnOrigin: Vector;
		moveSpeed: number;
		/** 搜寻宽度 */
		width: number;
		/** 中心点是否跟随实体 */
		followEntity?: CBaseEntity;
		/** 生命周期 */
		lifeTime: number;
		OnBulletCreated?: (this: void, bulletData: RingBulletData) => void;
		OnBulletThink?: (this: void, position: Vector, bulletData: RingBulletData) => void;
		OnBulletDestroy?: (this: void, bulletData: RingBulletData) => void;
		ParticleCreator?: (this: void, bulletData: RingBulletData) => ParticleID;
		OnIntervalThink?: (this: void, bulletData: RingBulletData) => number | void;
	}
	/** 环形弹道的信息 */
	interface RingBulletData extends RingCreateParams, BulletData {
		__radius: number,	/** 弹道当前半径 */
		/** 弹道的生命周期 */
		__lifeTime: number,
		/** 弹道的剩余生命 */
		__lifeTimeRemaining: number,
	}

	interface SurroundCreateParams extends BaseCreateParams, SurroundHitterParams {
		spawnOrigin?: Vector;
		group?: string;				/** 环绕组 */
		circleRadius: number; 		/** 环绕半径 */
		angle?: number;				/** 初始角度 */
		track?: boolean;			/** 是否开启追踪敌人，默认开启（开启了也需要有追踪距离属性才能追踪） */
		angularVelocity: number;	/** 环绕角速度 */
		offset?: number;			/** 高度偏移 */
		lifeTime?: number;			/** 生命周期 */

		OnBulletCreated?: (this: void, bulletData: SurroundBulletData) => void;
		OnBulletThink?: (this: void, position: Vector, bulletData: SurroundBulletData) => void;
		OnBulletDestroy?: (this: void, bulletData: SurroundBulletData) => void;
		ParticleCreator?: (this: void, bulletData: SurroundBulletData) => ParticleID;
		OnIntervalThink?: (this: void, bulletData: SurroundBulletData) => number | void;
	}
	/** 环绕弹道的信息 */
	interface SurroundBulletData extends SurroundCreateParams, BulletData {
		__lifeTime?: number,			/** 弹道的生命周期 */
		__lifeTimeRemaining?: number,	/** 弹道的剩余生命 */
		__thinker: CDOTA_BaseNPC;		/** 马甲 */
		group: string;					/** 组名 */
		angle: number;					/** 初始角度 */
		offset: number;					/** 高度偏移 */
	}

	/** 自定义弹道参数 */
	interface CustomCreateParams extends BaseCreateParams, CustomHitterParams {
		spawnOrigin: Vector;
		moveSpeed?: number;
		direction?: Vector;
		lifeTime?: number;			/** 生命周期 */
		hasThinker?: boolean;
		OnBulletCreated?: (this: void, bulletData: CustomBulletData) => void;
		OnBulletThink?: (this: void, position: Vector, bulletData: CustomBulletData) => void;
		OnBulletDestroy?: (this: void, bulletData: CustomBulletData) => void;
		ParticleCreator?: (this: void, bulletData: CustomBulletData) => ParticleID;
		OnIntervalThink?: (this: void, bulletData: CustomBulletData) => number | void;
		PathFunction?: (this: void, position: Vector, bulletData: CustomBulletData) => Vector;
	}/** 自定义弹道的信息 */
	interface CustomBulletData extends CustomCreateParams, BulletData {
		/** 弹道的生命周期 */
		__lifeTime?: number,
		/** 弹道的剩余生命 */
		__lifeTimeRemaining?: number,
	}

	/** 环绕组 */
	interface SurroundGroupData {
		caster: CDOTA_BaseNPC;		/** 环绕的单位 */
		group: string;				/** 组名 */
		angle: number;				/** 初始角度 */
		circleRadius: number;		/** 环绕半径 */
		angularVelocity: number;	/** 环绕角速度 */
		bulletList: number[];		/** 弹道列表 */
		__position: Vector;			/** 环绕中心位置 */
	}



	/** 临时阻挡区域数据 */
	interface TemporaryBlockData {
		/** 区域类型 */
		type: TEMPORARY_BLOCK_TYPE;
		/** 圆形区域：中心点 */
		center?: Vector;
		/** 圆形区域：半径 */
		radius?: number;
		/** 多边形区域：顶点数组 */
		points?: Vector[];
		/** 进入区域时的回调 */
		callback?: (this: void, bulletData: any) => void;
	}

}
Bullet ??= new CBullet();