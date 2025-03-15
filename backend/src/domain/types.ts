export type ClientID = string;

export type ConnectionID = string;
export type Connection = { clientID: ClientID; connectionID: ConnectionID };

export type RoomID = string;
export type Room = {
  roomID: RoomID;
  connections: Connection[];
};

export type BoardID = string;
export type BoardDTO = {
  boardID: BoardID;
  roomID: RoomID;
  boardSize: number;
  data: string;
};

export type CellColor = "white" | "black";
export type Position = { x: number; y: number };
export type Cell = {
  position: Position;
  cellColor: CellColor | null;
};
