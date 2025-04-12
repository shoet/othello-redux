import { CSSProperties, memo } from "react";
import { CellColor, GameScore } from "../../othello";
import { Disk } from "../Disk";
import styles from "./index.module.scss";
import { theme } from "../../../../theme";
import { ScoreDisk } from "../ScoreDisk";

type Props = {
  diskColor?: CellColor;
  message?: string;
  gameScore?: GameScore;
};

const Score = (gameScore: GameScore) => {
  return (
    <div className={styles.gameScore}>
      <ScoreDisk color="white" count={gameScore.white.count} />
      <ScoreDisk color="black" count={gameScore.black.count} />
    </div>
  );
};

const OthelloHeaderComponent = (props: Props) => {
  const style = {
    "--backgroundColor": theme.othello.backgrounddColor,
  } as CSSProperties;
  return (
    <div className={styles.header} style={style}>
      <div className={styles.titleInner}>
        {props.diskColor && <Disk color={props.diskColor} />}
        {props.message && <div className={styles.message}>{props.message}</div>}
      </div>
      {props.gameScore && <Score {...props.gameScore} />}
    </div>
  );
};

export const OthelloHeader = memo(OthelloHeaderComponent);
