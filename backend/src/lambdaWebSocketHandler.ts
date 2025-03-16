import { Handler, APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { z } from "zod";
import "./extensions";
import { ConnectionUsecase } from "./usecase/connection";
import { JoinRoomUsecase } from "./usecase/joinRoom";
import { WebSocketAPIAdapter } from "./infrastracture/adapter/webSocketAPIAdapter";
import { ConnectionRepository } from "./infrastracture/repository/connectionRepository";
import { RoomRepository } from "./infrastracture/repository/roomRepository";

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
  const connectionID = event.requestContext.connectionId;

  const connectionRepository = new ConnectionRepository(
    env.CONNECTION_TABLE_NAME
  );
  const usecase = new ConnectionUsecase(connectionRepository);
  const clientID = await usecase.run(connectionID);

  return {
    statusCode: 200,
    body: JSON.stringify({
      type: "init_profile",
      data: { client_id: clientID },
    }),
  };
};

type CustomEventPayload =
  | {
      type: "join_room";
      data: { room_id: string; client_id: string };
    }
  | {
      type: "chat_message";
      data: {
        room_id: string;
        client_id: string;
        message: string;
        timestamp: number;
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
  const connecitonRepository = new ConnectionRepository(
    env.CONNECTION_TABLE_NAME
  );
  const roomRepository = new RoomRepository(env.ROOM_TABLE_NAME);

  switch (type) {
    case "join_room":
      const usecase = new JoinRoomUsecase(
        websocketAdapter,
        connecitonRepository,
        roomRepository
      );
      await usecase.run(data.client_id, data.room_id);
    case "chat_message":
      break;
    default:
      console.log("unknown type", type);
  }
};
