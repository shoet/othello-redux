import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { APIGateway, DynamoDB, Lambda } from "./constructs";

export class OthelloBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const dynamodb = new DynamoDB(this, "DynamoDB");

    const lambda = new Lambda(this, "Lambda", {
      connection_table_name: dynamodb.connectionTable.tableName,
      room_table_name: dynamodb.roomTable.tableName,
    });

    dynamodb.grantReadWriteData(lambda.connectionLambdaFunction);
    dynamodb.grantReadWriteData(lambda.customEventLambdaFunction);

    const apiGateway = new APIGateway(this, "APIGateway", {
      stage: props.stage,
      httpAPILambdaFunction: lambda.httpAPILambdaFunction,
      connectionLambdaFunction: lambda.connectionLambdaFunction,
      customEventLambdaFunction: lambda.customEventLambdaFunction,
    });
    lambda.connectionLambdaFunction.addEnvironment(
      "CALLBACK_URL",
      apiGateway.webSocketApiStage.callbackUrl
    );
    lambda.customEventLambdaFunction.addEnvironment(
      "CALLBACK_URL",
      apiGateway.webSocketApiStage.callbackUrl
    );

    new cdk.CfnOutput(this, "HTTPApiURL", {
      value: apiGateway.httpApi.apiEndpoint,
    });

    new cdk.CfnOutput(this, "WebSocketApiURL", {
      value: apiGateway.webSocketApiStage.url,
    });

    new cdk.CfnOutput(this, "WebSocketApiCallbackURL", {
      value: apiGateway.webSocketApiStage.callbackUrl,
    });

    new cdk.CfnOutput(this, "HttpLambdaLogGroupName", {
      value: lambda.httpAPILambdaFunction.logGroup.logGroupName,
    });

    new cdk.CfnOutput(this, "WebSocketConnectionLambdaLogGroup", {
      value: lambda.connectionLambdaFunction.logGroup.logGroupName,
    });

    new cdk.CfnOutput(this, "WebSocketCustomEventLambdaLogGroup", {
      value: lambda.customEventLambdaFunction.logGroup.logGroupName,
    });

    new cdk.CfnOutput(this, "ConnectionTableName", {
      value: dynamodb.connectionTable.tableName,
    });

    new cdk.CfnOutput(this, "RoomTableName", {
      value: dynamodb.roomTable.tableName,
    });

    new cdk.CfnOutput(this, "BoardTableName", {
      value: dynamodb.boardTable.tableName,
    });
  }
}
