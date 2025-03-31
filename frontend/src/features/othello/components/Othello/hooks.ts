import { putCellAction } from "../../othelloSlice";
import { useAppDispatch, useAppSelector } from "../../../../hook";
import { CellColor, CellPosition } from "../../othello";
import { putCell } from "../../../../services/putCell";
import { getPutable } from "../../../../services/getPutable";

export const useOthello = () => {
  const dispatch = useAppDispatch();
  const clientID = useAppSelector((state) => state.webSocketReducer.clientID);
  const roomID = useAppSelector(
    (state) => state.webSocketReducer.currentRoomID
  );
  const boardID = useAppSelector((state) => state.othelloReducer.boardID);
  const gameStatus = useAppSelector((state) => state.othelloReducer.status);
  const board = useAppSelector((state) => state.othelloReducer.board);
  const players = useAppSelector((state) => state.othelloReducer.players);
  const currentPlayerIndex = useAppSelector(
    (state) => state.othelloReducer.currentPlayerIndex
  );
  const isTurnPutted = useAppSelector(
    (state) => state.othelloReducer.isTurnPutted
  );

  const handlePutCell = async (position: CellPosition, color: CellColor) => {
    if (!boardID) {
      console.error("boardID not found");
      return;
    }
    if (!clientID) {
      console.error("clientID not found");
      return;
    }

    // 石の配置をチェック
    const putable = await getPutable(boardID, position, color);
    if (!putable) {
      console.error("cannot put cell");
      return;
    }

    // クライアントサイドで石を配置する
    if (isTurnPutted) return;

    dispatch(putCellAction({ position: position, cellColor: color }));
    // サーバーに石の配置を通知する
    await putCell(boardID, clientID, position, color);
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
