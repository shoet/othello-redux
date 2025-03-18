import { CSSProperties } from "react";
import { Player } from "../../othello";
import { Disk } from "../Disk";
import styles from "./index.module.scss";
import { theme } from "../../../../theme";

type Props = {
  turnPlayer: Player;
};

export const OthelloHeader = (props: Props) => {
  const style = {
    "--backgroundColor": theme.othello.backgrounddColor,
  } as CSSProperties;
  return (
    <div className={styles.header} style={style}>
      <Disk color={props.turnPlayer.cellColor} />
      <span className={styles.turn}>{`${props.turnPlayer.name}'s Turn`}</span>
    </div>
  );
};
