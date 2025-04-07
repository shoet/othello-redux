import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { APIGateway, DynamoDB, Lambda, SQS } from "./constructs";

export class OthelloBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const dynamodb = new DynamoDB(this, "DynamoDB");

    const lambda = new Lambda(this, "Lambda", {
      connection_table_name: dynamodb.connectionTable.tableName,
      room_table_name: dynamodb.roomTable.tableName,
      board_table_name: dynamodb.boardTable.tableName,
      board_history_table_name: dynamodb.boardHistoryTable.tableName,
    });

    dynamodb.grantReadWriteData(lambda.connectionLambdaFunction);
    dynamodb.grantReadWriteData(lambda.customEventLambdaFunction);
    dynamodb.grantReadWriteData(lambda.httpAPILambdaFunction);

    const apiGateway = new APIGateway(this, "APIGateway", {
      stage: props.stage,
      httpAPILambdaFunction: lambda.httpAPILambdaFunction,
      connectionLambdaFunction: lambda.connectionLambdaFunction,
      customEventLambdaFunction: lambda.customEventLambdaFunction,
    });
    apiGateway.addLambdaEnvironmentWebSocketCallbackURL([
      lambda.connectionLambdaFunction,
      lambda.customEventLambdaFunction,
      lambda.httpAPILambdaFunction,
      lambda.putOperationSQSLambdaFunction,
    ]);
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
    cfnOutput("ConnectionTableName", dynamodb.connectionTable.tableName);
    cfnOutput("RoomTableName", dynamodb.roomTable.tableName);
    cfnOutput("BoardTableName", dynamodb.boardTable.tableName);
    cfnOutput("BoardHistoryTableName", dynamodb.boardHistoryTable.tableName);
    cfnOutput("PutOperationQueueURL", sqs.putOperationFIFOQueue.queueUrl);
  }
}
