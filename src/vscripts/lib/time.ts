export function now(): number {
  return GameRules.GetGameTime();
}

export function schedule(delaySeconds: number, callback: () => void): void {
  const key = DoUniqueString("oss_schedule");
  GameRules.GetGameModeEntity().SetContextThink(
    key,
    () => {
      callback();
      return undefined;
    },
    delaySeconds
  );
}

export function repeatEvery(intervalSeconds: number, callback: () => number | void): void {
  const key = DoUniqueString("oss_repeat");
  GameRules.GetGameModeEntity().SetContextThink(
    key,
    () => {
      const nextInterval = callback();
      return nextInterval === undefined ? intervalSeconds : nextInterval;
    },
    intervalSeconds
  );
}
