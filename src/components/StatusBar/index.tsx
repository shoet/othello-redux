import { Player } from "../../features/othello/othelloSlice";

type Props = {
  currentPlayer: Player;
};

export const StatusBar = (props: Props) => {
  return (
    <div>
      <span>{props.currentPlayer.cellColor}: </span>
      <span>{props.currentPlayer.name}さんのターン</span>
    </div>
  );
};
