import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

type Props = {
  stage: string;
  putOperationLambda: cdk.aws_lambda.IFunction;
  visibilityTimeout?: cdk.Duration;
};

export class SQS extends Construct {
  public readonly putOperationFIFOQueue: cdk.aws_sqs.IQueue;
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const stack = cdk.Stack.of(this);
    const { stage, putOperationLambda } = props;

    const putOperationDeadLetterQueue = new cdk.aws_sqs.Queue(
      this,
      "PutOperationFIFODeadLetterQueue",
      {
        queueName: `${stack.stackName}-PutOperationFIFODeadLetterQueue.fifo`,
        fifo: true,
        removalPolicy:
          stage === "prod"
            ? cdk.RemovalPolicy.RETAIN
            : cdk.RemovalPolicy.DESTROY,
        retentionPeriod: cdk.Duration.minutes(60),
      }
    );

    this.putOperationFIFOQueue = new cdk.aws_sqs.Queue(
      this,
      "PutOperationFIFOQueue",
      {
        queueName: `${stack.stackName}-PutOperationFIFOQueue.fifo`,
        fifo: true,
        deadLetterQueue: {
          queue: putOperationDeadLetterQueue,
          maxReceiveCount: 1,
        },
        removalPolicy:
          stage === "prod"
            ? cdk.RemovalPolicy.RETAIN
            : cdk.RemovalPolicy.DESTROY,
        retentionPeriod: cdk.Duration.minutes(5),
        visibilityTimeout: props.visibilityTimeout,
        contentBasedDeduplication: false,
      }
    );

    putOperationLambda.addEventSource(
      new cdk.aws_lambda_event_sources.SqsEventSource(
        this.putOperationFIFOQueue,
        {
          maxConcurrency: 10, // 最大10の部屋を同時に処理する
          batchSize: 10, // 一度に10件のメッセージを処理する
          enabled: true,
          reportBatchItemFailures: true,
        }
      )
    );

    new cdk.aws_cloudwatch.Alarm(this, "DeadLetterQueueAlarm", {
      alarmName: `${stack.stackName}-PutOperationFIFODeadLetterQueue`,
      metric:
        putOperationDeadLetterQueue.metricApproximateNumberOfMessagesVisible({
          period: cdk.Duration.minutes(1),
          statistic: "Sum",
        }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator:
        cdk.aws_cloudwatch.ComparisonOperator
          .GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      alarmDescription:
        "Alarm when there are messages in the dead letter queue",
    });
  }

  grantSendMessage(...grantable: cdk.aws_iam.IGrantable[]) {
    grantable.forEach((g) => {
      this.putOperationFIFOQueue.grantSendMessages(g);
    });
  }
}
