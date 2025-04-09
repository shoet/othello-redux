import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class Lambda extends Construct {
  readonly httpAPILambdaFunction: cdk.aws_lambda_nodejs.NodejsFunction;
  readonly connectionLambdaFunction: cdk.aws_lambda_nodejs.NodejsFunction;
  readonly customEventLambdaFunction: cdk.aws_lambda_nodejs.NodejsFunction;
  readonly putOperationSQSLambdaFunction: cdk.aws_lambda_nodejs.NodejsFunction;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const cdkRoot = process.cwd();

    this.httpAPILambdaFunction = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "HTTPAPILambdaFunction",
      {
        entry: `${cdkRoot}/../src/lambdaHttpHandler.ts`,
        handler: "handler",
        runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
        timeout: cdk.Duration.minutes(1),
        bundling: {
          forceDockerBundling: false,
        },
      }
    );

    this.connectionLambdaFunction = new cdk.aws_lambda_nodejs.NodejsFunction(
      scope,
      "ConnectionLambdaFunction",
      {
        entry: `${cdkRoot}/../src/lambdaWebSocketHandler.ts`,
        handler: "connectionHandler",
        runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(30),
        bundling: {
          forceDockerBundling: false,
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
        bundling: {
          forceDockerBundling: false,
        },
      }
    );

    this.putOperationSQSLambdaFunction =
      new cdk.aws_lambda_nodejs.NodejsFunction(
        scope,
        "PutOperationSQSLambdaFunction",
        {
          entry: `${cdkRoot}/../src/lambdaSQSHandler.ts`,
          handler: "putOperationQueueHandler",
          runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
          timeout: cdk.Duration.minutes(5),
          bundling: {
            forceDockerBundling: false,
          },
        }
      );
  }
}
