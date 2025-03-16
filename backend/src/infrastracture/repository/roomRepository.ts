import * as ddb from "@aws-sdk/client-dynamodb";
import { BaseDynamoDBRepository } from "./baseRepository";
import { BoardID, ClientID, Player, Room, RoomID } from "../../domain/types";
import { RepositoryError } from "./errors";

/**
 * AlreadyCapacityRoomException はルームが満室だった場合のエラー
 */
export class AlreadyCapacityRoomException extends RepositoryError {
  constructor() {
    super("already capacity room");
  }
}

export class RoomRepository extends BaseDynamoDBRepository {
  MAX_ROOM_CAPACITY: number = 2;
  constructor(tableName: string) {
    super(tableName);
  }

  async isExistRoom(roomID: string): Promise<boolean> {
    const getCommand = new ddb.GetItemCommand({
      TableName: this.ddbTableName,
      Key: {
        room_id: { S: roomID },
      },
    });
    try {
      const result = await this.ddbClient.send(getCommand);
      return result.Item !== undefined;
    } catch (e) {
      console.error("failed to isExistRoom", e);
      throw e;
    }
  }

  async createRoom(roomID: string, roomName: string): Promise<void> {
    const now = new Date().toTimestampInSeconds();
    const putCommand = new ddb.PutItemCommand({
      TableName: this.ddbTableName,
      Item: {
        room_id: { S: roomID },
        room_name: { S: roomName },
        created_at: { N: now.toString() },
        updated_at: { N: now.toString() },
      },
    });
    try {
      await this.ddbClient.send(putCommand);
    } catch (e) {
      console.error("failed to createRoom", e);
      throw e;
    }
  }

  async saveUserRoom(roomID: string, clientID: ClientID): Promise<void> {
    const getItemCommand = new ddb.GetItemCommand({
      TableName: this.ddbTableName,
      Key: {
        room_id: { S: roomID },
      },
    });
    const result = await this.ddbClient.send(getItemCommand);
    if (!result.Item) throw new Error("room not found");

    let clientIDs: ClientID[] = [];
    result.Item["client_ids"]?.L?.forEach((c) => {
      if (c.S) clientIDs.push(c.S);
    });
    clientIDs.push(clientID);

    if (clientIDs.length > this.MAX_ROOM_CAPACITY) {
      throw new AlreadyCapacityRoomException();
    }

    const now = new Date().toTimestampInSeconds();
    const putCommand = new ddb.UpdateItemCommand({
      TableName: this.ddbTableName,
      Key: {
        room_id: { S: roomID },
      },
      UpdateExpression:
        "SET client_ids = :client_ids, updated_at = :updated_at",
      ExpressionAttributeValues: {
        ":client_ids": {
          L: clientIDs.map((c) => {
            return { S: c };
          }),
        },
        ":updated_at": { N: now.toString() },
      },
    });
    try {
      await this.ddbClient.send(putCommand);
    } catch (e) {
      console.error("failed to saveUserRoom", e);
      throw e;
    }
  }

  async saveBoardID(roomID: RoomID, boardID: BoardID): Promise<void> {
    const putCommand = new ddb.UpdateItemCommand({
      TableName: this.ddbTableName,
      Key: {
        room_id: { S: roomID },
      },
      UpdateExpression: "SET board_id = :board_id",
      ExpressionAttributeValues: {
        ":board_id": {
          S: boardID,
        },
      },
    });
    try {
      await this.ddbClient.send(putCommand);
    } catch (e) {
      console.error("failed to saveBoardID", e);
      throw e;
    }
  }

  async getRoom(roomID: RoomID): Promise<Room | undefined> {
    const getItemCommand = new ddb.GetItemCommand({
      TableName: this.ddbTableName,
      Key: {
        room_id: { S: roomID },
      },
    });
    try {
      const result = await this.ddbClient.send(getItemCommand);
      const item = result.Item;
      if (!item) return undefined;
      const roomID = item["room_id"]?.S;
      const roomName = item["room_name"]?.S;
      const clientIDs = item["client_ids"]?.L;
      const boardID = item["board_id"]?.S;
      if (!roomID || !roomName || !clientIDs) {
        console.log("invalid room item", { item: item });
        return undefined;
      }
      const room: Room = {
        roomID: roomID,
        roomName: roomName,
        players: clientIDs
          .map((a): Player | undefined => {
            if (a.S) return { clientID: a.S };
          })
          .filter(
            (value): value is Exclude<typeof value, undefined> =>
              value !== undefined
          ),
        boardID: boardID,
      };
      return room;
    } catch (e) {
      console.error("failed to query table", e);
      throw e;
    }
  }
}
