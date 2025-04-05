import { describe, it, expect, jest, xit } from "@jest/globals";
import { LLMAdapter } from "../llmAdapter";

describe("LLM Adapter", () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    xit("API key not set", () => {
      expect(true).toBe(true);
    });
  } else {
    it("functionCalling", async () => {
      const llmAdapter = new LLMAdapter(apiKey, "gpt-4o-mini-2024-07-18");

      const postDatabase: string[] = [];
      type FunctionReponse = {
        message: string;
      };
      const testChatPostFunction = async (args: {
        message: string;
      }): Promise<FunctionReponse> => {
        await new Promise((resolve) => {
          resolve(args.message);
        });
        postDatabase.push(args.message);
        return { message: args.message };
      };
      const testPrompt = `あなたはおじさんです。「#入力されたメッセージ」に対して、「#おじさん構文の例」を例にして返答してください。
#入力されたメッセージ
今日も疲れたな~

#おじさん構文の例
- 〇〇チャン、オッハー❗ 😚今日のお弁当が美味しくて、一緒に〇〇チャンのことも、食べちゃいたいナ〜😍💕（笑）✋ナンチャッテ😃💗
- お疲れ様〜٩(ˊᗜˋ*)و 🎵今日はどんな一日だっタ😘❗❓ 僕は、すごく心配だヨ(._.)😱💦😰そんなときは、オイシイ🍗🤤もの食べて、元気出さなきゃだネ😆
`;

      const result = await llmAdapter.functionCalling(
        "testChatPostFunction",
        "testFuncDescription",
        testPrompt,
        testChatPostFunction,
        {
          type: "object",
          properties: { message: { type: "string", description: "message" } },
          required: ["message"],
        }
      );
      expect(result).toBeDefined();
      expect(postDatabase).toHaveLength(1);
    });
  }
});
