import { ChatOpenAI } from "@langchain/openai";
import { ChatCompletionMessageToolCall } from "openai/resources/chat/completions";

export class LLMAdapter {
  private readonly openAIAPIKey: string;
  private readonly modelName: string;
  private readonly llmClient: ChatOpenAI;

  constructor(openAIAPIKey: string, modelName: string) {
    this.openAIAPIKey = openAIAPIKey;
    this.modelName = modelName;

    this.llmClient = new ChatOpenAI({
      apiKey: this.openAIAPIKey,
      temperature: 0.7,
    });
  }

  async chatMessage(prompt: string, systemContent: string): Promise<string> {
    try {
      const result = await this.llmClient.completionWithRetry({
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: prompt },
        ],
        model: this.modelName,
      });
      const contents = result.choices.map((choice) => choice.message.content);
      return contents.join("\n");
    } catch (error) {
      console.error("Error in chatMessage:", error);
      throw error;
    }
  }

  async functionCalling<T extends object, R extends object>(
    funcName: string,
    description: string,
    message: string,
    fn: (args: T) => Promise<R | void>,
    functionArgs: FunctionArgs
  ): Promise<R | void> {
    const response = await this.llmClient.completionWithRetry({
      messages: [{ role: "user", content: message }],
      model: this.modelName,
      tools: [
        {
          type: "function",
          function: {
            name: funcName,
            description: description,
            parameters: functionArgs,
          },
        },
      ],
    });
    const msg = response.choices[0].message;
    const functionCall = msg.tool_calls;
    if (!functionCall || functionCall.length === 0) {
      console.error("failed to call function", msg);
      throw new Error("No function call found in the response");
    }
    const {
      function: { arguments: argsStr },
    } = functionCall[0];
    const fnArgs = JSON.parse(argsStr || "{}") as T;
    return await fn(fnArgs);
  }
}

type FunctionArgs = {
  type: string;
  properties: {
    [key: string]: {
      type: string;
      description: string;
    };
  };
  required: string[];
};
