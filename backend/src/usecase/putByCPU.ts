import { Board } from "../domain/board";
import { BoardHistory } from "../domain/boardHistory";
import { BoardID, CellColor } from "../domain/types";
import { FunctionCallingArgs } from "../infrastracture/adapter/llmAdapter";

const getPrompt = (
  color: CellColor,
  boardSize: number,
  board: string,
  history: string
) => `
あなたはオセロを趣味で嗜むユーザーで、現在対戦中です。
あなたの石の色は「${color}」です。
「#対戦のルール」に記載の1~3を遵守して対戦をしてください。
ボードのサイズは${boardSize}x${boardSize}です。

#対戦のルール
1. 盤面は「#盤面の状況」に以下のJSONフォーマットの例のように表現されます。
\`\`\`json
[
	{ "position": { x: 0, y; 0 }, "color": "black" },
	{ "position": { x: 1, y; 0 }, "color": "black" },
	{ "position": { x: 2, y; 0 }, "color": "white" },
	...
\`\`\`
]

2. 手の履歴は「#手の履歴」に以下のJSONフォーマットの例のように表現されます。
  - 手の順は、JSONの配列のインデックス順です。
\`\`\`json
[
	{ "position": { x: 4, y; 4 }, "color": "black" },
	{ "position": { x: 3, y; 4 }, "color": "white" },
	{ "position": { x: 2, y; 4 }, "color": "black" },
]
\`\`\`

3. 以下のオセロの基本的なルールを遵守してください
 - 各手番では自分の石で、相手の石を挟んでひっくり返せる位置にしか置けません。
 - ひとつでも相手の石を挟めるマスがなければ、その手番はパスとなります。
 - 石を置くときは、盤面上のいずれかの方向で相手の石が連続し、その先に自分の石がある形になっている必要があります（挟んだ相手の石はすべてひっくり返します）。
 - 盤面が埋まる、または両者とも置ける場所がなくなった時点でゲーム終了です。
 - 盤面に置かれた石の数が多いほうが勝者です。

#盤面の状況
${board}

#手の履歴
${history}
`;

interface OpenAPIAdapter {
  functionCalling<T extends object, R extends object>(
    funcName: string,
    description: string,
    message: string,
    fn: (args: T) => Promise<R | void>,
    functionArgs: FunctionCallingArgs
  ): Promise<R | void>;
}

interface BoardRepository {
  getBoard(boardID: BoardID): Promise<Board | undefined>;
}
interface BoardHistoryRepository {
  getHistory(boardID: BoardID): Promise<BoardHistory[]>;
}

export class PutByCPUUsecase {
  private readonly openaiAdapter: OpenAPIAdapter;
  private readonly boardRepository: BoardRepository;
  private readonly boardHistoryRepository: BoardHistoryRepository;

  constructor(
    openaiAdapter: OpenAPIAdapter,
    boardRepository: BoardRepository,
    boardHistoryRepository: BoardHistoryRepository
  ) {
    this.openaiAdapter = openaiAdapter;
    this.boardRepository = boardRepository;
    this.boardHistoryRepository = boardHistoryRepository;
  }

  async run(boardID: string) {
    const board = await this.boardRepository.getBoard(boardID);
    if (!board) {
      console.error("Board not found");
      return;
    }
    const boardHistory = await this.boardHistoryRepository.getHistory(boardID);

    const boardPrompt = JSON.stringify(this.getBoardJSON(board), null, 1);
    const historyPrompt = JSON.stringify(
      this.getBoardHistoryJSON(boardHistory),
      null,
      1
    );
    const cpuCellColor: CellColor = "black";
    const prompt = getPrompt(
      cpuCellColor,
      board.boardSize,
      boardPrompt,
      historyPrompt
    );

    await this.openaiAdapter.functionCalling(
      "putOperation",
      "オセロの次の手を`position`として出力する関数",
      prompt,
      this.putOperation,
      {
        type: "object",
        properties: {
          positionX: { type: "number", description: "オセロのX座標" },
          positionY: { type: "number", description: "オセロのY座標" },
        },
        required: ["positionX", "positionY"],
      }
    );
  }

  async putOperation(args: { positionX: number; positionY: number }) {
    console.log("PutOperation called with args:", args);
    // TODO: call put operation
    // putOperation(args.positionX, args.positionY, cpuCellColor);
  }

  getBoardJSON(board: Board): any {
    return board.cells.map((row) => {
      return row.map((cell) => {
        return {
          position: { x: cell.position.x, y: cell.position.y },
          color: cell.cellColor,
        };
      });
    });
  }

  getBoardHistoryJSON(histories: BoardHistory[]): any {
    return histories.map((history) => {
      return {
        position: { x: history.positionX, y: history.positionY },
        color: history.color,
      };
    });
  }
}
