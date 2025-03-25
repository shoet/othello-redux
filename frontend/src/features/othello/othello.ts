export type CellColor = "white" | "black";

export type CellPosition = { x: number; y: number };

export type Player = { clientID: string; cellColor: CellColor };

export type Result = {
  score: { color: CellColor; count: number; player: Player }[];
};

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

export type Cell = {
  cellColor?: CellColor;
  position: CellPosition;
};

export type Cells = Cell[][];

export type Board = {
  size: number;
  cells: Cells;
};

export function getEmptyBoard(size: number): Board {
  const cells = Array.from({ length: size }, (_, y) => y).map((y) => {
    return Array.from({ length: size }, (_, x) => x).map((x) => {
      return { position: { x: x, y: y } } as Cell;
    });
  });
  return {
    size: size,
    cells: cells,
  };
}

export function isEmptyCell(board: Board, x: number, y: number): boolean {
  if (x >= board.size || y >= board.size) {
    return false;
  }
  return board.cells[y][x].cellColor == undefined;
}

/**
 * getDirectionCells は、指定された位置から指定された方向に向かって、指定された色のセルで挟まれたセルを取得する。
 */
export function getDirectionCells(
  board: Board,
  x: number,
  y: number,
  cellColor: CellColor,
  direction: CellDirection
): Cell[] {
  let cells: Cell[] = [];
  const directions = {
    [CellDirection.Up]: { dx: 0, dy: -1 },
    [CellDirection.UpRight]: { dx: 1, dy: -1 },
    [CellDirection.Right]: { dx: 1, dy: 0 },
    [CellDirection.DownRight]: { dx: 1, dy: 1 },
    [CellDirection.Down]: { dx: 0, dy: 1 },
    [CellDirection.DownLeft]: { dx: -1, dy: 1 },
    [CellDirection.Left]: { dx: -1, dy: 0 },
    [CellDirection.UpLeft]: { dx: -1, dy: -1 },
  };

  const { dx, dy } = directions[direction];
  let foundSameColor = false;

  while (true) {
    x += dx;
    y += dy;

    if (x < 0 || x >= board.size || y < 0 || y >= board.size) {
      break;
    }

    const cell = board.cells[y][x];
    if (cell.cellColor == undefined) {
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
export function getAroundSandwitchedCells(
  board: Board,
  position: CellPosition,
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
    const directionCells = getDirectionCells(
      board,
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

export function putCell(
  board: Board,
  position: CellPosition,
  color: CellColor
): Cells {
  const newCells = board.cells.map((row) => row.slice());
  newCells[position.y][position.x] = { position: position, cellColor: color };
  return newCells;
}

/**
 * putManyCell は、Board上のcellsに、putCellsを配置した新たなCellsを発行する。
 * cellColorが指定されている場合は、その色で配置する。
 */
export function putManyCell(
  board: Board,
  putCells: Cell[],
  cellColor: CellColor
): Cells {
  let cells = board.cells;
  putCells.forEach((cell) => {
    cells[cell.position.y][cell.position.x] = {
      cellColor: cellColor,
      position: cell.position,
    };
  });
  return cells;
}

export function reverseCell(board: Board, position: CellPosition): Cells {
  const cell = board.cells[position.y][position.x];
  if (cell.cellColor == undefined) {
    throw new Error("this cell is empty");
  }
  const newCell: Cell = {
    ...cell,
    cellColor: cell.cellColor == "white" ? "black" : "white",
  };

  const newCells = board.cells.map((row) => row.slice());
  newCells[position.y][position.x] = newCell;

  return newCells;
}

export function calcScore(board: Board, players: Player[]): Result {
  let score: Record<CellColor, number> = {
    black: 0,
    white: 0,
  };
  board.cells.forEach((row) => {
    row.forEach((cell) => {
      if (cell.cellColor != undefined) {
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

/**
 * isEndGame は、Boardに配置された、石が配置されていないセルの数が0であるかを判定し、ゲームが終了したかを判定する。
 */
export function isEndGame(board: Board): boolean {
  return (
    board.cells.flat().filter((cell) => cell.cellColor == undefined).length == 0
  );
}
