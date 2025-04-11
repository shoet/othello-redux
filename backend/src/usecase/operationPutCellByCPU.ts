import { Board } from "../domain/board";
import { BoardHistory } from "../domain/boardHistory";
import { Room } from "../domain/room";
import {
  BoardID,
  CellColor,
  ClientID,
  Connection,
  Player,
  Position,
} from "../domain/types";
import { FunctionCallingArgs } from "../infrastracture/adapter/llmAdapter";

interface IBoardRepository {
  getBoard(boardID: BoardID): Promise<Board | undefined>;
  updateBoard(board: Board): Promise<void>;
}

interface IRoomRepository {
  getByBoardID(boardID: BoardID): Promise<Room | undefined>;
}

interface IConnectionRepository {
  getConnection(clientID: ClientID): Promise<Connection | undefined>;
}

interface WebSocketAPIAdapter {
  createSendBoardInfoPayload(board: Board, isEndGame: boolean): string;
  sendMessage(connectionID: string, message: string): Promise<void>;
}

interface IBoardHistoryRepository {
  createHistory(
    boardID: BoardID,
    timestamp: number,
    clientID: ClientID,
    positionX: number,
    positionY: number,
    color: CellColor
  ): Promise<void>;
  getHistory(boardID: BoardID): Promise<BoardHistory[]>;
}

interface ILLMAdapter {
  functionCalling<T extends object, R extends object>(
    funcName: string,
    description: string,
    message: string,
    fn: (args: T) => Promise<R | void>,
    functionArgs: FunctionCallingArgs
  ): Promise<R | void>;
}

interface SQSAdapter {
  sendMessageFIFO(
    queueURL: string,
    messageGroupID: string,
    body: string,
    messageDeduplicationID: string
  ): Promise<void>;
}

export class OperationPutCellByCPUUsecase {
  private boardRepository: IBoardRepository;
  private boardHistoryRepository: IBoardHistoryRepository;
  private roomRepository: IRoomRepository;
  private connectionRepository: IConnectionRepository;
  private webSocketAPIAdapter: WebSocketAPIAdapter;
  private llmAdapter: ILLMAdapter;
  private sqsAdapter: SQSAdapter;
  private putByCPUQueueURL: string;

  private board: Board | undefined;
  private cpuPlayer: Player | undefined;

  constructor(
    boardRepository: IBoardRepository,
    boardHistoryRepository: IBoardHistoryRepository,
    roomRepository: IRoomRepository,
    connectionRepository: IConnectionRepository,
    webSocketAPIAdapter: WebSocketAPIAdapter,
    llmAdapter: ILLMAdapter,
    sqsAdapter: SQSAdapter,
    putByCPUQueueURL: string
  ) {
    this.boardRepository = boardRepository;
    this.boardHistoryRepository = boardHistoryRepository;
    this.roomRepository = roomRepository;
    this.connectionRepository = connectionRepository;
    this.webSocketAPIAdapter = webSocketAPIAdapter;
    this.llmAdapter = llmAdapter;
    this.sqsAdapter = sqsAdapter;
    this.putByCPUQueueURL = putByCPUQueueURL;
  }

  async run(boardID: BoardID) {
    this.board = await this.boardRepository.getBoard(boardID);
    if (!this.board) {
      throw new Error("board not found");
    }

    const room = await this.roomRepository.getByBoardID(boardID);
    if (!room) {
      throw new Error("room not found");
    }
    const boardHistory = await this.boardHistoryRepository.getHistory(
      this.board.boardID
    );

    this.cpuPlayer = room.getCPUPlayer();
    if (!this.cpuPlayer) {
      throw new Error("CPU Player not found");
    }

    const cpuPosition = await this.getCPUPosition(
      this.board,
      this.cpuPlayer,
      boardHistory
    );

    if (!cpuPosition) {
      throw new Error("cpu position not found");
    }

    // 石の配置
    this.board.putCell(cpuPosition, this.cpuPlayer.cellColor);
    // ターンの切り替え
    this.board.turnNext();
    // ボードの更新
    await this.boardRepository.updateBoard(this.board);
    // 履歴の保存
    await this.boardHistoryRepository.createHistory(
      this.board.boardID,
      Date.now(),
      this.cpuPlayer.clientID,
      cpuPosition.x,
      cpuPosition.y,
      this.cpuPlayer.cellColor
    );

    // 次ターンのプレイヤーが石を置けない場合はスキップ
    let nextPlayer = room.players[this.board.getTurnIndex()];
    let isSkip = this.board.isSkip(nextPlayer.cellColor);
    if (isSkip) {
      // スキップ
      this.board.turnNext();
      // その次ターンのプレイヤーも石を置けない場合はゲーム終了
      nextPlayer = room.players[this.board.getTurnIndex()];
      isSkip = this.board.isSkip(nextPlayer.cellColor);
      if (isSkip) {
        await this.sendTurnResponse(this.board, room, true);
        return;
      }
      // CPU側のターンで有人プレイヤーがスキップされた場合、
      // もう1ターンCPUに打たせるため再度キューに入れる
      await this.sendTurnResponse(this.board, room, false);
      // TODO: 無限ループ回避
      await this.sqsAdapter.sendMessageFIFO(
        this.putByCPUQueueURL,
        this.board.boardID,
        JSON.stringify({ board_id: this.board.boardID }),
        `${this.board.boardID}-${this.board.turn}` // messageDeduplicationID
      );
      return;
    }

    // ルームにボード情報と勝ち負け判定を通知
    await this.sendTurnResponse(this.board, room, false);
  }

  async getCPUPosition(
    board: Board,
    cpuPlayer: Player,
    boardHistory: BoardHistory[],
    retry: number = 5
  ) {
    let cpuPosition: Position | undefined;
    let retryHistory: {
      positionX: number;
      positionY: number;
      color: CellColor;
    }[] = [];
    while (true) {
      const prompt = this.getCPUPutPrompt(
        cpuPlayer.cellColor,
        board.boardSize,
        board,
        boardHistory,
        retryHistory
      );

      const putOperation = async (args: {
        positionX: number;
        positionY: number;
      }): Promise<void> => {
        cpuPosition = { x: args.positionX, y: args.positionY };
      };

      // オセロの手番
      await this.llmAdapter.functionCalling(
        "putOperation",
        "オセロの次の手の座標を`positionX`と`positionY`として出力する関数",
        prompt,
        putOperation,
        {
          type: "object",
          properties: {
            positionX: { type: "number", description: "オセロのX座標" },
            positionY: { type: "number", description: "オセロのY座標" },
          },
          required: ["positionX", "positionY"],
        }
      );

      // 配置可能なポジションが得られたら終了
      if (
        cpuPosition &&
        board.isPutableCell(cpuPosition, cpuPlayer.cellColor)
      ) {
        break;
      }

      if (retry <= 0) {
        return undefined;
      }
      console.log("retry cpu position", cpuPosition);
      if (cpuPosition) {
        retryHistory.push({
          positionX: cpuPosition.x,
          positionY: cpuPosition.y,
          color: cpuPlayer.cellColor,
        });
      }
      retry--;
    }
    console.log("decision cpu position", cpuPosition);
    return cpuPosition;
  }

  async sendTurnResponse(
    board: Board,
    room: Room,
    isEndgame: boolean
  ): Promise<void> {
    // ルームにボード情報と勝ち負け判定を通知
    const payload = this.webSocketAPIAdapter.createSendBoardInfoPayload(
      board,
      isEndgame
    );
    await Promise.all(
      room?.players.map(async (p) => {
        const conn = await this.connectionRepository.getConnection(p.clientID);
        if (!conn) {
          console.error("connection not found", p.clientID);
          return Promise.resolve();
        }
        await this.webSocketAPIAdapter.sendMessage(conn.connectionID, payload);
      }) || []
    );
  }

  getBoardPrompt(board: Board): string {
    const prompt = board.cells
      .map((row) => {
        return (
          "\t" +
          JSON.stringify(
            row.map((cell) => {
              return {
                position: { x: cell.position.x, y: cell.position.y },
                color: cell.cellColor,
              };
            })
          )
        );
      })
      .join(",\n");
    return `[\n${prompt}\n]`;
  }

  getHistoryPrompt(histories: BoardHistory[]): string {
    const prompt = histories
      .map((history) => {
        return (
          "\t" +
          JSON.stringify({
            position: { x: history.positionX, y: history.positionY },
            color: history.color,
          })
        );
      })
      .join(",\n");
    return `[\n${prompt}\n]`;
  }

  getRetryHistoryPrompt(
    retryHistory: {
      positionX: number;
      positionY: number;
      color: CellColor;
    }[]
  ): string {
    const prompt = retryHistory
      .map((history) => {
        return (
          "\t" +
          JSON.stringify({
            position: { x: history.positionX, y: history.positionY },
            color: history.color,
          })
        );
      })
      .join(",\n");
    return `[\n${prompt}\n]`;
  }

  getCPUPutPrompt(
    color: CellColor,
    boardSize: number,
    board: Board,
    history: BoardHistory[],
    retryHistory: { positionX: number; positionY: number; color: CellColor }[]
  ) {
    const boardPrompt = this.getBoardPrompt(board);
    const historyPrompt = this.getHistoryPrompt(history);
    const retryPrompt = this.getRetryHistoryPrompt(retryHistory);

    return `
    あなたはオセロを趣味で嗜むユーザーで、現在対戦中です。
    あなたの石の色は「${color}」です。
    「#対戦のルール」に記載の1~3を遵守して対戦をしてください。
    ボードのサイズは${boardSize}x${boardSize}です。

    #対戦のルール
    1. 盤面は「#盤面の状況」に以下の例のように${boardSize}x${boardSize}の2次元配列のJSONフォーマットで表現されます。
    \`\`\`board_example.json
    [
      [
        { "position": { x: 0, y; 0 }, "color": "black" },{ "position": { x: 1, y; 0 }, "color": "black" },{ "position": { x: 2, y; 0 }, "color": "white" }, ... { "position": { x: 8, y; 0 }, "color": "white" }
      ],
      [
        { "position": { x: 0, y; 1 }, "color": "black" },{ "position": { x: 1, y; 1 }, "color": "black" },{ "position": { x: 2, y; 1 }, "color": "white" }, ... { "position": { x: 8, y; 1 }, "color": "white" }
      ],
      ...
    ]
    \`\`\`

    2. 手の履歴は「#手の履歴」に以下のJSONフォーマットの例のように表現されます。
      - 手の順は、JSONの配列のインデックス順です。
    \`\`\`history_example.json
    [
    	{ "position": { x: 4, y; 4 }, "color": "black" },
    	{ "position": { x: 3, y; 4 }, "color": "white" },
    	{ "position": { x: 2, y; 4 }, "color": "black" }
    ]
    \`\`\`

    3. 以下のオセロの基本的なルールを遵守してください
     - 各手番では自分の石で、相手の石を挟んでひっくり返せる位置にしか置けません。
     - ひとつでも相手の石を挟めるマスがなければ、その手番はパスとなります。
     - 石を置くときは、盤面上のいずれかの方向で相手の石が連続し、その先に自分の石がある形になっている必要があります（挟んだ相手の石はすべてひっくり返します）。
     - 盤面が埋まる、または両者とも置ける場所がなくなった時点でゲーム終了です。
     - 盤面に置かれた石の数が多いほうが勝者です。

    4. 「#リトライ履歴」はこのターンであなたから出された手ですが配置が不可能だったためリトライした履歴です。これらの手を繰り返さないようにしてください。
      - リトライ履歴は、JSONの配列のインデックス順です。
    \`\`\`retry_example.json
    [
      { "position": { x: 6, y; 3 }, "color": "black" },
      { "position": { x: 6, y; 3 }, "color": "black" },
      { "position": { x: 6, y; 3 }, "color": "black" }
    ]
    \`\`\`

    #盤面の状況
    \`\`\`board.json
${boardPrompt
  .split("\n")
  .map((line) => `    ${line}`)
  .join("\n")}
    \`\`\`

    #手の履歴
    \`\`\`history.json
${historyPrompt
  .split("\n")
  .map((line) => `    ${line}`)
  .join("\n")}
    \`\`\`

    #リトライ履歴
    \`\`\`retry.json
${retryPrompt
  .split("\n")
  .map((line) => `    ${line}`)
  .join("\n")}
    \`\`\`
    `;
  }
}
