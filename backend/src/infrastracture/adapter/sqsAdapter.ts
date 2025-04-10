import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

export class SQSAdapter {
  constructor() {}

  async sendMessageFIFO(
    queueURL: string,
    messageGroupID: string,
    body: string,
    messageDeduplicationID: string
  ): Promise<void> {
    const sqsClient = new SQSClient();
    const sendMessageCommand = new SendMessageCommand({
      QueueUrl: queueURL,
      MessageGroupId: messageGroupID,
      MessageBody: body,
      MessageDeduplicationId: messageDeduplicationID,
    });
    try {
      await sqsClient.send(sendMessageCommand);
    } catch (e) {
      console.error("failed to sendMessage", e);
      throw new Error("failed to sendMessage");
    }
  }
}
