TimerManager = TimerManager or {}
function TimerManager:Think()
    -- Stub: no-op to prevent nil value errors.
end

function OnTimer()
    TimerManager:Think()
end
