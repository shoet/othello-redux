import * as ddb from "@aws-sdk/client-dynamodb";
import { BaseDynamoDBRepository } from "./baseRepository";
import {
  BoardID,
  CellColor,
  ClientID,
  Player,
  Room,
  RoomID,
} from "../../domain/types";
import { RepositoryError } from "./errors";
import { Players } from "../../domain/players";

/**
 * AlreadyCapacityRoomException はルームが満室だった場合のエラー
 */
export class AlreadyCapacityRoomException extends RepositoryError {
  constructor() {
    super("already capacity room");
  }
}

/**
 * AlreadySetBoardException はボードがすでに設定されていた場合のエラー
 */
export class AlreadySetBoardException extends RepositoryError {
  constructor() {
    super("already set board");
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

  parsePlayersFromListAV(players: ddb.AttributeValue): Player[] {
    const values = players.L;
    if (!values) return [];
    return values
      .map((v) => {
        if (v.S) {
          const parsed = JSON.parse(v.S);
          const { client_id, cell_color } = parsed;
          if (cell_color !== "white" && cell_color !== "black") {
            throw new Error("invalid cell color");
          }
          return { clientID: client_id, cellColor: cell_color };
        }
      })
      .filter(
        (value): value is Exclude<typeof value, undefined> =>
          value !== undefined
      );
  }

  playersToAV(players: Player[]): ddb.AttributeValue {
    return {
      L: players.map((p) => {
        return {
          S: JSON.stringify({
            client_id: p.clientID,
            cell_color: p.cellColor,
          }),
        };
      }),
    };
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

    const playersAV = result.Item["players"];
    let playerList: Player[] = [];
    if (playersAV) {
      playerList = this.parsePlayersFromListAV(playersAV);
    }
    const players = Players.fromPlayers(playerList);
    if (players.addAbleToAddPlayer()) {
      const cellColor = players.getSelectableColor();
      players.addPlayer({ clientID: clientID, cellColor: cellColor });
    } else {
      throw new AlreadyCapacityRoomException();
    }

    const now = new Date().toTimestampInSeconds();
    const putCommand = new ddb.UpdateItemCommand({
      TableName: this.ddbTableName,
      Key: {
        room_id: { S: roomID },
      },
      UpdateExpression: "SET players = :players, updated_at = :updated_at",
      ExpressionAttributeValues: {
        ":players": this.playersToAV(players.players),
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
      // すでにボードがある場合は上書きしない
      ConditionExpression: "attribute_not_exists(board_id)",
    });
    try {
      await this.ddbClient.send(putCommand);
    } catch (e) {
      if (e instanceof ddb.ConditionalCheckFailedException) {
        throw new AlreadySetBoardException();
      }
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
      const players = item["players"]?.L;
      const boardID = item["board_id"]?.S;
      if (!roomID || !roomName || !players) {
        console.log("invalid room item", { item: item });
        return undefined;
      }
      const playersValue = this.parsePlayersFromListAV({ L: players });

      const room: Room = {
        roomID: roomID,
        roomName: roomName,
        players: playersValue,
        boardID: boardID,
      };
      return room;
    } catch (e) {
      console.error("failed to query table", e);
      throw e;
    }
  }

  async getByBoardID(boardID: BoardID): Promise<Room | undefined> {
    const getCommand = new ddb.QueryCommand({
      TableName: this.ddbTableName,
      IndexName: "board_id",
      KeyConditionExpression: "board_id = :board_id",
      ExpressionAttributeValues: {
        ":board_id": { S: boardID },
      },
    });
    try {
      const result = await this.ddbClient.send(getCommand);
      if (!result.Items) return undefined;
      const item = result.Items[0];
      if (!item) return undefined;
      const roomID = item["room_id"]?.S;
      const roomName = item["room_name"]?.S;
      const players = item["players"]?.L;
      const boardID = item["board_id"]?.S;
      if (!roomID || !roomName || !players) {
        console.log("invalid room item", { item: item });
        return undefined;
      }
      const playersValue = this.parsePlayersFromListAV({ L: players });

      const room: Room = {
        roomID: roomID,
        roomName: roomName,
        players: playersValue,
        boardID: boardID,
      };
      return room;
    } catch (e) {
      console.error("failed to query table", e);
      throw e;
    }
  }

  async getRoomMembers(roomID: RoomID): Promise<Players | undefined> {
    const getItemCommand = new ddb.GetItemCommand({
      TableName: this.ddbTableName,
      Key: {
        room_id: { S: roomID },
      },
      ProjectionExpression: "players",
    });
    try {
      const result = await this.ddbClient.send(getItemCommand);
      const item = result.Item;
      if (!item) return undefined;
      const players = item["players"]?.L;
      if (!players) {
        console.log("invalid room item", { item: item });
        return undefined;
      }
      const playersValue = this.parsePlayersFromListAV({ L: players });
      return Players.fromPlayers(playersValue);
    } catch (e) {
      console.error("failed to query table", e);
      throw e;
    }
  }
}
