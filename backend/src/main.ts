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

  // const roomID = crypto.randomUUID();
  const roomID = "1236";
  const usecase = new JoinRoomUsecase(
    webSocketAPIAdapter,
    connectionRepository,
    roomRepository
  );
  await usecase.run("037c556b-fc54-4037-aea7-485c708e4a00", roomID);
})(false);

// StartGameUsecase
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

  const roomTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "RoomTableName"
  )?.OutputValue;
  const roomRepository = new RoomRepository(roomTableName || "");

  const boardTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "BoardTableName"
  )?.OutputValue;
  const boardRepository = new BoardRepository(boardTableName || "");

  const usecase = new StartGameUsecase(boardRepository, roomRepository);
  const roomID = "1236";
  const boardSize = 8;
  const room = await usecase.run(roomID, boardSize);
  console.log(room);
})(false);

// GetBoardUsecase
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

  const boardTableName = stack.Outputs?.find(
    (o) => o.OutputKey == "BoardTableName"
  )?.OutputValue;
  const boardRepository = new BoardRepository(boardTableName || "");

  const usecase = new GetBoardUsecase(boardRepository);
  const boardID = "827b6db8-88e7-4097-b0e5-fe44bca88576";
  const board = await usecase.run(boardID);
  console.log(board);
})(false);

// OperationPutCellUsecase
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

  const usecase = new OperationPutCellUsecase(
    boardRepository,
    boardHistoryRepository
  );
  const boardID = "827b6db8-88e7-4097-b0e5-fe44bca88576";
  const clientID = "037c556b-fc54-4037-aea7-485c708e4a00";
  const res = await usecase.run(boardID, clientID, { x: 0, y: 3 }, "black");
  console.log(res.board.cells);
})(true);
