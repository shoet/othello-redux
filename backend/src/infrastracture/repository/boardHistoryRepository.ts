import { PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { BaseDynamoDBRepository } from "./baseRepository";
import { BoardID, CellColor, ClientID } from "../../domain/types";
import { BoardHistory } from "../../domain/boardHistory";

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

  async getHistory(boardID: BoardID): Promise<BoardHistory[]> {
    const queryCommand = new QueryCommand({
      TableName: this.ddbTableName,
      KeyConditionExpression: "board_id = :board_id",
      ExpressionAttributeValues: {
        ":board_id": { S: boardID },
      },
    });
    try {
      const result = await this.ddbClient.send(queryCommand);
      const items = result.Items;
      if (!items) return [];
      return items
        .map((item) => {
          return BoardHistory.fromAny({
            boardID: item["board_id"].S,
            timestamp: Number(item["timestamp"].N),
            clientID: item["client_id"].S,
            positionX: Number(item["position_x"].N),
            positionY: Number(item["position_y"].N),
            color: item["color"].S,
          });
        })
        .sort((a, b) => a.timestamp - b.timestamp);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to get history");
    }
  }
}
