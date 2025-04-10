import { BoardID, CellColor, ClientID } from "./types";

export class BoardHistory {
  boardID: BoardID;
  timestamp: number;
  clientID: ClientID;
  positionX: number;
  positionY: number;
  color: CellColor;

  constructor(
    boardID: BoardID,
    timestamp: number,
    clientID: ClientID,
    positionX: number,
    positionY: number,
    color: CellColor
  ) {
    this.boardID = boardID;
    this.timestamp = timestamp;
    this.clientID = clientID;
    this.positionX = positionX;
    this.positionY = positionY;
    this.color = color;
  }

  static fromAny(args: any) {
    if (
      args.boardID === undefined ||
      args.timestamp === undefined ||
      args.clientID === undefined ||
      args.positionX === undefined ||
      args.positionY === undefined ||
      args.color === undefined
    ) {
      console.error("Invalid arguments", args);
      throw new Error("Invalid arguments");
    }
    return new BoardHistory(
      args.boardID,
      args.timestamp,
      args.clientID,
      args.positionX,
      args.positionY,
      args.color
    );
  }
}
