import { Board } from "../domain/board";
import {
  BoardID,
  CellColor,
  ClientID,
  Connection,
  Position,
  Room,
} from "../domain/types";

interface IBoardRepository {
  getBoard(boardID: BoardID): Promise<Board | undefined>;
  updateBoard(board: Board): Promise<void>;
}

interface IRoomRepository {
  getByBoardID(boardID: BoardID): Promise<Room | undefined>;
}

interface IConnectionRepository {
  getConnection(clientID: ClientID): Promise<Connection | undefined>;
}

interface WebSocketAPIAdapter {
  createSendBoardInfoPayload(board: Board, isEndGame: boolean): string;
  sendMessage(connectionID: string, message: string): Promise<void>;
}

interface IBoardHistoryRepository {
  createHistory(
    boardID: BoardID,
    timestamp: number,
    clientID: ClientID,
    positionX: number,
    positionY: number,
    color: CellColor
  ): Promise<void>;
}

export class OperationPutCellUsecase {
  private boardRepository: IBoardRepository;
  private boardHistoryRepository: IBoardHistoryRepository;
  private roomRepository: IRoomRepository;
  private connectionRepository: IConnectionRepository;
  private webSocketAPIAdapter: WebSocketAPIAdapter;

  constructor(
    boardRepository: IBoardRepository,
    boardHistoryRepository: IBoardHistoryRepository,
    roomRepository: IRoomRepository,
    connectionRepository: IConnectionRepository,
    webSocketAPIAdapter: WebSocketAPIAdapter
  ) {
    this.boardRepository = boardRepository;
    this.boardHistoryRepository = boardHistoryRepository;
    this.roomRepository = roomRepository;
    this.connectionRepository = connectionRepository;
    this.webSocketAPIAdapter = webSocketAPIAdapter;
  }

  async run(
    boardID: BoardID,
    clientID: ClientID,
    position: Position,
    cellColor: CellColor
  ): Promise<void> {
    const board = await this.boardRepository.getBoard(boardID);
    if (!board) {
      throw new Error("board not found");
    }

    const room = await this.roomRepository.getByBoardID(boardID);
    if (!room) {
      throw new Error("room not found");
    }

    // 石の配置
    board.putCell(position, cellColor);
    // ターンの切り替え
    board.turnNext();
    // ボードの更新
    await this.boardRepository.updateBoard(board);
    // 履歴の保存
    await this.boardHistoryRepository.createHistory(
      boardID,
      Date.now(),
      clientID,
      position.x,
      position.y,
      cellColor
    );

    let isEndgame = board.isEndGame();

    // 次ターンのプレイヤーが石を置けない場合はスキップ
    let nextPlayer = room.players[board.getTurnIndex()];
    let isSkip = board.isSkip(nextPlayer.cellColor);
    if (isSkip) {
      // スキップ
      board.turnNext();
      // その次ターンのプレイヤーも石を置けない場合はゲーム終了
      nextPlayer = room.players[board.getTurnIndex()];
      isSkip = board.isSkip(nextPlayer.cellColor);
      if (isSkip) {
        isEndgame = true;
      }
    }

    // ルームにボード情報と勝ち負け判定を通知
    const payload = this.webSocketAPIAdapter.createSendBoardInfoPayload(
      board,
      isEndgame
    );
    await Promise.all(
      room?.players.map(async (p) => {
        const conn = await this.connectionRepository.getConnection(p.clientID);
        if (!conn) {
          console.error("connection not found", p.clientID);
          return Promise.resolve();
        }
        await this.webSocketAPIAdapter.sendMessage(conn.connectionID, payload);
      }) || []
    );
  }
}
