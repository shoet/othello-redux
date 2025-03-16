import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Board } from "../../domain/board";
import { BoardID } from "../../domain/types";
import { BaseDynamoDBRepository } from "./baseRepository";

export class BoardRepository extends BaseDynamoDBRepository {
  constructor(tableName: string) {
    super(tableName);
  }

  async getBoard(boardID: BoardID): Promise<Board | undefined> {
    const getCommand = new GetItemCommand({
      TableName: this.ddbTableName,
      Key: {
        board_id: {
          S: boardID,
        },
      },
    });
    try {
      const result = await this.ddbClient.send(getCommand);
      const item = result.Item;
      if (!item) return undefined;
      const boardID = item["board_id"].S;
      const boardSize = Number(item["board_size"].N);
      const data = item["data"].S;
      if (!boardID || isNaN(boardSize) || !data) {
        console.log("invalid board", { item });
        return undefined;
      }
      return Board.fromJSON(boardID, boardSize, data);
    } catch (e) {
      console.error("failed to getBoard", e);
      throw e;
    }
  }

  async createBoard(boardSize: number): Promise<Board> {
    const boardID = crypto.randomUUID();
    const board = Board.fromEmpty(boardID, boardSize);
    const boardDTO = board.toDTO();
    const putCommand = new PutItemCommand({
      TableName: this.ddbTableName,
      Item: {
        board_id: { S: boardDTO.boardID },
        board_size: { N: boardDTO.boardSize.toString() },
        data: { S: boardDTO.data },
      },
    });
    try {
      await this.ddbClient.send(putCommand);
      return board;
    } catch (e) {
      console.error("failed to createBoard", e);
      throw e;
    }
  }
}
