import { Board } from "../domain/board";
import { BoardID, CellColor, Position } from "../domain/types";

interface IBoardRepository {
  getBoard(boardID: BoardID): Promise<Board | undefined>;
  updateBoard(board: Board): Promise<void>;
}

export class GetPutableUsecase {
  private boardRepository: IBoardRepository;

  constructor(boardRepository: IBoardRepository) {
    this.boardRepository = boardRepository;
  }

  async run(
    boardID: BoardID,
    position: Position,
    color: CellColor
  ): Promise<boolean> {
    const board = await this.boardRepository.getBoard(boardID);
    if (!board) {
      throw new Error("board not found");
    }

    return board.isPutableCell(position, color);
  }
}
