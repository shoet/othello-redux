import { CellColor, ClientID, Player } from "./types";

export class Players {
  MAX_PLAYERS = 2;

  players: Player[];

  constructor(players: Player[]) {
    this.players = players;
  }

  getSelectableColor(): CellColor {
    const whitePlayer = this.players.find(
      (player) => player.cellColor === "white"
    );
    if (whitePlayer === undefined) {
      return "white";
    }
    return "black";
  }

  static fromPlayers(players: Player[]): Players {
    return new Players(players);
  }

  addAbleToAddPlayer(): boolean {
    return this.players.length < this.MAX_PLAYERS;
  }

  addPlayer(player: Player): void {
    this.players.push(player);
  }

  isFull(): boolean {
    return this.players.length === this.MAX_PLAYERS;
  }

  // playersにclientIDを持つメンバーが含まれているかを返す
  isContainMember(clientID: ClientID) {
    return this.players.find((m) => m.clientID === clientID) !== undefined;
  }
}
