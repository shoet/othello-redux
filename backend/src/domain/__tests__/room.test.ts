import { describe, expect, it } from "@jest/globals";
import { Players } from "../players";
import { Player } from "../types";
import { Room } from "../room";

describe("Room", () => {
  it("all", () => {
    const player: Player = { clientID: "1", cellColor: "black" };
    const cpuPlayer: Player = { clientID: "2", cellColor: "white" };
    const players = Players.fromPlayers([player, cpuPlayer], "2");

    const roomName = "roomName";
    const roomID = "room1";
    const boardID = "board1";
    const cpuPlayerID = "2";

    const room = new Room(
      roomName,
      roomID,
      players.players,
      boardID,
      cpuPlayerID
    );
    expect(room.getCPUPlayer()).toEqual(cpuPlayer);
  });
});
