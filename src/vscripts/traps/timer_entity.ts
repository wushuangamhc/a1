export {};

declare const _G: Record<string, any>;

const TimerManager = {
    Think(this: void): void {
        // Stub: no-op to prevent nil value errors.
    }
};

function OnTimer(this: void): void {
    TimerManager.Think();
}

_G.TimerManager = TimerManager;
_G.OnTimer = OnTimer;
