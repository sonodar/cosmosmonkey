# CosmosMonkey

This is not Chaos-Monkey.

EC2インスタンスやRDSインスタンスを指定した時刻で自動起動・自動停止するスクリプトです。
起動時刻・停止時刻の指定は（2021/01 現在）タグで指定します。

サポートしている AWS リソースは現状では以下の通りです。

- EC2 Instance
- RDS Instance
- RDS Cluster
- Auto Scaling Group

## Specification

- `CosmosMonkey` はスケジュール実行される Lambda 関数です。
- `AutoStartStop` タグが付与されたリソースを指定した時間に起動・停止します。
- 起動するか、停止するかは 5 分間隔に実行される Lambda 関数により判断されます。

### AutoStartStop tag value format

基本的なタグの指定方法は `±0000 hh:mm-hh:mm` です。

```
+0900 09:00-21:00
```

最初の符号と 4 桁数値(`±0000`)がタイムゾーンを指定するオフセットです。見れば分かる通り、サマータイムには対応していません。
次の `hh:mm-hh:mm` が 24 時間表記の起動時刻です。この時間外は停止されるものとみなします。

上の例なら、日本時間の午前9時に起動し、午後9時に停止します。
仮に指定した時間の範囲外で起動した場合、次のスケジュール実行時に強制的に停止されます。

#### 特別な例

例えば `AutoScalingGroup` は起動・停止ではなく、キャパシティを `0` にすることで擬似的に停止させます。
ところが、起動時にどの程度のキャパシティで起動するかがわからないと起動することはできません。
そのため、`CosmosMonkey` では起動時に追加のパラメータを指定できるようにしています。

例えば `AutoScalingGroup` では、以下の起動時パラメータをタグで指定できます。

```
+0900 09:00-21:00 min=1 max=4 cap=2
```

詳細は各リソースの `追加パラメータ` の項を参照してください。

## Supported AWS resource types

### Common parameters

| name | type | summary | example |
| --- | --- | --- | --- |
| time offset | string | timezone offset | `+0900` |
| start time | time | start time of days | `09:00` |
| stop time | time | stop time of days | `20:00` |

### EC2 Instance

#### Additional Parameters

none.

### RDS Instance

#### Additional Parameters

none.

### RDS Cluster

#### Additional Parameters

none.

### AutoScalingGroup

#### Additional Parameters

| name | type | summary | parameter name pattern | example |
| --- | --- | --- | --- | --- |
| min size | number | MinSize of scaling policy | `/min(?:_?size)?/i` | `min=1`, `minsize=1` |
| max size | number | MaxSize of scaling policy | `/max(?:_?size)?/i` | `max=4`, max_size=4` |
| desired capacity | number | DesiredCapacity of scaling policy | `/(:?desired_?)?cap(?:acity)?/i` | `desired_capacity=2`, `capacity=2`, `desired=2`, `cap=2` |

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

## Contribution

大規模なリアーキテクチャを予定しているため、Pull Request してもらっても無駄になる可能性があります。  
具体的には以下の対応を予定しています。

- ResourceManager が SIP に違反しているので責務分割
- インターフェースの全面見直し
- ドメイン層など、レイヤーの厳密な定義

We are planning to re-architecture. Adding features may be wasted.

Specifically, we will make the following improvements.

- Improved ResourceManager SIP violations
- Interface redesign
- Strict layer definition
