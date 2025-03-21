import { Handler, APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { z } from "zod";
import "./extensions";
import { ConnectionUsecase } from "./usecase/connection";
import { JoinRoomUsecase } from "./usecase/joinRoom";
import { WebSocketAPIAdapter } from "./infrastracture/adapter/webSocketAPIAdapter";
import { ConnectionRepository } from "./infrastracture/repository/connectionRepository";
import { RoomRepository } from "./infrastracture/repository/roomRepository";
import { StartGameUsecase } from "./usecase/startGame";
import { BoardRepository } from "./infrastracture/repository/boardRepository";
import { OperationPutCellUsecase } from "./usecase/operationPutCell";
import { BoardHistoryRepository } from "./infrastracture/repository/boardHistoryRepository";
import { CellColor } from "./domain/types";

var environment = z.object({
  CONNECTION_TABLE_NAME: z.string().min(1),
  ROOM_TABLE_NAME: z.string().min(1),
  BOARD_TABLE_NAME: z.string().min(1),
  BOARD_HISTORY_TABLE_NAME: z.string().min(1),
  CALLBACK_URL: z.string().min(1),
});

type Environment = z.infer<typeof environment>;

function loadEnvironment(): Environment {
  const env = environment.safeParse(process.env);
  if (!env.success) {
    console.error(env.error.errors);
    throw new Error("failed to load environment.");
  }
  return env.data;
}

const env = loadEnvironment();

export const connectionHandler: Handler = async (
  event: APIGatewayProxyWebsocketEventV2
) => {
  const routeKey = event.requestContext.routeKey;
  const connectionID = event.requestContext.connectionId;

  const connectionRepository = new ConnectionRepository(
    env.CONNECTION_TABLE_NAME
  );

  switch (routeKey) {
    case "$connect":
    case "$default": // connect時にdefaultにも飛んできてしまうので暫定対応
      try {
        const usecase = new ConnectionUsecase(connectionRepository);
        const clientID = await usecase.run(connectionID);
        console.log("clientID", clientID);
        return {
          statusCode: 200,
          body: JSON.stringify({
            type: "init_profile",
            data: { client_id: clientID },
          }),
        };
      } catch (e) {
        console.error("failed to connect", e);
        return {
          statusCode: 500,
          body: "failed to connect",
        };
      }
    case "$disconnect":
      break;
  }
};

type CustomEventPayload =
  | {
      type: "chat_message";
      data: {
        room_id: string;
        client_id: string;
        message: string;
        timestamp: number;
      };
    }
  | {
      type: "start_game";
      data: {
        room_id: string;
        board_size: number;
      };
    }
  | {
      type: "operation_put";
      data: {
        board_id: string;
        client_id: string;
        position: { x: number; y: number };
        cellColor: CellColor;
      };
    };

export const customEventHandler: Handler = async (
  event: APIGatewayProxyWebsocketEventV2
) => {
  if (!event.body) {
    return;
  }
  const { message } = JSON.parse(event.body);
  const { type, data }: CustomEventPayload = JSON.parse(message);
  const websocketAdapter = new WebSocketAPIAdapter(env.CALLBACK_URL);
  const connectionRepository = new ConnectionRepository(
    env.CONNECTION_TABLE_NAME
  );
  const boardRepository = new BoardRepository(env.BOARD_TABLE_NAME);
  const roomRepository = new RoomRepository(env.ROOM_TABLE_NAME);
  const boardHistoryRepository = new BoardHistoryRepository(
    env.BOARD_HISTORY_TABLE_NAME
  );

  switch (type) {
    case "start_game":
      const startGameUsecase = new StartGameUsecase(
        boardRepository,
        roomRepository
      );
      await startGameUsecase.run(data.room_id, data.board_size);
      break;
    case "operation_put":
      const operationPutCellUsecase = new OperationPutCellUsecase(
        boardRepository,
        boardHistoryRepository,
        roomRepository,
        connectionRepository,
        websocketAdapter
      );
      await operationPutCellUsecase.run(
        data.board_id,
        data.client_id,
        data.position,
        data.cellColor
      );
      break;
    case "chat_message":
      break;
    default:
      console.log("unknown type", type);
  }
};
