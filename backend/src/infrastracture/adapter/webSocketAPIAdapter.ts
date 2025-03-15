import {
  ApiGatewayManagementApiClient,
  GetConnectionCommand,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { ClientID, ConnectionID, RoomID } from "../../domain/types";

export class WebSocketAPIAdapter {
  private readonly callbackURL: string;
  private readonly client: ApiGatewayManagementApiClient;

  constructor(callbackURL: string) {
    this.callbackURL = callbackURL;
    this.client = new ApiGatewayManagementApiClient({
      endpoint: this.callbackURL,
    });
  }

  async sendMessage(connectionID: string, message: string): Promise<void> {
    try {
      const getConnectionCommand = new GetConnectionCommand({
        ConnectionId: connectionID,
      });
      await this.client.send(getConnectionCommand);
    } catch (e) {
      if (e instanceof Error) {
        console.error("failed to get connection", e);
      } else {
        console.error("failed to get connection. occurred unknown error", e);
      }
      throw e;
    }

    try {
      const command = new PostToConnectionCommand({
        ConnectionId: connectionID,
        Data: message,
      });
      await this.client.send(command);
    } catch (e) {
      if (e instanceof Error) {
        console.error("failed to sendMessage", e);
      } else {
        console.error("failed to sendMessage. occurred unknown error", e);
      }
      throw e;
    }
  }

  async updateProfile(
    connectionID: ConnectionID,
    profile: { clientID?: ClientID; roomID?: RoomID }
  ): Promise<void> {}

  async sendSystemMessage(
    connectionID: ConnectionID,
    message: string
  ): Promise<void> {}
}
