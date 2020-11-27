// /**
//  * RDS インスタンスの取得、起動、停止を行う。
//  */
// type DBInstanceManager struct {
// 	service *rds.RDS
// 	tagKey  string
// }
//
// /**
//  * DBInstanceManager を生成する。
//  */
// func NewDBInstanceManager(service *rds.RDS, tagKey string) *DBInstanceManager {
// 	return &DBInstanceManager{service: service, tagKey: tagKey}
// }
//
// func (this *DBInstanceManager) SupportedType() string {
// 	return DBInstanceType
// }
//
// /**
//  * DB インスタンスを起動する。
//  */
// func (this *DBInstanceManager) Start(target resource.Resource) error {
// 	util.Debugf("called Start({%s})\n", resource.ToString(target))
// 	input := &rds.StartDBInstanceInput{DBInstanceIdentifier: target.Id()}
// 	if _, err := this.service.StartDBInstance(input); err != nil {
// 		util.Errorf("rds:StartDBInstance %v\n", err)
// 		return err
// 	}
// 	return nil
// }
//
// /**
//  * DB インスタンスを停止する。
//  */
// func (this *DBInstanceManager) Stop(target resource.Resource) error {
// 	util.Debugf("called Stop({%s})\n", resource.ToString(target))
// 	input := &rds.StopDBInstanceInput{DBInstanceIdentifier: target.Id()}
// 	if _, err := this.service.StopDBInstance(input); err != nil {
// 		util.Errorf("rds:StopDBInstance %v\n", err)
// 		return err
// 	}
// 	return nil
// }
//
// func (this *DBInstanceManager) EachResources(handler resource.ResourceHandler) error {
// 	util.Debugln("called EachResources()")
// 	return this.eachResources(handler, nil)
// }
//
// // Private Methods
//
// func (this *DBInstanceManager) eachResources(handler resource.ResourceHandler, marker *string) error {
// 	input := &rds.DescribeDBInstancesInput{}
// 	if marker != nil {
// 		input.SetMarker(*marker)
// 	}
//
// 	output, err := this.service.DescribeDBInstances(input)
// 	if err != nil {
// 		util.Errorf("rds:DescribeDBClusters %v\n", err)
// 		return err
// 	}
//
// 	for _, instance := range output.DBInstances {
// 		resource, err := this.newInstanceResource(instance)
// 		if err != nil || resource == nil {
// 			return err
// 		}
// 		if err := handler(resource); err != nil {
// 			return err
// 		}
// 	}
//
// 	if output.Marker == nil {
// 		return nil
// 	}
//
// 	return this.eachResources(handler, output.Marker)
// }
//
// /**
//  * dbInstanceResource を生成する。
//  */
// func (this *DBInstanceManager) newInstanceResource(instance *rds.DBInstance) (resource.Resource, error) {
// 	tagValue, err := getDBTagValue(this.service, instance.DBInstanceArn, this.tagKey)
// 	if err != nil || tagValue == nil {
// 		return nil, err
// 	}
//
// 	startStopTime, warn := util.ParseStartStopTime(*tagValue)
//
// 	if warn != nil {
// 		util.Warnf("Skip %s [%s], because %v\n",
// 			DBInstanceType, *instance.DBClusterIdentifier, warn)
// 		return nil, nil
// 	}
//
// 	return &dbInstanceResource{
// 		instance:      instance,
// 		startStopTime: *startStopTime,
// 	}, nil
// }
import { RDS } from 'aws-sdk'
import { ResourceHandler, ResourceManager, ResourceType } from 'models'
import { RDSInstanceResource } from './RDSInstanceResource'
import {getRDSTagValue} from '../RDSTagValueParser'
import {TagValueParser} from '../../TagValueParser'

export class RDSInstanceResourceManager implements ResourceManager<RDSInstanceResource> {
	public readonly supportedType = ResourceType.RDS_INSTANCE

	constructor(private readonly rds: RDS, private readonly tagName: string) {}

	async eachResources(handler: ResourceHandler<RDSInstanceResource>): Promise<void> {
		for await (const instance of getTargetInstances(this.rds, this.tagName)) {
			const resource = await toResource(this.rds, instance, this.tagName)
			if (resource) await handler(resource)
		}
	}

	async start(resource: RDSInstanceResource): Promise<void> {
		const request: RDS.StartDBInstanceMessage = { DBInstanceIdentifier: resource.id }
		await this.rds.startDBInstance(request).promise()
	}

	async stop(resource: RDSInstanceResource): Promise<void> {
		const request: RDS.StopDBInstanceMessage = { DBInstanceIdentifier: resource.id }
		await this.rds.stopDBInstance(request).promise()
	}
}

/**
 * RDS はタグでの検索に対応していないため、全件取得して N+1 でタグを取得する。
 * TODO: 現在は ResourceManager の search API でタグ検索ができるので後ほどリファクタリング。
 */
async function* getTargetInstances(rds: RDS, tagName: string, marker?: string): AsyncGenerator<RDS.DBInstance> {
	const request: RDS.DescribeDBInstancesMessage = {}
	if (marker) request.Marker = marker
	const { DBInstances, Marker } = await rds.describeDBInstances(request).promise()
	for (const instance of (DBInstances || [])) yield instance
	if (Marker) return getTargetInstances(rds, tagName, Marker)
}

/**
 * 指定したタグを持っていた場合のみ、DBInstance をドメインオブジェクトに変換する。
 */
async function toResource(rds: RDS, cluster: RDS.DBInstance, tagName: string): Promise<RDSInstanceResource | null> {
	const tag = await getRDSTagValue(rds, cluster.DBInstanceArn || '', tagName)
	if (!tag) return null
	const tagValue = TagValueParser.parse(tag)
	if (!tagValue) return null
	return new RDSInstanceResource(cluster, tagValue.startStopTime)
}
