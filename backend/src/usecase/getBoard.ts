import { Board } from "../domain/board";
import { BoardID } from "../domain/types";

interface IBoardRepository {
  getBoard(boardID: BoardID): Promise<Board | undefined>;
}

export class GetBoardUsecase {
  private boardRepository: IBoardRepository;

  constructor(boardRepository: IBoardRepository) {
    this.boardRepository = boardRepository;
  }

  async run(boardID: BoardID) {
    const board = await this.boardRepository.getBoard(boardID);
    return board;
  }
}
