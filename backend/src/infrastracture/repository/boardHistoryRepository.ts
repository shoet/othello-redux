import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { BaseDynamoDBRepository } from "./baseRepository";
import { BoardID, CellColor, ClientID } from "../../domain/types";

export class BoardHistoryRepository extends BaseDynamoDBRepository {
  constructor(tableName: string) {
    super(tableName);
  }

  async createHistory(
    boardID: BoardID,
    timestamp: number,
    clientID: ClientID,
    positionX: number,
    positionY: number,
    color: CellColor
  ) {
    const putCommand = new PutItemCommand({
      TableName: this.ddbTableName,
      Item: {
        board_id: { S: boardID },
        timestamp: { N: timestamp.toString() },
        client_id: { S: clientID },
        position_x: { N: positionX.toString() },
        position_y: { N: positionY.toString() },
        color: { S: color },
      },
    });

    try {
      await this.ddbClient.send(putCommand);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to create history");
    }
  }
}
