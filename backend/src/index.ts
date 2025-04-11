import { Hono } from "hono";
import { GetBoardUsecase } from "./usecase/getBoard";
import { WebSocketAPIAdapter } from "./infrastracture/adapter/webSocketAPIAdapter";
import { z } from "zod";
import { ConnectionRepository } from "./infrastracture/repository/connectionRepository";
import { RoomRepository } from "./infrastracture/repository/roomRepository";
import { JoinRoomUsecase } from "./usecase/joinRoom";
import { BoardRepository } from "./infrastracture/repository/boardRepository";
import { cors } from "hono/cors";
import { ClientIDIsNotMember, StartGameUsecase } from "./usecase/startGame";
import { OperationPutCellUsecase } from "./usecase/operationPutCell";
import { BoardHistoryRepository } from "./infrastracture/repository/boardHistoryRepository";
import { GetPutableUsecase } from "./usecase/getPutable";
import { SQSAdapter } from "./infrastracture/adapter/sqsAdapter";

var environment = z.object({
  CONNECTION_TABLE_NAME: z.string().min(1),
  ROOM_TABLE_NAME: z.string().min(1),
  BOARD_TABLE_NAME: z.string().min(1),
  BOARD_HISTORY_TABLE_NAME: z.string().min(1),
  CALLBACK_URL: z.string().min(1),
  PUT_BY_CPU_QUEUE_URL: z.string().min(1),
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
      vs_cpu: z.boolean().optional(),
    })
    .safeParse(body);
  if (!requestBody.success) {
    console.error(requestBody.error.errors);
    return c.json({ error: "bad request" }, 400);
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
    requestBody.data.room_id,
    {
      vsCPU: requestBody.data.vs_cpu,
    }
  );

  return c.json({ room_id: roomID }, 200);
});

app.post("/join_room_cpu", async (c) => {
  const body = await c.req.json();
  const requestBody = z
    .object({
      client_id: z.string().min(1),
    })
    .safeParse(body);
  if (!requestBody.success) {
    console.error(requestBody.error.errors);
    return c.json({ error: "bad request" }, 400);
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
  const generateRoomID = crypto.randomUUID();
  const roomID = await usecase.run(requestBody.data.client_id, generateRoomID, {
    vsCPU: true,
  });

  return c.json({ room_id: roomID }, 200);
});

app.post("/start_game", async (c) => {
  const body = await c.req.json();
  const requestBody = z
    .object({
      client_id: z.string().min(1),
      room_id: z.string().min(1),
      board_size: z
        .number()
        .min(StartGameUsecase.MIN_BOARD_SIZE, {
          message: `指定できるボードサイズは${StartGameUsecase.MIN_BOARD_SIZE}以上です`,
        })
        .max(StartGameUsecase.MAX_BOARD_SIZE, {
          message: `指定できるボードサイズは${StartGameUsecase.MAX_BOARD_SIZE}以下です`,
        }),
    })
    .safeParse(body);
  if (!requestBody.success) {
    return c.json({ error: "bad request" }, 400);
  }
  const { client_id, room_id, board_size } = requestBody.data;

  const boardRepository = new BoardRepository(env.BOARD_TABLE_NAME);
  const roomRepository = new RoomRepository(env.ROOM_TABLE_NAME);
  const websocketAdapter = new WebSocketAPIAdapter(env.CALLBACK_URL);
  const connecitonRepository = new ConnectionRepository(
    env.CONNECTION_TABLE_NAME
  );

  const usecase = new StartGameUsecase(
    boardRepository,
    roomRepository,
    connecitonRepository,
    websocketAdapter
  );
  try {
    const room = await usecase.run(client_id, room_id, board_size);
    return c.json({ room: room }, 200);
  } catch (e) {
    if (e instanceof ClientIDIsNotMember) {
      return c.json({ message: "member is not full" }, 200);
    }
    console.error("unexpected error", e);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

app.post("/get_putable", async (c) => {
  const body = await c.req.json();
  const requestBody = z
    .object({
      board_id: z.string().min(1),
      position: z.object({ x: z.number(), y: z.number() }),
      cell_color: z.enum(["white", "black"]),
    })
    .safeParse(body);
  if (!requestBody.success) {
    return c.json({ error: "bad request" }, 400);
  }
  const boardRepository = new BoardRepository(env.BOARD_TABLE_NAME);

  const usecase = new GetPutableUsecase(boardRepository);

  const request = requestBody.data;
  const putable = await usecase.run(
    request.board_id,
    request.position,
    request.cell_color
  );
  return c.json({ putable }, 200);
});

app.post("/put_cell", async (c) => {
  const body = await c.req.json();
  const requestBody = z
    .object({
      board_id: z.string().min(1),
      client_id: z.string().min(1),
      position: z.object({ x: z.number(), y: z.number() }),
      cell_color: z.enum(["white", "black"]),
    })
    .safeParse(body);
  if (!requestBody.success) {
    console.error("failed to parse requestBody", {
      error: requestBody.error.format(),
    });
    return c.json({ error: "bad request" }, 400);
  }
  const boardRepository = new BoardRepository(env.BOARD_TABLE_NAME);
  const boardHistoryRepository = new BoardHistoryRepository(
    env.BOARD_HISTORY_TABLE_NAME
  );
  const roomRepository = new RoomRepository(env.ROOM_TABLE_NAME);
  const websocketAdapter = new WebSocketAPIAdapter(env.CALLBACK_URL);
  const connecitonRepository = new ConnectionRepository(
    env.CONNECTION_TABLE_NAME
  );
  const sqsAdapter = new SQSAdapter();

  const usecase = new OperationPutCellUsecase(
    boardRepository,
    boardHistoryRepository,
    roomRepository,
    connecitonRepository,
    websocketAdapter,
    sqsAdapter,
    env.PUT_BY_CPU_QUEUE_URL
  );

  const request = requestBody.data;
  await usecase.run(
    request.board_id,
    request.client_id,
    request.position,
    request.cell_color
  );

  return c.json({ message: "ok" }, 200);
});

export default app;
