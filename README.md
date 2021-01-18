# CosmosMonkey

This is not Chaos-Monkey.

EC2インスタンスやRDSインスタンスを指定した時刻で自動起動・自動停止するスクリプトです。
起動時刻・停止時刻の指定は（2021/01 現在）タグで指定します。

## Deploy

* AWS SAM CLI - [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).
* Node.js - [Install Node.js 12](https://nodejs.org/en/), including the npm package management tool.
* Yarn - [Install Yarn](https://classic.yarnpkg.com/en/docs/install).

```bash
yarn build
sam deploy --guided
```

## Use the AWS SAM CLI to build and test locally

Build your application by using the `yarn build` command.

```bash
yarn build
DRY_RUN=true sam local invoke --no-event
```

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
aws cloudformation delete-stack --stack-name sam-app
```
