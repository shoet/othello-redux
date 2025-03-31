import { getAPIRoute, handleResult } from ".";
import { CellColor, CellPosition } from "../features/othello/othello";

type GetPutableResponse = {
  putable: boolean;
};

export const getPutable = async (
  boardID: string,
  position: CellPosition,
  cellColor: CellColor
) => {
  const url = getAPIRoute("/get_putable");

  const result: GetPutableResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      board_id: boardID,
      position: position,
      cell_color: cellColor,
    }),
  }).then(handleResult);

  return result.putable;
};
