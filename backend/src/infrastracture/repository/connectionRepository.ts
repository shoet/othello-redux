import * as ddb from "@aws-sdk/client-dynamodb";
import { BaseDynamoDBRepository } from "./baseRepository";
import { ClientID, Connection } from "../../domain/types";

export class ConnectionRepository extends BaseDynamoDBRepository {
  constructor(tableName: string) {
    super(tableName);
  }

  async saveConnection(connection: Connection): Promise<void> {
    const now = new Date().toTimestampInSeconds();
    const putCommand = new ddb.PutItemCommand({
      TableName: this.ddbTableName,
      Item: {
        client_id: { S: connection.clientID },
        connection_id: { S: connection.connectionID },
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

  async getConnection(clientID: ClientID): Promise<Connection | undefined> {
    const getCommand = new ddb.GetItemCommand({
      TableName: this.ddbTableName,
      Key: {
        client_id: { S: clientID },
      },
    });
    try {
      const result = await this.ddbClient.send(getCommand);
      if (result.Item && result.Item["connection_id"].S) {
        return { clientID, connectionID: result.Item["connection_id"].S };
      }
      return;
    } catch (e) {
      console.error("failed to saveConnection", e);
      throw e;
    }
  }

  async getConnectionID(clientID: ClientID): Promise<ClientID | undefined> {
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

  async deleteConnection(clientID: ClientID): Promise<void> {
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
