import { ChatOpenAI } from "@langchain/openai";

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
}
