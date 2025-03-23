import {
  putCellAction,
  termAction,
  reverseCellAction,
  calcScoreAction,
} from "../../othelloSlice";
import { useAppDispatch, useAppSelector } from "../../../../hook";
import { CellColor, CellPosition } from "../../othello";

export const useOthello = () => {
  const dispatch = useAppDispatch();
  const clientID = useAppSelector((state) => state.webSocketReducer.clientID);
  const roomID = useAppSelector(
    (state) => state.webSocketReducer.currentRoomID
  );
  const gameStatus = useAppSelector((state) => state.othelloReducer.status);
  const board = useAppSelector((state) => state.othelloReducer.board);
  const players = useAppSelector((state) => state.othelloReducer.players);
  const currentPlayerIndex = useAppSelector(
    (state) => state.othelloReducer.currentPlayerIndex
  );

  const handlePutCell = (position: CellPosition, color: CellColor): void => {
    // 石を配置する
    dispatch(putCellAction({ position: position, cellColor: color }));
    // 石を裏返す
    dispatch(reverseCellAction({ putedPosition: position, putedColor: color }));
    // スコアを計算する
    dispatch(calcScoreAction());
    // ターンを交代する
    dispatch(termAction());
  };

  return {
    clientID,
    roomID,
    gameStatus,
    board,
    players,
    currentPlayerIndex,
    handlePutCell,
  };
};
