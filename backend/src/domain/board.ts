import {
  BoardDTO,
  BoardID,
  Cell,
  CellColor,
  Player,
  Position,
  Result,
} from "./types";

enum CellDirection {
  Up = 0,
  UpRight = 45,
  Right = 90,
  DownRight = 135,
  Down = 180,
  DownLeft = 225,
  Left = 270,
  UpLeft = 315,
}

const directions = {
  [CellDirection.Up]: { dx: 0, dy: -1 },
  [CellDirection.UpRight]: { dx: 1, dy: -1 },
  [CellDirection.Right]: { dx: 1, dy: 0 },
  [CellDirection.DownRight]: { dx: 1, dy: 1 },
  [CellDirection.Down]: { dx: 0, dy: 1 },
  [CellDirection.DownLeft]: { dx: -1, dy: 1 },
  [CellDirection.Left]: { dx: -1, dy: 0 },
  [CellDirection.UpLeft]: { dx: -1, dy: -1 },
} as const;

export type Cells = Cell[][];

export class Board {
  boardID: BoardID;
  boardSize: number;
  cells: Cell[][];
  turn: number;

  constructor(
    boardID: BoardID,
    boardSize: number,
    turn: number,
    cells: Cell[][]
  ) {
    if (boardSize % 2 !== 0) {
      throw new Error("boardSize must be even number");
    }
    this.boardID = boardID;
    this.boardSize = boardSize;
    this.turn = turn;
    this.cells = cells;
  }

  static fromJSON(
    boardID: BoardID,
    boardSize: number,
    turn: number,
    body: string
  ): Board {
    const rows = JSON.parse(body);
    if (!Array.isArray(rows))
      throw new Error("invalid board contents: not an array");
    for (let row of rows) {
      if (!Array.isArray(row))
        throw new Error("invalid board contents: row is not an array");
      for (let cell of row) {
        if (!Board.isCell(cell)) throw new Error("invalid cell contents");
      }
    }
    return new Board(boardID, boardSize, turn, rows);
  }

  static isCell(cell: any): cell is Cell {
    return (
      typeof cell === "object" &&
      typeof cell.position === "object" &&
      typeof cell.position.x === "number" &&
      typeof cell.position.y === "number" &&
      (cell.cellColor === "white" ||
        cell.cellColor === "black" ||
        cell.cellColor === null)
    );
  }

  static fromEmpty(boardID: BoardID, boardSize: number): Board {
    const cells = Array.from({ length: boardSize }, (_, y) =>
      Array.from({ length: boardSize }, (_, x) => ({
        position: { x, y },
        cellColor: null,
      }))
    );
    return new Board(boardID, boardSize, 0, cells);
  }

  initialize(): void {
    const center = Math.floor(this.boardSize / 2);
    const cells: Cell[] = [
      {
        position: { x: center - 1, y: center - 1 },
        cellColor: "white",
      },
      {
        position: { x: center, y: center - 1 },
        cellColor: "black",
      },
      {
        position: { x: center - 1, y: center },
        cellColor: "black",
      },
      {
        position: { x: center, y: center },
        cellColor: "white",
      },
    ];
    cells.forEach((c) => {
      if (c.cellColor === null) return;
      this.putCell(c.position, c.cellColor);
    });
  }

  toDTO(): BoardDTO {
    return {
      boardID: this.boardID,
      boardSize: this.boardSize,
      turn: this.turn,
      data: JSON.stringify(this.cells),
    };
  }

  /**
   * putCell はボード上のpositionにcolorで指定した石を配置して裏返す
   */
  putCell(position: Position, color: CellColor): void {
    this.cells[position.y][position.x] = {
      position: position,
      cellColor: color,
    };
    this.reverceCell(position, color);
  }

  /**
   * putManyCell は、Board上のcellsに、putCellsを配置する。
   */
  private putManyCell(putCells: Cell[], cellColor: CellColor): void {
    putCells.forEach((cell) => {
      this.cells[cell.position.y][cell.position.x] = {
        cellColor: cellColor,
        position: cell.position,
      };
    });
  }

  /**
   * reverceCell は、石が配置されたことによって、裏返し対象となったセルを裏返す。
   */
  private reverceCell(putedPosition: Position, putedColor: CellColor): void {
    // 裏返し対象のセルを取得
    const targetCells = this.getAroundSandwitchedCells(
      putedPosition,
      putedColor
    )
      .map((directionWithCells) => {
        return directionWithCells.cells;
      })
      .flat();
    // 対象のセルを指定された色に変更する
    this.putManyCell(targetCells, putedColor);
  }

  /**
   * getDirectionCells は、指定された位置から指定された方向に向かって、指定された色のセルで挟まれたセルを取得する。
   */
  private getDirectionCells(
    x: number,
    y: number,
    cellColor: CellColor,
    direction: CellDirection
  ): Cell[] {
    let cells: Cell[] = [];

    const { dx, dy } = directions[direction];
    let foundSameColor = false;

    while (true) {
      x += dx;
      y += dy;

      if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) {
        break;
      }

      const cell = this.cells[y][x];
      if (cell.cellColor === null) {
        return [];
      } else if (cell.cellColor == cellColor) {
        foundSameColor = true;
        break;
      } else {
        cells.push(cell);
      }
    }
    // 同じ色が見つからずに終了した場合はリセットして返す
    if (!foundSameColor) {
      return [];
    }
    return cells;
  }

  /**
   * getAroundSandwitchedCells は、指定された位置のセルに対して、指定された色で挟まれたセルを取得する。
   * 返り値は、挟まれたセルの方向とセルの配列のリストを返す。
   */
  private getAroundSandwitchedCells(
    position: Position,
    color: CellColor
  ): { direction: CellDirection; cells: Cell[] }[] {
    const aroundDirections = [
      CellDirection.Up,
      CellDirection.UpRight,
      CellDirection.Right,
      CellDirection.DownRight,
      CellDirection.Down,
      CellDirection.DownLeft,
      CellDirection.Left,
      CellDirection.UpLeft,
    ];

    return aroundDirections.map((direction) => {
      const directionCells = this.getDirectionCells(
        position.x,
        position.y,
        color,
        direction
      );
      return {
        direction: direction,
        cells: directionCells,
      };
    });
  }

  // isPutableCell は、positionにcolorの石が配置可能か判定する
  isPutableCell(position: Position, color: CellColor): boolean {
    const putable = this.getPutAbleCelles(color);
    const find = putable.find((cell) => {
      return cell.position.x == position.x && cell.position.y == position.y;
    });
    return find !== undefined;
  }

  // getPutAbleCelles は、空きマスを走査し、colorに対して配置可能なマスだけを取得する
  private getPutAbleCelles(color: CellColor) {
    const putableCells: Cell[] = [];
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        if (cell.cellColor === null) {
          const putable =
            this.getAroundSandwitchedCells(cell.position, color)
              .map((d) => d.cells)
              .flat().length > 0;
          if (putable) {
            putableCells.push(cell);
          }
        }
      });
    });
    return putableCells;
  }

  turnNext(): void {
    this.turn++;
  }

  getTurnIndex(): number {
    return this.turn % 2;
  }

  isEndGame(): boolean {
    return (
      this.cells.flat().filter((cell) => cell.cellColor === null).length === 0
    );
  }

  calcScore(players: Player[]): Result {
    let score: Record<CellColor, number> = {
      black: 0,
      white: 0,
    };
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        if (cell.cellColor !== null) {
          score[cell.cellColor] += 1;
        }
      });
    });

    const getPlayer = (cellColor: CellColor): Player =>
      players.filter((p) => p.cellColor == cellColor)[0];

    return {
      score: [
        { color: "white", count: score.white, player: getPlayer("white") },
        { color: "black", count: score.black, player: getPlayer("black") },
      ],
    };
  }
}
