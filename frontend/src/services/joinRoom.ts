import { getAPIRoute, handleResult } from ".";

type JoinRoomResponse = {
  room_id: string;
};

export const joinRoom = async (clientID: string, roomID: string) => {
  const url = getAPIRoute("/join_room");

  const result: JoinRoomResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientID,
      room_id: roomID,
    }),
  }).then(handleResult);

  return { roomID: result.room_id };
};
