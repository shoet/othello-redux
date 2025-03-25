import { CSSProperties, memo } from "react";
import { Player } from "../../othello";
import { Disk } from "../Disk";
import styles from "./index.module.scss";
import { theme } from "../../../../theme";
import { OthelloGameStatus } from "../../othelloSlice";

type Props = {
  status: OthelloGameStatus;
  clientID: string | undefined;
  turnPlayer?: Player;
};

const OthelloHeaderComponent = (props: Props) => {
  const getMessage = (props: Props) => {
    if (props.status === "prepare") return "ゲームを開始します。";
    if (props.status === "end") return "ゲームが終了しました。";
    if (props.turnPlayer) {
      return props.turnPlayer?.clientID === props.clientID
        ? "あなたのターンです。"
        : "相手のターンです。";
    }
    return "";
  };
  const style = {
    "--backgroundColor": theme.othello.backgrounddColor,
  } as CSSProperties;
  console.log(props.turnPlayer);
  return (
    <div className={styles.header} style={style}>
      {props.status === "playing" && props.turnPlayer && (
        <Disk color={props.turnPlayer.cellColor} />
      )}
      <div className={styles.message}>{getMessage(props)}</div>
    </div>
  );
};

export const OthelloHeader = memo(OthelloHeaderComponent);
