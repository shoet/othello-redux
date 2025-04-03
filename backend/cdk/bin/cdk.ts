#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { OthelloBackendStack } from "../lib/othelloBackendStack";

declare module "aws-cdk-lib" {
  interface StackProps {
    stage: string;
  }
}
const app = new cdk.App();

const stage = app.node.tryGetContext("STAGE");
if (!stage) {
  throw new Error("Please provide a stage name");
}
if (!["dev", "prod"].includes(stage)) {
  throw new Error("Invalid stage name");
}

new OthelloBackendStack(app, `OthelloBackend-${stage}`, { stage });
