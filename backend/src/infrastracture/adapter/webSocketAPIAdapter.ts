import {
  ApiGatewayManagementApiClient,
  GetConnectionCommand,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { Board } from "../../domain/board";
import { Player } from "../../domain/types";

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

  createUpdateProfilePayload(clientID: string, roomID: string): string {
    return JSON.stringify({
      type: "update_profile",
      data: { client_id: clientID, room_id: roomID },
    });
  }

  createSendSystemMessagePayload(message: string): string {
    return JSON.stringify({
      type: "system_message",
      data: { message: message },
    });
  }

  createStartGameMessagePayload(board: Board, players: Player[]): string {
    return JSON.stringify({
      type: "start_game",
      data: {
        board: board,
        board_id: board.boardID,
        players: players,
        current_turn_index: board.getTurnIndex(),
      },
    });
  }

  createSendBoardInfoPayload(board: Board, isEndGame: boolean): string {
    return JSON.stringify({
      type: "update_board",
      data: {
        board: board,
        is_end_game: isEndGame,
        current_turn_index: board.getTurnIndex(),
      },
    });
  }
}
