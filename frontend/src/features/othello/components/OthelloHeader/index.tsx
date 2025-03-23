import { CSSProperties } from "react";
import { Player } from "../../othello";
import { Disk } from "../Disk";
import styles from "./index.module.scss";
import { theme } from "../../../../theme";
import { OthelloGameStatus } from "../../othelloSlice";

type Props = {
  status: OthelloGameStatus;
  turnPlayer?: Player;
};

export const OthelloHeader = (props: Props) => {
  const style = {
    "--backgroundColor": theme.othello.backgrounddColor,
  } as CSSProperties;
  return (
    <div className={styles.header} style={style}>
      {props.status === "playing" && props.turnPlayer ? (
        <div>
          <Disk color={props.turnPlayer.cellColor} />
          <span
            className={styles.turn}
          >{`${props.turnPlayer.clientID}'s Turn`}</span>
        </div>
      ) : (
        <div className={styles.systemMessage}>ゲームを開始します。</div>
      )}
    </div>
  );
};
