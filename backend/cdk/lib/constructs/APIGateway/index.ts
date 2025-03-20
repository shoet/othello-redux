import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

type Props = {
  stage: string;
  httpAPILambdaFunction: cdk.aws_lambda.IFunction;
  connectionLambdaFunction: cdk.aws_lambda.IFunction;
  customEventLambdaFunction: cdk.aws_lambda.IFunction;
};

export class APIGateway extends Construct {
  public readonly httpApi: cdk.aws_apigatewayv2.HttpApi;
  public readonly webSocketApi: cdk.aws_apigatewayv2.WebSocketApi;
  public readonly webSocketApiStage: cdk.aws_apigatewayv2.WebSocketStage;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const stack = cdk.Stack.of(this);

    this.httpApi = new cdk.aws_apigatewayv2.HttpApi(this, "HTTPApi", {
      apiName: `${stack.stackName}-HttpApi`,
    });

    const lambdaIntegration =
      new cdk.aws_apigatewayv2_integrations.HttpLambdaIntegration(
        "HttpLambdaIntegration",
        props.httpAPILambdaFunction,
        { timeout: cdk.Duration.seconds(29) }
      );

    this.httpApi.addRoutes({
      path: "/{proxy+}",
      methods: [cdk.aws_apigatewayv2.HttpMethod.ANY],
      integration: lambdaIntegration,
    });

    this.webSocketApi = new cdk.aws_apigatewayv2.WebSocketApi(
      this,
      "WebSocketApi",
      {
        apiName: `${stack.stackName}-WebSocketApi`,
        routeSelectionExpression: "$request.body.action",
        connectRouteOptions: {
          integration:
            new cdk.aws_apigatewayv2_integrations.WebSocketLambdaIntegration(
              "WebsocketLambdaIntegrationConnect",
              props.connectionLambdaFunction
            ),
          returnResponse: true,
        },
        disconnectRouteOptions: {
          integration:
            new cdk.aws_apigatewayv2_integrations.WebSocketLambdaIntegration(
              "WebsocketLambdaIntegrationDisconnect",
              props.connectionLambdaFunction
            ),
        },
        defaultRouteOptions: {
          integration:
            new cdk.aws_apigatewayv2_integrations.WebSocketLambdaIntegration(
              "WebsocketLambdaIntegrationDefault",
              props.connectionLambdaFunction
            ),
          returnResponse: true,
        },
      }
    );

    this.webSocketApi.addRoute("custom_event", {
      integration:
        new cdk.aws_apigatewayv2_integrations.WebSocketLambdaIntegration(
          "WebsocketLambdaIntegrationCustom",
          props.customEventLambdaFunction
        ),
    });

    this.webSocketApiStage = new cdk.aws_apigatewayv2.WebSocketStage(
      this,
      "WebSocketStage",
      {
        webSocketApi: this.webSocketApi,
        stageName: props.stage,
        autoDeploy: true,
      }
    );
  }

  addLambdaEnvironmentWebSocketCallbackURL(
    lambdaFunctions: cdk.aws_lambda.Function[]
  ) {
    for (const lambdaFunction of lambdaFunctions) {
      lambdaFunction.addEnvironment(
        "CALLBACK_URL",
        this.webSocketApiStage.callbackUrl
      );
    }
  }

  grantGrantInvokeManageConnection(resources: cdk.aws_iam.IGrantable[]) {
    for (const resource of resources) {
      this.webSocketApi.grantManageConnections(resource);
    }
  }
}
