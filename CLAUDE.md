# One Shot One Kill — Dota 2 Mod 开发守则

## 铁律
1. **只改 TypeScript/TSX 源码，绝不直接改 Lua 或 JS**
   - Lua (`game/A1/scripts/vscripts/`) 和 JS (`content/A1/panorama/`) 是编译输出，`npm run build` 会覆盖
   - 唯一例外：`.txt` KV 文件（`npc_abilities_custom.txt`、`npc_heroes_custom.txt`）可以直接手改
2. **任何改动后必须执行 `npm run build` 验证编译通过**
3. **编译后的 Lua 必须在 `game/A1/scripts/vscripts/` 中**

## 技术栈
- 游戏逻辑：TypeScript → Lua（TypeScriptToLua / tstl）
- UI：React Panorama（TSX → JS）
- 通信：Custom Game Events + Custom Net Tables
- Addon 名称：`A1`

## 目录结构
```
src/vscripts/                # 游戏逻辑源码（TS）
  abilities/                 # ability_lua 技能类
  systems/                   # combat_system, map_system, pickup_system
  game_mode.ts               # 主游戏模式类
src/panorama/                # UI 源码（TSX）
  hud.tsx                    # 主 HUD
  utils/net.ts               # 客户端网络工具
shared/                      # 前后端共享
  types.ts, hero_data.ts, config.ts
game/A1/scripts/npc/         # KV 配置表（直接改）
  npc_abilities_custom.txt
  npc_heroes_custom.txt
game/A1/scripts/vscripts/    # 编译后的 Lua（不手改）
content/A1/panorama/         # 编译后的 JS/CSS（不手改）
```

## 关键文件速查
| 用途 | 路径 |
|------|------|
| 修改技能逻辑 | `src/vscripts/abilities/ability_xxx_shot.ts` |
| 修改战斗规则 | `src/vscripts/systems/combat_system.ts` |
| 修改游戏主逻辑 | `src/vscripts/game_mode.ts` |
| 修改 HUD | `src/panorama/hud.tsx` |
| 修改英雄数据 | `shared/hero_data.ts` + `shared/types.ts` |
| 修改 KV 技能/英雄 | `game/A1/scripts/npc/npc_abilities_custom.txt` / `npc_heroes_custom.txt` |
| 客户端发事件 | `src/panorama/utils/net.ts` |
| 服务端同步数据 | `src/vscripts/net_tables.ts` |

## 编译注意事项
- 命令：`npm run build`（同时编译 game + panorama）
- `tsconfig.game.json` 无显式 `rootDir`，编译后会多嵌套 `src/vscripts/`，由 `scripts/post-build.js` 自动修正
- **不要加 `rootDir`**，否则 shared/ 目录会报 TS6059
- Vector 运算需 cast：`(origin as any) + (direction as any) * range`
- `CDOTA_Ability_Lua` 不能直接 `extends`，通过 `const AbilityBase = CDOTA_Ability_Lua as any` 间接继承

## Git 远程
- GitHub：`git@github.com:wushuangamhc/a1.git`
- Codeup：`git@codeup.aliyun.com:625e35b264c8a06be2d44ae9/ai_code/A1.git`
- 两个 remote 都要 push

