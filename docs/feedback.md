# Agent Feedback Log

用于记录用户指出的实际错误，形成项目内的反馈闭环。

建议记录格式：

## YYYY-MM-DD 标题

- 问题：用户指出了什么错误
- 场景：在哪个任务或文件中出现
- 根因：为什么会犯这个错误
- 修正：这次如何修复
- 预防：下次如何避免

## 2026-04-20 ability lua 直接 index nil 的 GameRules.OneShotGameMode

- 问题：`ability_windrunner_shot.lua:13: attempt to index local 'gameMode' (a nil value)`，开火即崩。
- 场景：手写的 `ability_windrunner_shot.lua` / `ability_sniper_shot.lua`（TS 源已删除）直接 `GameRules.OneShotGameMode.combat:handleFire(...)`。
- 根因：之前默认 `Activate()` 一定先于任何技能释放被引擎回调，但缺少兜底；当 `_G.Activate` 由于时序/暴露方式没被引擎找到时，ability 端就直接索引 nil 崩掉，而且没有任何日志辅助定位。
- 修正：1) ability 内加 `ensureGameMode()` 守卫，发现 nil 时 `pcall(_G.Activate)` 兜底拉起；仍为 nil 则打日志 return，不让脚本崩溃。2) `addon_game_mode.ts` 在加载、Activate 入口、实例创建、init 完成四处加 `print("[A1] ...")`，便于通过 VConsole 直接观察初始化路径走到哪一步。
- 预防：跨脚本依赖（ability lua 依赖 game_mode 实例）必须 nil 守卫 + 明确日志；任何"必然先初始化"的假设要在脚本里显式校验，不要默认引擎时序一定符合预期。