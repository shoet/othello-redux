import { CSSProperties, memo } from "react";
import { CellColor } from "../../othello";
import { Disk } from "../Disk";
import styles from "./index.module.scss";
import { theme } from "../../../../theme";

type Props = {
  diskColor?: CellColor;
  message?: string;
};

const OthelloHeaderComponent = (props: Props) => {
  const style = {
    "--backgroundColor": theme.othello.backgrounddColor,
  } as CSSProperties;
  return (
    <div className={styles.header} style={style}>
      {props.diskColor && <Disk color={props.diskColor} />}
      {props.message && <div className={styles.message}>{props.message}</div>}
    </div>
  );
};

export const OthelloHeader = memo(OthelloHeaderComponent);
