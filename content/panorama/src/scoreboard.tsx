import * as React from "react";
import { render } from "react-panorama";
import { ScoreboardEntry } from "@shared/types";
import { getScoreboardEntries } from "@panorama/utils/net";

function useScoreboard(): ScoreboardEntry[] {
  const [entries, setEntries] = React.useState<ScoreboardEntry[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    const poll = (): void => {
      if (cancelled) {
        return;
      }
      setEntries(getScoreboardEntries());
      $.Schedule(0.2, poll);
    };
    $.Schedule(0.2, poll);

    return () => {
      cancelled = true;
    };
  }, []);

  return entries;
}

function ScoreboardApp(): React.ReactElement {
  const entries = useScoreboard();
  return (
    <Panel id="ScoreboardShell">
      <Label className="CardHeading" text="Scoreboard" />
      {entries.map((entry) => (
        <Panel key={entry.playerId} className="ScoreRow">
          <Label className="ScoreName" text={entry.playerName} />
          <Label className="ScoreHero" text={entry.heroId} />
          <Label className="ScoreValue" text={`${entry.kills}`} />
          <Label className="ScoreValue" text={`${entry.deaths}`} />
          <Label className="ScoreBlessing" text={entry.blessingId} />
        </Panel>
      ))}
    </Panel>
  );
}

$.RegisterForUnhandledEvent("DOTAHudReady", () => {
  const root = $("#ScoreboardRoot");
  if (!root) {
    return;
  }

  render(<ScoreboardApp />, root);
});
