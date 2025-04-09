import { z } from "zod";
import {
  Handler,
  SQSEvent,
  SQSBatchItemFailure,
  SQSBatchResponse,
} from "aws-lambda";
import { BoardRepository } from "./infrastracture/repository/boardRepository";
import { BoardHistoryRepository } from "./infrastracture/repository/boardHistoryRepository";
import { RoomRepository } from "./infrastracture/repository/roomRepository";
import { WebSocketAPIAdapter } from "./infrastracture/adapter/webSocketAPIAdapter";
import { ConnectionRepository } from "./infrastracture/repository/connectionRepository";
import { OperationPutCellUsecase } from "./usecase/operationPutCell";

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

/**
 * FIFOキューを処理するLambdaハンドラー
 * 石の配置処理を行う
 */
export const putOperationQueueHandler: Handler = async (
  event: SQSEvent
): Promise<SQSBatchResponse> => {
  const boardRepository = new BoardRepository(env.BOARD_TABLE_NAME);
  const boardHistoryRepository = new BoardHistoryRepository(
    env.BOARD_HISTORY_TABLE_NAME
  );
  const roomRepository = new RoomRepository(env.ROOM_TABLE_NAME);
  const websocketAdapter = new WebSocketAPIAdapter(env.CALLBACK_URL);
  const connecitonRepository = new ConnectionRepository(
    env.CONNECTION_TABLE_NAME
  );

  const usecase = new OperationPutCellUsecase(
    boardRepository,
    boardHistoryRepository,
    roomRepository,
    connecitonRepository,
    websocketAdapter
  );
  const records = event.Records;
  const requestBody = z.object({
    board_id: z.string().min(1),
    client_id: z.string().min(1),
    position: z.object({ x: z.number(), y: z.number() }),
    cell_color: z.enum(["white", "black"]),
  });
  const batchItemFailures: SQSBatchItemFailure[] = [];
  for (let r of records) {
    const b = JSON.parse(r.body);
    const { success, data, error } = requestBody.safeParse(b);
    if (!success || data === undefined) {
      console.error("failed to parse request", {
        messageId: r.messageId,
        error: error.format(),
      });
      batchItemFailures.push({ itemIdentifier: r.messageId });
      continue;
    }
    const { client_id, board_id, position, cell_color } = data;
    try {
      await usecase.run(board_id, client_id, position, cell_color);
    } catch (e) {
      console.error("failed to usecase", { messageId: r.messageId, error: e });
      batchItemFailures.push({ itemIdentifier: r.messageId });
    }
  }
  return { batchItemFailures: batchItemFailures };
};
