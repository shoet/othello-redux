import { CellColor, ClientID, Player } from "./types";

export class Players {
  MAX_PLAYERS = 2;

  private _players: Player[];
  private _cpuPlayerID: ClientID | undefined;

  constructor(players: Player[]) {
    this._players = players;
  }

  static fromPlayers(players: Player[], cpuPlayerID?: string): Players {
    const p = new Players(players);
    p._cpuPlayerID = cpuPlayerID;
    return p;
  }

  get players(): Player[] {
    return this._players;
  }

  get cpuPlayerID(): ClientID | undefined {
    return this._cpuPlayerID;
  }

  getSelectableColor(): CellColor {
    const whitePlayer = this._players.find(
      (player) => player.cellColor === "white"
    );
    if (whitePlayer === undefined) {
      return "white";
    }
    return "black";
  }

  addAbleToAddPlayer(): boolean {
    return this._players.length < this.MAX_PLAYERS;
  }

  addPlayer(player: Player, isCPU: boolean = false): void {
    this._players.push(player);
    if (isCPU) {
      this._cpuPlayerID = player.clientID;
    }
  }

  isFull(): boolean {
    return this._players.length === this.MAX_PLAYERS;
  }

  // playersにclientIDを持つメンバーが含まれているかを返す
  isContainMember(clientID: ClientID) {
    return this._players.find((m) => m.clientID === clientID) !== undefined;
  }
}
