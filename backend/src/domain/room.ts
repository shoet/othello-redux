import { BoardID, ClientID, Player, RoomID } from "./types";

export class Room {
  roomName: string;
  roomID: RoomID;
  players: Player[];
  boardID?: BoardID;
  cpuID?: ClientID;

  constructor(
    roomName: string,
    roomID: RoomID,
    players: Player[],
    boardID?: BoardID,
    cpuID?: ClientID
  ) {
    this.roomName = roomName;
    this.roomID = roomID;
    this.players = players;
    this.boardID = boardID;
    this.cpuID = cpuID;
  }

  getCPUPlayer(): Player | undefined {
    return this.players.find((player) => player.clientID === this.cpuID);
  }
}
