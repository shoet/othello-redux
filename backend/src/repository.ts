import * as ddb from "@aws-sdk/client-dynamodb";
import "./extensions";

type ClientID = string;
type ConnectionID = string;
type RoomID = string;
type Room = {
  roomID: RoomID;
  clientIDs: ClientID[];
};

class BaseDynamoDBRepository {
  protected ddbClient: ddb.DynamoDBClient;
  protected readonly ddbTableName: string;

  constructor(tableName: string) {
    this.ddbTableName = tableName;
    this.ddbClient = new ddb.DynamoDBClient({});
  }
}

export class ConnectionRepository extends BaseDynamoDBRepository {
  constructor(tableName: string) {
    super(tableName);
  }

  async saveConnection(clientID: string, connectionID: string): Promise<void> {
    const now = new Date().toTimestampInSeconds();
    const putCommand = new ddb.PutItemCommand({
      TableName: this.ddbTableName,
      Item: {
        client_id: { S: clientID },
        connection_id: { S: connectionID },
        created_at: { N: now.toString() },
        updated_at: { N: now.toString() },
        expired_at: { N: (now + 3600).toString() }, // 1時間後にレコードを削除する
      },
    });
    try {
      await this.ddbClient.send(putCommand);
    } catch (e) {
      console.error("failed to saveConnection", e);
      throw e;
    }
  }

  async getConnectionID(clientID: string): Promise<string | undefined> {
    const getCommand = new ddb.GetItemCommand({
      TableName: this.ddbTableName,
      Key: {
        client_id: { S: clientID },
      },
    });
    try {
      const result = await this.ddbClient.send(getCommand);
      if (result.Item) {
        return result.Item["connection_id"].S;
      }
      return;
    } catch (e) {
      console.error("failed to saveConnection", e);
      throw e;
    }
  }

  async deleteConnection(clientID: string): Promise<void> {
    const deleteCommand = new ddb.DeleteItemCommand({
      TableName: this.ddbTableName,
      Key: {
        client_id: { S: clientID },
      },
    });
    try {
      await this.ddbClient.send(deleteCommand);
    } catch (e) {
      console.error("failed to deleteConnection", e);
      throw e;
    }
  }
}

export class RoomRepository extends BaseDynamoDBRepository {
  constructor(tableName: string) {
    super(tableName);
  }

  async saveUserRoom(roomID: string, clientID: string): Promise<void> {
    const now = new Date().toTimestampInSeconds();
    const putCommand = new ddb.PutItemCommand({
      TableName: this.ddbTableName,
      Item: {
        room_id: { S: roomID },
        client_id: { S: clientID },
        created_at: { N: now.toString() },
        updated_at: { N: now.toString() },
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
    const queryCommand = new ddb.QueryCommand({
      TableName: this.ddbTableName,
      KeyConditionExpression: "room_id = :room_id",
      ExpressionAttributeValues: {
        ":room_id": { S: roomID },
      },
    });
    try {
      const result = await this.ddbClient.send(queryCommand);
      const clientIDs: string[] = [];
      result.Items?.forEach((item) => {
        const clientID = item["client_id"].S;
        if (clientID) {
          clientIDs.push(clientID);
        }
      });
      return { roomID, clientIDs };
    } catch (e) {
      console.error("failed to query table", e);
      throw e;
    }
  }

  async deleteFromRoom(roomID: RoomID, clientID: ClientID): Promise<void> {
    const deleteCommand = new ddb.DeleteItemCommand({
      TableName: this.ddbTableName,
      Key: {
        room_id: { S: roomID },
        client_id: { S: clientID },
      },
    });
    try {
      await this.ddbClient.send(deleteCommand);
    } catch (e) {
      console.error("failed to delete table", e);
      throw e;
    }
  }
}
