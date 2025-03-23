import { getAPIRoute, handleResult } from ".";

export const startGame = async (
  clientID: string,
  roomID: string,
  boardSize: number
) => {
  const url = getAPIRoute("/start_game");

  const result = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientID,
      room_id: roomID,
      board_size: boardSize,
    }),
  }).then(handleResult);

  return result;
};
