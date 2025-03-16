import { Board } from "../domain/board";
import { Players } from "../domain/players";
import { BoardID, Room, RoomID } from "../domain/types";

interface IBoardRepository {
  createBoard(boardSize: number): Promise<Board>;
}
interface IRoomRepository {
  saveBoardID(roomID: RoomID, boardID: BoardID): Promise<void>;
  getRoom(roomID: RoomID): Promise<Room | undefined>;
  getRoomMembers(roomID: RoomID): Promise<Players | undefined>;
}

// まだ入室が完了していないプレイヤーがいる場合はエラーを返す
export class MemberNotFullError extends Error {
  constructor() {
    super("players is not full");
  }
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

    // 定員が満たされていない場合はエラーを返す
    const players = await this.roomRepository.getRoomMembers(roomID);
    if (!players) {
      throw new Error("players not found");
    }
    if (!players.isFull()) {
      throw new MemberNotFullError();
    }

    // ボードにルームを紐づける
    await this.roomRepository.saveBoardID(roomID, board.boardID);

    const room = await this.roomRepository.getRoom(roomID);
    if (!room) {
      throw new Error("room not found");
    }

    return room;
  }
}
