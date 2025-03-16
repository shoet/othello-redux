import { Board } from "../domain/board";
import { BoardID, CellColor, Position, RoomID } from "../domain/types";

interface IBoardRepository {
  getBoard(boardID: BoardID): Promise<Board | undefined>;
  updateBoard(board: Board): Promise<void>;
}
// interface IBoardHistoryRepository {}

export class OperationPutCellUsecase {
  private boardRepository: IBoardRepository;
  // private boardHistoryRepository: IBoardHistoryRepository;

  constructor(
    boardRepository: IBoardRepository
    // boardHistoryRepository: IBoardHistoryRepository
  ) {
    this.boardRepository = boardRepository;
    // this.boardHistoryRepository = boardHistoryRepository;
  }

  async run(
    boardID: BoardID,
    position: Position,
    cellColor: CellColor
  ): Promise<{ board: Board; endGame: boolean }> {
    // 石の配置
    const board = await this.boardRepository.getBoard(boardID);
    if (!board) {
      throw new Error("board not found");
    }
    board.putCell(position, cellColor);
    await this.boardRepository.updateBoard(board);

    // 履歴の保存 TODO

    // 勝ち負け判定
    if (board.isEndGame()) {
      return { board: board, endGame: true };
    }

    // ルームに通知 TODO

    // ボード状況を返す
    return { board: board, endGame: false };
  }
}
