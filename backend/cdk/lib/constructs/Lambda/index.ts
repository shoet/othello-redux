import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

type Props = {
  connection_table_name: string;
  room_table_name: string;
  board_table_name: string;
  board_history_table_name: string;
};

export class Lambda extends Construct {
  readonly httpAPILambdaFunction: cdk.aws_lambda_nodejs.NodejsFunction;
  readonly connectionLambdaFunction: cdk.aws_lambda_nodejs.NodejsFunction;
  readonly customEventLambdaFunction: cdk.aws_lambda_nodejs.NodejsFunction;
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);
    const cdkRoot = process.cwd();

    this.httpAPILambdaFunction = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "HTTPAPILambdaFunction",
      {
        entry: `${cdkRoot}/../src/lambdaHttpHandler.ts`,
        handler: "handler",
        runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(30),
        environment: {
          CONNECTION_TABLE_NAME: props.connection_table_name,
          ROOM_TABLE_NAME: props.room_table_name,
          BOARD_TABLE_NAME: props.board_table_name,
          BOARD_HISTORY_TABLE_NAME: props.board_history_table_name,
        },
      }
    );

    const webSocketLambdaEnvironment = {
      CONNECTION_TABLE_NAME: props.connection_table_name,
      ROOM_TABLE_NAME: props.room_table_name,
      BOARD_TABLE_NAME: props.board_table_name,
      BOARD_HISTORY_TABLE_NAME: props.board_history_table_name,
    };

    this.connectionLambdaFunction = new cdk.aws_lambda_nodejs.NodejsFunction(
      scope,
      "ConnectionLambdaFunction",
      {
        entry: `${cdkRoot}/../src/lambdaWebSocketHandler.ts`,
        handler: "connectionHandler",
        runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(30),
        environment: {
          CONNECTION_TABLE_NAME: props.connection_table_name,
          ROOM_TABLE_NAME: props.room_table_name,
          BOARD_TABLE_NAME: props.board_table_name,
          BOARD_HISTORY_TABLE_NAME: props.board_history_table_name,
        },
      }
    );

    this.customEventLambdaFunction = new cdk.aws_lambda_nodejs.NodejsFunction(
      scope,
      "CustomEventLambdaFunction",
      {
        entry: `${cdkRoot}/../src/lambdaWebSocketHandler.ts`,
        handler: "customEventHandler",
        runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(30),
        environment: webSocketLambdaEnvironment,
      }
    );
  }
}
