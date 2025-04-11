import { describe, expect, it } from "@jest/globals";
import { Players } from "../players";
import { Player } from "../types";

describe("Players", () => {
  it("all", () => {
    const players = new Players([]);
    expect(players.addAbleToAddPlayer()).toBe(true);

    players.addPlayer({ cellColor: "black", clientID: "1" });
    expect(players.players.length).toBe(1);
    expect(players.addAbleToAddPlayer()).toBe(true);

    players.addPlayer({ cellColor: "white", clientID: "2" }, true);
    expect(players.isFull()).toBe(true);
    expect(players.players.length).toBe(2);
    expect(players.cpuPlayerID).toBe("2");
  });

  it("fromPlayers", () => {
    const player1: Player = { clientID: "1", cellColor: "black" };
    const player2: Player = { clientID: "2", cellColor: "white" };

    const players = Players.fromPlayers([player1, player2], "2");
    expect(players.players.length).toBe(2);
    expect(players.cpuPlayerID).toBe("2");
  });
});
