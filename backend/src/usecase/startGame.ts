import { Board } from "../domain/board";
import { Players } from "../domain/players";
import {
  BoardID,
  ClientID,
  Connection,
  Player,
  Room,
  RoomID,
} from "../domain/types";

interface IBoardRepository {
  createBoard(boardSize: number): Promise<Board>;
}
interface IRoomRepository {
  saveBoardID(roomID: RoomID, boardID: BoardID): Promise<void>;
  getRoom(roomID: RoomID): Promise<Room | undefined>;
  getRoomMembers(roomID: RoomID): Promise<Players | undefined>;
}
interface IConnectionRepository {
  getConnection(clientID: string): Promise<Connection | undefined>;
}
interface IWebSocketAPIAdapter {
  sendMessage(connectionID: string, message: string): Promise<void>;
  createStartGameMessagePayload(board: Board, players: Player[]): string;
}

// まだ入室が完了していないプレイヤーがいる場合はエラーを返す
export class MemberNotFullError extends Error {
  constructor() {
    super("players is not full");
  }
}

export class ClientIDIsNotMember extends Error {
  constructor() {
    super("players is not member");
  }
}

export class StartGameUsecase {
  private boardRepository: IBoardRepository;
  private connectionRepository: IConnectionRepository;
  private roomRepository: IRoomRepository;
  private readonly webSocketAPIAdapter: IWebSocketAPIAdapter;
  static readonly MIN_BOARD_SIZE = 4;
  static readonly MAX_BOARD_SIZE = 20;
  constructor(
    boardRepository: IBoardRepository,
    roomRepository: IRoomRepository,
    connectionRepository: IConnectionRepository,
    webSocketAPIAdapter: IWebSocketAPIAdapter
  ) {
    this.boardRepository = boardRepository;
    this.roomRepository = roomRepository;
    this.connectionRepository = connectionRepository;
    this.webSocketAPIAdapter = webSocketAPIAdapter;
  }

  async run(
    clientID: ClientID,
    roomID: RoomID,
    boardSize: number
  ): Promise<Room> {
    if (boardSize > StartGameUsecase.MAX_BOARD_SIZE) {
      boardSize = StartGameUsecase.MAX_BOARD_SIZE;
    }

    const players = await this.roomRepository.getRoomMembers(roomID);
    if (!players) {
      throw new Error("players not found");
    }
    if (!players.isFull()) {
      // 定員が満たされていない場合は無効
      throw new MemberNotFullError();
    }
    if (!players.isContainMember(clientID)) {
      // playersに含まれていない人からのStartGameは無効
      throw new ClientIDIsNotMember();
    }

    const room = await this.roomRepository.getRoom(roomID);
    if (!room) {
      throw new Error("room not found");
    }

    if (!room.boardID) {
      // ボードを用意する
      const board = await this.boardRepository.createBoard(boardSize);
      // ボードにルームを紐づける
      await this.roomRepository.saveBoardID(roomID, board.boardID);
      // ボードの最新情報を取得
      const room = await this.roomRepository.getRoom(roomID);
      if (!room) {
        throw new Error("room not found");
      }
      // ゲーム開始を通知する
      const payload = this.webSocketAPIAdapter.createStartGameMessagePayload(
        board,
        room.players
      );
      await Promise.all(
        room.players.map(async (p) => {
          const connection = await this.connectionRepository.getConnection(
            p.clientID
          );
          if (connection) {
            await this.webSocketAPIAdapter.sendMessage(
              connection.connectionID,
              payload
            );
          } else {
            console.error("connection not found", { clientID });
          }
        })
      );

      return room;
    }
    // ゲーム開始済みの場合は何もしない
    // boardIDが紐づいていることはゲーム開始済みとする
    return room;
  }
}
