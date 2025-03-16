import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

export class DynamoDB extends Construct {
  public readonly connectionTable: cdk.aws_dynamodb.TableV2;
  public readonly roomTable: cdk.aws_dynamodb.TableV2;
  public readonly boardTable: cdk.aws_dynamodb.TableV2;
  public readonly boardHistoryTable: cdk.aws_dynamodb.TableV2;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const stack = cdk.Stack.of(this);

    this.connectionTable = new cdk.aws_dynamodb.TableV2(
      this,
      "ConnectionTable",
      {
        tableName: `${stack.stackName}-ConnectionTable`,
        partitionKey: {
          name: "client_id",
          type: cdk.aws_dynamodb.AttributeType.STRING,
        },
        tags: [{ key: "stack", value: stack.stackName }],
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        deletionProtection: false,
        timeToLiveAttribute: "expire_at",
      }
    );

    this.roomTable = new cdk.aws_dynamodb.TableV2(this, "RoomTable", {
      tableName: `${stack.stackName}-RoomTable`,
      partitionKey: {
        name: "room_id",
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      tags: [{ key: "stack", value: stack.stackName }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
    });

    this.boardTable = new cdk.aws_dynamodb.TableV2(this, "BoardTable", {
      tableName: `${stack.stackName}-BoardTable`,
      partitionKey: {
        name: "board_id",
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      tags: [{ key: "stack", value: stack.stackName }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
    });

    this.boardHistoryTable = new cdk.aws_dynamodb.TableV2(
      this,
      "BoardHistoryTable",
      {
        tableName: `${stack.stackName}-BoardHistoryTable`,
        partitionKey: {
          name: "board_id",
          type: cdk.aws_dynamodb.AttributeType.STRING,
        },
        sortKey: {
          name: "timestamp",
          type: cdk.aws_dynamodb.AttributeType.NUMBER,
        },
        tags: [{ key: "stack", value: stack.stackName }],
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        deletionProtection: false,
      }
    );
  }

  grantReadWriteData(grantable: cdk.aws_iam.IGrantable) {
    this.connectionTable.grantReadWriteData(grantable);
    this.roomTable.grantReadWriteData(grantable);
    this.boardTable.grantReadWriteData(grantable);
    this.boardHistoryTable.grantReadWriteData(grantable);
  }
}
