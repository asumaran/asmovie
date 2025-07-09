#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { ASMovieEC2Stack } from "./lib/asmovie-ec2-stack";

const app = new App();

new ASMovieEC2Stack(app, "ASMovieEC2Stack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
});

app.synth();
