import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { APIGateway, DynamoDB, Lambda, SQS } from "./constructs";

export class OthelloBackendStack extends cdk.Stack {
  getFromSSMParameterStoreAtBuildTime(stage: string, key: string) {
    const value = cdk.aws_ssm.StringParameter.valueForStringParameter(
      this,
      `/othello-backend/${stage}/${key}`
    );
    return value;
  }

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const dynamodb = new DynamoDB(this, "DynamoDB");

    const lambda = new Lambda(this, "Lambda");

    dynamodb.grantReadWriteData(lambda.connectionLambdaFunction);
    dynamodb.grantReadWriteData(lambda.customEventLambdaFunction);
    dynamodb.grantReadWriteData(lambda.httpAPILambdaFunction);
    dynamodb.grantReadWriteData(lambda.putOperationSQSLambdaFunction);

    const apiGateway = new APIGateway(this, "APIGateway", {
      stage: props.stage,
      httpAPILambdaFunction: lambda.httpAPILambdaFunction,
      connectionLambdaFunction: lambda.connectionLambdaFunction,
      customEventLambdaFunction: lambda.customEventLambdaFunction,
    });
    apiGateway.grantGrantInvokeManageConnection([
      lambda.connectionLambdaFunction,
      lambda.customEventLambdaFunction,
      lambda.httpAPILambdaFunction,
      lambda.putOperationSQSLambdaFunction,
    ]);

    const sqs = new SQS(this, "SQS", {
      stage: props.stage,
      putOperationLambda: lambda.putOperationSQSLambdaFunction,
      visibilityTimeout: lambda.putOperationSQSLambdaFunction.timeout,
    });
    sqs.grantSendMessage(lambda.httpAPILambdaFunction);
    sqs.grantSendMessage(lambda.putOperationSQSLambdaFunction);

    const lambdaEnvironment = {
      CONNECTION_TABLE_NAME: dynamodb.connectionTable.tableName,
      ROOM_TABLE_NAME: dynamodb.roomTable.tableName,
      BOARD_TABLE_NAME: dynamodb.boardTable.tableName,
      BOARD_HISTORY_TABLE_NAME: dynamodb.boardHistoryTable.tableName,
      CALLBACK_URL: apiGateway.webSocketApiStage.callbackUrl,
      PUT_BY_CPU_QUEUE_URL: sqs.putOperationFIFOQueue.queueUrl,
      OPENAI_API_KEY: this.getFromSSMParameterStoreAtBuildTime(
        props.stage,
        "OPENAI_API_KEY"
      ),
      OPENAI_MODEL_NAME: this.getFromSSMParameterStoreAtBuildTime(
        props.stage,
        "OPENAI_MODEL_NAME"
      ),
    };

    this.addLambdaEnvironment(lambda.httpAPILambdaFunction, lambdaEnvironment);
    this.addLambdaEnvironment(
      lambda.putOperationSQSLambdaFunction,
      lambdaEnvironment
    );
    this.addLambdaEnvironment(
      lambda.customEventLambdaFunction,
      lambdaEnvironment
    );
    this.addLambdaEnvironment(
      lambda.connectionLambdaFunction,
      lambdaEnvironment
    );

    const cfnOutput = (key: string, value: string) => {
      new cdk.CfnOutput(this, key, {
        value: value,
      });
    };
    cfnOutput("HTTPApiURL", apiGateway.httpApi.apiEndpoint);
    cfnOutput("WebSocketApiURL", apiGateway.webSocketApiStage.url);
    cfnOutput(
      "WebSocketApiCallbackURL",
      apiGateway.webSocketApiStage.callbackUrl
    );
    cfnOutput(
      "HttpLambdaLogGroupName",
      lambda.httpAPILambdaFunction.logGroup.logGroupName
    );
    cfnOutput(
      "WebSocketConnectionLambdaLogGroup",
      lambda.connectionLambdaFunction.logGroup.logGroupName
    );
    cfnOutput(
      "WebSocketCustomEventLambdaLogGroup",
      lambda.customEventLambdaFunction.logGroup.logGroupName
    );
    cfnOutput(
      "PutOperationSQSLambdaLogGroup",
      lambda.putOperationSQSLambdaFunction.logGroup.logGroupName
    );
    cfnOutput("ConnectionTableName", dynamodb.connectionTable.tableName);
    cfnOutput("RoomTableName", dynamodb.roomTable.tableName);
    cfnOutput("BoardTableName", dynamodb.boardTable.tableName);
    cfnOutput("BoardHistoryTableName", dynamodb.boardHistoryTable.tableName);
    cfnOutput("PutOperationQueueURL", sqs.putOperationFIFOQueue.queueUrl);
  }

  addLambdaEnvironment(
    lambdaFunction: cdk.aws_lambda.Function,
    environment: { [key: string]: string }
  ) {
    for (const key in environment) {
      lambdaFunction.addEnvironment(key, environment[key]);
    }
  }
}
