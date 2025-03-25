import { getAPIRoute, handleResult } from ".";
import { CellColor, CellPosition } from "../features/othello/othello";

export const putCell = async (
  boardID: string,
  clientID: string,
  position: CellPosition,
  cellColor: CellColor
) => {
  const url = getAPIRoute("/put_cell");

  const result = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      board_id: boardID,
      client_id: clientID,
      position: position,
      cell_color: cellColor,
    }),
  }).then(handleResult);

  return result;
};
