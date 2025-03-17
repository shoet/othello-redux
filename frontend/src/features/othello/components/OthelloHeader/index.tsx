import { Player } from "../../othello";
import { Disk } from "../Disk";
import styles from "./index.module.scss";

type Props = {
  turnPlayer: Player;
};

export const OthelloHeader = (props: Props) => {
  return (
    <div className={styles.header}>
      <Disk color={props.turnPlayer.cellColor} />
      <span className={styles.turn}>{`${props.turnPlayer.name}'s Turn`}</span>
    </div>
  );
};
