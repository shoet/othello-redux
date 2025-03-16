export type ClientID = string;

export type ConnectionID = string;

export type Connection = { clientID: ClientID; connectionID: ConnectionID };

export type Player = {
  clientID: ClientID;
  cellColor: CellColor;
};

export type RoomID = string;

export type RoomDTO = {
  roomName: string;
  roomID: RoomID;
  clientIDs: ClientID[];
  boardID?: BoardID;
};

export type Room = {
  roomName: string;
  roomID: RoomID;
  players: Player[];
  boardID?: BoardID;
};

export type BoardID = string;
export type BoardDTO = {
  boardID: BoardID;
  boardSize: number;
  data: string;
};

export type CellColor = "white" | "black";
export type Position = { x: number; y: number };
export type Cell = {
  position: Position;
  cellColor: CellColor | null;
};

export type Result = {
  score: { color: CellColor; count: number; player: Player }[];
};
