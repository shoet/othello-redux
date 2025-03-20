import { Hono } from "hono";
import { GetBoardUsecase } from "./usecase/getBoard";
import { WebSocketAPIAdapter } from "./infrastracture/adapter/webSocketAPIAdapter";
import { z } from "zod";
import { ConnectionRepository } from "./infrastracture/repository/connectionRepository";
import { RoomRepository } from "./infrastracture/repository/roomRepository";
import { JoinRoomUsecase } from "./usecase/joinRoom";
import { BoardRepository } from "./infrastracture/repository/boardRepository";
import { cors } from "hono/cors";

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

export const app = new Hono();

app.use(cors({ origin: "*" }));

app.get("/health_check", (c) => {
  return c.json({ message: "ok" }, 200);
});

app.get("/get_board", async (c) => {
  const roomID = c.req.query("room_id");
  if (!roomID) {
    return c.json({ error: "room_id is required" }, 400);
  }
  const boardRepository = new BoardRepository(env.BOARD_TABLE_NAME);
  const usecase = new GetBoardUsecase(boardRepository);
  const board = await usecase.run(roomID);
  if (!board) {
    return c.json({ error: "board not found" }, 404);
  }
  return c.json({ board }, 200);
});

app.post("/join_room", async (c) => {
  const body = await c.req.json();
  const requestBody = z
    .object({
      client_id: z.string().min(1),
      room_id: z.string().min(1),
    })
    .safeParse(body);
  if (!requestBody.success) {
    console.error(requestBody.error.errors);
    return c.json({ error: "invalid request body" }, 400);
  }

  const websocketAdapter = new WebSocketAPIAdapter(env.CALLBACK_URL);
  const connecitonRepository = new ConnectionRepository(
    env.CONNECTION_TABLE_NAME
  );
  const roomRepository = new RoomRepository(env.ROOM_TABLE_NAME);
  const usecase = new JoinRoomUsecase(
    websocketAdapter,
    connecitonRepository,
    roomRepository
  );
  const roomID = await usecase.run(
    requestBody.data.client_id,
    requestBody.data.room_id
  );

  return c.json({ room_id: roomID }, 200);
});

export default app;
