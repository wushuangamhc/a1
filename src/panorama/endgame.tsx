import * as React from "react";
import { render } from "react-panorama";
import { MatchStateSnapshot } from "@shared/types";
import { getMatchSnapshot } from "@panorama/utils/net";

function useMatchSnapshot(): MatchStateSnapshot | undefined {
  const [snapshot, setSnapshot] = React.useState<MatchStateSnapshot | undefined>();

  React.useEffect(() => {
    let cancelled = false;
    const poll = (): void => {
      if (cancelled) {
        return;
      }
      setSnapshot(getMatchSnapshot());
      $.Schedule(0.2, poll);
    };
    $.Schedule(0.2, poll);

    return () => {
      cancelled = true;
    };
  }, []);

  return snapshot;
}

function EndgameApp(): React.ReactElement {
  const snapshot = useMatchSnapshot();
  if (snapshot?.phase !== "post_game") {
    return <Panel id="EndgameShell" />;
  }

  return (
    <Panel id="EndgameShell" className="EndgameShell--visible">
      <Label className="EndgameTitle" text="Match Complete" />
      <Label text={`Mode: ${snapshot.mode}`} />
      <Label text={`Winning Team: ${snapshot.winnerTeamId ?? "TBD"}`} />
      <Label text={`Kill Target: ${snapshot.killTarget}`} />
    </Panel>
  );
}

let hasMountedEndgame = false;

function mountEndgame(): void {
  if (hasMountedEndgame) {
    return;
  }

  const root = $("#EndgameRoot");
  if (!root) {
    return;
  }

  hasMountedEndgame = true;
  render(<EndgameApp />, root);
}

$.Schedule(0, mountEndgame);
$.RegisterForUnhandledEvent("DOTAHudReady", mountEndgame);
