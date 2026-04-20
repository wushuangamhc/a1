/**
 * 弹道相关枚举 —— 从 c1 项目迁移
 */

export enum BULLET_TYPE {
	CUSTOM,
	LINEAR,
	TRACKING,
	SURROUND,
	GUIDED,
	RING,
}

/** 临时阻挡区域类型 */
export enum TEMPORARY_BLOCK_TYPE {
	CIRCLE = 1,
	POLYGON = 2,
}
