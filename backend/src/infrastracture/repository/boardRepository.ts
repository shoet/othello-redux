import { Board } from "../../domain/board";
import { BoardID } from "../../domain/types";
import { BaseDynamoDBRepository } from "./baseRepository";

export class BoardRepository extends BaseDynamoDBRepository {
  constructor(tableName: string) {
    super(tableName);
  }

  getBoard(boardID: BoardID): Promise<Board | undefined> {}
}
