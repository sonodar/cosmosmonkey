// TODO ドメイン層の持ち物ではないので後にリファクタ
export enum ResourceType {
  EC2_INSTANCE = 'AWS::EC2::Instance',
  RDS_INSTANCE = 'AWS::RDS::DBInstance',
  RDS_CLUSTER = 'AWS::RDS::DBCluster',
  AUTO_SCALING_GROUP = 'AWS::AutoScaling::Group',
  ALL_SUPPORTED = 'AWS::AllSupported',
}
