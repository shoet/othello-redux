#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { OthelloFrontendStack } from "../lib/othelloFrontendStack";

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

new OthelloFrontendStack(app, `OthelloFrontend-${stage}`, { stage });
