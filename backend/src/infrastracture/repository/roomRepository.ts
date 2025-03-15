import * as ddb from "@aws-sdk/client-dynamodb";
import { BaseDynamoDBRepository } from "./baseRepository";
import { ClientID, Connection, Player, Room, RoomID } from "../../domain/types";

export class RoomRepository extends BaseDynamoDBRepository {
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

    let playerContent = result.Item["player_content"].SS;
    if (playerContent) {
      playerContent = [...playerContent, clientID];
    } else {
      playerContent = [clientID];
    }

    const now = new Date().toTimestampInSeconds();
    const putCommand = new ddb.UpdateItemCommand({
      TableName: this.ddbTableName,
      Key: {
        room_id: { S: roomID },
      },
      AttributeUpdates: {
        player_content: {
          Action: "PUT",
          Value: { SS: playerContent },
        },
        updated_at: {
          Action: "PUT",
          Value: { N: now.toString() },
        },
      },
    });
    try {
      await this.ddbClient.send(putCommand);
    } catch (e) {
      console.error("failed to saveUserRoom", e);
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
      const roomID = item["room_id"].S;
      const roomName = item["room_name"].S;
      const clientIDs = item["client_ids"].SS;
      const boardID = item["board_id"].S;
      if (!roomID || !roomName || !clientIDs) {
        console.log("invalid room item", { item: item });
        return undefined;
      }
      const room: Room = {
        roomID: roomID,
        roomName: roomName,
        players: clientIDs.map((c): Player => {
          return { clientID: c };
        }),
        boardID: boardID,
      };
      return room;
    } catch (e) {
      console.error("failed to query table", e);
      throw e;
    }
  }
}
