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

## 错误反馈闭环
当用户明确指出上一轮实现或判断有误时：
1. 先直接承认问题，不要嘴硬或绕开
2. 将错误、触发场景、修正方式记录到 `docs/feedback.md`
3. 用一句话分析根因
4. 明确说明下次如何避免同类问题

## Windows 脚本规则
- 优先使用 Python，而不是复杂 `.bat`
- 如果只是为了双击启动，`.bat` 保持最小化且只用 ASCII，例如：`@py -3 "%~dp0script.py" %*`
- 如果 `.bat` 必须包含非 ASCII，第一行加 `chcp 65001 >nul`
- 需要调用同目录脚本或二进制时，在开头加：`cd /d "%~dp0"`

## 行为准则
### 先想清楚再改
- 不要默默假设需求；有关键不确定性时先说清假设
- 如果存在多种合理解释，优先选最保守、最小的实现路径
- 如果更简单的方案能解决问题，应优先采用

### 简单优先
- 只写完成当前需求所需的最少代码
- 不为单次使用场景提前做抽象
- 不附带实现未被请求的“顺手优化”或“未来扩展”

### 手术式改动
- 只改与当前需求直接相关的代码
- 不顺手重构、不顺手改格式、不顺手清理无关问题
- 仅清理由本次改动直接造成的未使用代码

### 目标驱动
- 修 bug 时，优先先构造可验证的复现方式，再修复，再验证
- 多步骤任务应显式定义“完成标准”和对应验证动作

## 排查复杂问题时的默认流程
遇到非显而易见的 bug、环境差异问题、反复出现的问题或一次阅读后仍不确定根因时，按以下顺序推进：
1. Observe：先收集现象、日志、报错、调用链
2. Hypothesize：列出最可能的几个根因，不要只赌一个
3. Experiment：为每个假设设计最小验证实验
4. Conclude：确认根因后再改代码，并说明证据

## Git 远程
- GitHub：`git@github.com:wushuangamhc/a1.git`
- Codeup：`git@codeup.aliyun.com:625e35b264c8a06be2d44ae9/ai_code/A1.git`
- 两个 remote 都要 push

