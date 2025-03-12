import { Player, Result } from "../../othelloSlice";

type Props = {
  currentPlayer: Player;
  result?: Result;
};

const ScoreDisplay = ({ result }: { result: Result }) => {
  const playerA = result.score[0];
  const playerB = result.score[1];
  return (
    <div>
      <div>
        <span>{playerA.color}/</span>
        <span>{playerA.player.name} さん/</span>
        <span>{playerA.count} point</span>
      </div>
      <div>
        <span>{playerB.color}/</span>
        <span>{playerB.player.name} さん/</span>
        <span>{playerB.count}point</span>
      </div>
    </div>
  );
};

export const StatusBar = (props: Props) => {
  const { result } = props;
  return (
    <div>
      {result == undefined ? (
        <div>
          <span>{props.currentPlayer.cellColor}: </span>
          <span>{props.currentPlayer.name}さんのターン</span>
        </div>
      ) : (
        <div>
          <div>試合終了！</div>
          <ScoreDisplay result={result} />
        </div>
      )}
    </div>
  );
};
