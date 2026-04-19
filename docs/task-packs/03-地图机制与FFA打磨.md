# 03 地图机制与 FFA 打磨

## 目标

把地图实体命名约定接成真实可玩的 FFA Alpha 机制层。

## 涉及目录

- `game/systems/map_system.ts`
- `game/systems/pickup_system.ts`
- `game/net_tables.ts`
- `content/panorama/src/scoreboard.tsx`
- `content/panorama/src/endgame.tsx`

## 验收标准

- bushes、teleport、pickup 逻辑与实体命名一致
- match ended 状态能驱动 endgame UI
- scoreboard 能稳定反映击杀排名

## 给 Kimi 的执行提示词

你现在负责 FFA Alpha 的地图机制打磨。请专注把已有的系统接稳，不要扩展新模式。

要求：
- 地图交互只认 README 中约定的实体命名
- 不新增新的 shared 接口，除非你同时更新双端并说明原因
- 如果 breakable、wall、bush 在 Dota 原生层需要额外 KV 或 Hammer 配置，请在结果里明确列出来

你要完成的事：
- 把地图机制从“代码占位”推进到“可接图验证”
- 检查 matchState / playerState / mapState 的表结构是否足够 UI 使用
- 让 endgame 和 scoreboard 更适合 FFA 试玩
