import { CellColor, CellPosition } from "../../features/othello/othelloSlice";
import {
  putCellAction,
  termAction,
  reverseCellAction,
  calcScoreAction,
} from "../../features/othello/othelloSlice";
import { useAppDispatch, useAppSelector } from "../../hook";

export const useOthello = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((store) => store.othelloReducer);

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

  return { state, handlePutCell };
};
