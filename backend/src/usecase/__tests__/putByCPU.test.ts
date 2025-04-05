import { describe, it, expect, jest, xit } from "@jest/globals";
import { LLMAdapter } from "../../infrastracture/adapter/llmAdapter";
import { PutByCPUUsecase } from "../putByCPU";
import { BoardRepository } from "../../infrastracture/repository/boardRepository";
import { BoardHistoryRepository } from "../../infrastracture/repository/boardHistoryRepository";
import { Board } from "../../domain/board";
import { Cell } from "../../domain/types";
import { BoardHistory } from "../../domain/boardHistory";

describe("PutByCPUUsecase-real", () => {
  const OpenAPIKey = process.env.OPENAI_API_KEY;
  if (!OpenAPIKey) {
    xit("OpenAI API key is not set", () => {});
  } else {
    it(
      "run",
      async () => {
        const llmAdapter = new LLMAdapter(OpenAPIKey, "gpt-4o-mini-2024-07-18");

        const boardRepositoryMock = {
          getBoard: jest.fn(async (boardID: string): Promise<Board> => {
            const board = Board.fromEmpty(boardID, 4);
            const cells: Cell[][] = [
              [
                { position: { x: 0, y: 0 }, cellColor: null },
                { position: { x: 1, y: 0 }, cellColor: null },
                { position: { x: 2, y: 0 }, cellColor: "white" },
                { position: { x: 3, y: 0 }, cellColor: null },
              ],
              [
                { position: { x: 0, y: 1 }, cellColor: null },
                { position: { x: 1, y: 1 }, cellColor: "white" },
                { position: { x: 2, y: 1 }, cellColor: "white" },
                { position: { x: 3, y: 1 }, cellColor: null },
              ],
              [
                { position: { x: 0, y: 2 }, cellColor: null },
                { position: { x: 1, y: 2 }, cellColor: "black" },
                { position: { x: 2, y: 2 }, cellColor: "black" },
                { position: { x: 3, y: 2 }, cellColor: "black" },
              ],
              [
                { position: { x: 0, y: 3 }, cellColor: null },
                { position: { x: 1, y: 3 }, cellColor: null },
                { position: { x: 2, y: 3 }, cellColor: null },
                { position: { x: 3, y: 3 }, cellColor: null },
              ],
            ];
            board.cells = cells;
            return board;
          }),
        };

        const boardHistoryRepositoryMock = {
          getHistory: jest.fn(
            async (boardID: string): Promise<BoardHistory[]> => {
              return [
                {
                  positionX: 2,
                  positionY: 0,
                  color: "white",
                  boardID: boardID,
                  clientID: "client1",
                  timestamp: 1,
                },
                {
                  positionX: 3,
                  positionY: 2,
                  color: "black",
                  boardID: boardID,
                  clientID: "client2",
                  timestamp: 2,
                },
              ];
            }
          ),
        };

        const usecase = new PutByCPUUsecase(
          llmAdapter,
          boardRepositoryMock as unknown as BoardRepository,
          boardHistoryRepositoryMock as unknown as BoardHistoryRepository
        );

        const usecaseSpy = jest.spyOn(usecase, "putOperation");

        await usecase.run("example_boardID");

        expect(usecaseSpy).toBeCalledTimes(1);
      },
      1000 * 60 * 1
    ); // 1 minutes timeout
  }
});
