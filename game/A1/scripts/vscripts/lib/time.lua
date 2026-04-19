--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
function ____exports.now(self)
    return GameRules:GetGameTime()
end
function ____exports.schedule(self, delaySeconds, callback)
    local key = DoUniqueString("oss_schedule")
    GameRules:GetGameModeEntity():SetContextThink(
        key,
        function()
            callback(nil)
            return nil
        end,
        delaySeconds
    )
end
function ____exports.repeatEvery(self, intervalSeconds, callback)
    local key = DoUniqueString("oss_repeat")
    GameRules:GetGameModeEntity():SetContextThink(
        key,
        function()
            local nextInterval = callback(nil)
            return nextInterval == nil and intervalSeconds or nextInterval
        end,
        intervalSeconds
    )
end
return ____exports
