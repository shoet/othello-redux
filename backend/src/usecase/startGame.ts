import { Board } from "../domain/board";
import { BoardID, Room, RoomID } from "../domain/types";

interface IBoardRepository {
  createBoard(boardSize: number): Promise<Board>;
}
interface IRoomRepository {
  saveBoardID(roomID: RoomID, boardID: BoardID): Promise<void>;
  getRoom(roomID: RoomID): Promise<Room | undefined>;
}

export class StartGameUsecase {
  private boardRepository: IBoardRepository;
  private roomRepository: IRoomRepository;
  constructor(
    boardRepository: IBoardRepository,
    roomRepository: IRoomRepository
  ) {
    this.boardRepository = boardRepository;
    this.roomRepository = roomRepository;
  }

  async run(roomID: RoomID, boardSize: number): Promise<Room> {
    // ボードを用意する
    const board = await this.boardRepository.createBoard(boardSize);

    // ボードにルームを紐づける
    await this.roomRepository.saveBoardID(roomID, board.boardID);

    const room = await this.roomRepository.getRoom(roomID);
    if (!room) {
      throw new Error("room not found");
    }

    return room;
  }
}
