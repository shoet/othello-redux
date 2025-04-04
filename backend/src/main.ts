import { WebSocketAPIAdapter } from "./infrastracture/adapter/webSocketAPIAdapter";
import { BoardRepository } from "./infrastracture/repository/boardRepository";
import { ConnectionRepository } from "./infrastracture/repository/connectionRepository";
import { RoomRepository } from "./infrastracture/repository/roomRepository";
import { ConnectionUsecase } from "./usecase/connection";
import { GetBoardUsecase } from "./usecase/getBoard";
import { JoinRoomUsecase } from "./usecase/joinRoom";
import * as cfn from "@aws-sdk/client-cloudformation";
import { StartGameUsecase } from "./usecase/startGame";
import { OperationPutCellUsecase } from "./usecase/operationPutCell";
import { BoardHistoryRepository } from "./infrastracture/repository/boardHistoryRepository";
import { LLMAdapter } from "./infrastracture/adapter/llmAdapter";

(async (run: boolean) => {
  if (!run) return;
  const cfnClient = new cfn.CloudFormationClient({});
  const describeCommand = new cfn.DescribeStacksCommand({
    StackName: "OthelloBackend-dev",
  });
  const result = await cfnClient.send(describeCommand);
  const stack = result.Stacks?.[0];
  if (!stack) {
    console.error("stack not found");
    process.exit(1);
  }
  const callbackURL = stack.Outputs?.find(
    (o) => o.OutputKey == "WebSocketApiCallbackURL"
  )?.OutputValue;

  const connectionTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "ConnectionTableName"
  )?.OutputValue;
  const roomTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "RoomTableName"
  )?.OutputValue;
  const connectionRepository = new ConnectionRepository(
    connectionTableName || ""
  );

  const usecase = new ConnectionUsecase(connectionRepository);
  const connectionID = "test1234";
  const clientID = await usecase.run(connectionID);
  console.log(clientID);
})(false);

// JoinRoomUsecase
(async (run: boolean) => {
  if (!run) return;
  console.log("JoinRoomUsecase");
  const cfnClient = new cfn.CloudFormationClient({});

  const describeCommand = new cfn.DescribeStacksCommand({
    StackName: "OthelloBackend-dev",
  });
  const result = await cfnClient.send(describeCommand);
  const stack = result.Stacks?.[0];
  if (!stack) {
    console.error("stack not found");
    return;
  }
  const callbackURL = stack.Outputs?.find(
    (o) => o.OutputKey == "WebSocketApiCallbackURL"
  )?.OutputValue;

  const connectionTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "ConnectionTableName"
  )?.OutputValue;
  const connectionRepository = new ConnectionRepository(
    connectionTableName || ""
  );

  const roomTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "RoomTableName"
  )?.OutputValue;
  const roomRepository = new RoomRepository(roomTableName || "");

  const webSocketAPIAdapter = new WebSocketAPIAdapter(callbackURL || "");

  const roomID = "1237";
  const usecase = new JoinRoomUsecase(
    webSocketAPIAdapter,
    connectionRepository,
    roomRepository
  );
  await usecase.run("2bca7037-8ca1-4721-9952-8cd44dcba82f", roomID);
})(false);

// StartGameUsecase
(async (run: boolean) => {
  if (!run) return;
  console.log("StartGameUsecase");
  const cfnClient = new cfn.CloudFormationClient({});
  const describeCommand = new cfn.DescribeStacksCommand({
    StackName: "OthelloBackend-dev",
  });
  const result = await cfnClient.send(describeCommand);
  const stack = result.Stacks?.[0];
  if (!stack) {
    console.error("stack not found");
    process.exit(1);
  }

  const roomTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "RoomTableName"
  )?.OutputValue;
  const roomRepository = new RoomRepository(roomTableName || "");

  const boardTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "BoardTableName"
  )?.OutputValue;
  const boardRepository = new BoardRepository(boardTableName || "");
  const connectionTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "ConnectionTableName"
  )?.OutputValue;

  const connectionRepository = new ConnectionRepository(
    connectionTableName || ""
  );
  const callbackURL = stack.Outputs?.find(
    (o) => o.OutputKey == "WebSocketApiCallbackURL"
  )?.OutputValue;

  const webSocketAPIAdapter = new WebSocketAPIAdapter(callbackURL || "");

  const usecase = new StartGameUsecase(
    boardRepository,
    roomRepository,
    connectionRepository,
    webSocketAPIAdapter
  );
  const clientID = "1234";
  const roomID = "1237";
  const boardSize = 8;
  const room = await usecase.run(clientID, roomID, boardSize);
  console.log(room);
})(false);

// GetBoardUsecase
(async (run: boolean) => {
  if (!run) return;
  console.log("GetBoardUsecase");
  const cfnClient = new cfn.CloudFormationClient({});
  const describeCommand = new cfn.DescribeStacksCommand({
    StackName: "OthelloBackend-dev",
  });
  const result = await cfnClient.send(describeCommand);
  const stack = result.Stacks?.[0];
  if (!stack) {
    console.error("stack not found");
    process.exit(1);
  }

  const boardTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "BoardTableName"
  )?.OutputValue;
  const boardRepository = new BoardRepository(boardTableName || "");

  const usecase = new GetBoardUsecase(boardRepository);
  const boardID = "70180f82-8823-4aff-b64c-71878374d377";
  const board = await usecase.run(boardID);
  console.log(board);
})(false);

// OperationPutCellUsecase
(async (run: boolean) => {
  if (!run) return;
  console.log("OperationPutCellUsecase");
  const cfnClient = new cfn.CloudFormationClient({});
  const describeCommand = new cfn.DescribeStacksCommand({
    StackName: "OthelloBackend-dev",
  });
  const result = await cfnClient.send(describeCommand);
  const stack = result.Stacks?.[0];
  if (!stack) {
    console.error("stack not found");
    process.exit(1);
  }

  const boardTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "BoardTableName"
  )?.OutputValue;
  const boardRepository = new BoardRepository(boardTableName || "");

  const boardHistoryTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "BoardHistoryTableName"
  )?.OutputValue;
  const boardHistoryRepository = new BoardHistoryRepository(
    boardHistoryTableName || ""
  );

  const roomTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "RoomTableName"
  )?.OutputValue;
  const roomRepository = new RoomRepository(roomTableName || "");

  const connectionTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "ConnectionTableName"
  )?.OutputValue;
  const connectionRepository = new ConnectionRepository(
    connectionTableName || ""
  );

  const callbackURL = stack.Outputs?.find(
    (o) => o.OutputKey == "WebSocketApiCallbackURL"
  )?.OutputValue;
  const webSocketAPIAdapter = new WebSocketAPIAdapter(callbackURL || "");

  const usecase = new OperationPutCellUsecase(
    boardRepository,
    boardHistoryRepository,
    roomRepository,
    connectionRepository,
    webSocketAPIAdapter
  );
  const boardID = "70180f82-8823-4aff-b64c-71878374d377";
  const clientID = "148ad834-ae64-4e19-910b-3087444112cc";
  await usecase.run(boardID, clientID, { x: 0, y: 3 }, "white");
})(false);

(async (run: boolean) => {
  if (!run) return;
  const apiKey = process.env.OPENAI_API_KEY || "";
  const modelName = "gpt-4o";
  const llmAdapter = new LLMAdapter(apiKey, modelName);

  const res = await llmAdapter.chatMessage(
    "test",
    "すべて日本語で答えてください。"
  );
  console.log(res);
})(true);
