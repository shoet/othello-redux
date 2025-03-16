import * as ddb from "@aws-sdk/client-dynamodb";
import "../../extensions";

export class BaseDynamoDBRepository {
  protected ddbClient: ddb.DynamoDBClient;
  protected readonly ddbTableName: string;

  constructor(tableName: string) {
    this.ddbTableName = tableName;
    this.ddbClient = new ddb.DynamoDBClient({});
  }
}
