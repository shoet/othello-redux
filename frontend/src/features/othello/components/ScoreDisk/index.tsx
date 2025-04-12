import { CSSProperties } from "react";
import { CellColor } from "../../othello";
import { Disk } from "../Disk";
import styles from "./index.module.scss";
import { theme } from "../../../../theme";

export const ScoreDisk = (props: { color: CellColor; count: number }) => {
  const style = {
    "--text-color":
      props.color === "white"
        ? theme.othello.diskBlackColor
        : theme.othello.diskWhiteColor,
  } as CSSProperties;
  return (
    <div>
      <div className={styles.scoreOnDisk}>
        <div className={styles.disk}>
          <Disk color={props.color} />
          <div className={styles.score} style={style}>
            {props.count}
          </div>
        </div>
      </div>
    </div>
  );
};
