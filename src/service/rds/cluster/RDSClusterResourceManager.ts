// /**
//  * Aurora クラスターの取得、起動、停止を行う。
//  */
// type DBClusterManager struct {
// 	service *rds.RDS
// 	tagKey  string
// }
//
// /**
//  * DBClusterManager を生成する。
//  */
// func NewDBClusterManager(service *rds.RDS, tagKey string) *DBClusterManager {
// 	return &DBClusterManager{
// 		service: service,
// 		tagKey:  tagKey,
// 	}
// }
//
// func (this *DBClusterManager) SupportedType() string {
// 	return DBClusterType
// }
//
// /**
//  * DBクラスターを起動する。
//  */
// func (this *DBClusterManager) Start(target resource.Resource) error {
// 	util.Debugf("called Start({%s})\n", resource.ToString(target))
// 	input := &rds.StartDBClusterInput{DBClusterIdentifier: target.Id()}
// 	if _, err := this.service.StartDBCluster(input); err != nil {
// 		util.Errorf("rds:StartDBCluster %v\n", err)
// 		return err
// 	}
// 	return nil
// }
//
// /**
//  * DBクラスターを停止する。
//  */
// func (this *DBClusterManager) Stop(target resource.Resource) error {
// 	util.Debugf("called Stop({%s})\n", resource.ToString(target))
// 	input := &rds.StopDBClusterInput{DBClusterIdentifier: target.Id()}
// 	if _, err := this.service.StopDBCluster(input); err != nil {
// 		util.Errorf("rds:StopDBCluster %v\n", err)
// 		return err
// 	}
// 	return nil
// }
//
// func (this *DBClusterManager) EachResources(handler resource.ResourceHandler) error {
// 	util.Debugln("called EachResources()")
// 	return this.eachResources(handler, nil)
// }
//
// // Private Methods
//
// func (this *DBClusterManager) eachResources(handler resource.ResourceHandler, marker *string) error {
// 	input := &rds.DescribeDBClustersInput{}
// 	if marker != nil {
// 		input.SetMarker(*marker)
// 	}
//
// 	output, err := this.service.DescribeDBClusters(input)
// 	if err != nil {
// 		util.Errorf("rds:DescribeDBClusters %v\n", err)
// 		return err
// 	}
//
// 	for _, cluster := range output.DBClusters {
// 		resource, err := this.toDomainObjectWhenTarget(cluster)
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
//  * タグを持っていた場合、DBCluster をドメインオブジェクトに変換する。
//  */
// func (this *DBClusterManager) toDomainObjectWhenTarget(cluster *rds.DBCluster) (resource.Resource, error) {
// 	tagValue, err := getDBTagValue(this.service, cluster.DBClusterArn, this.tagKey)
// 	if err != nil || tagValue == nil {
// 		return nil, err
// 	}
// 	if startStopTime, warn := util.ParseStartStopTime(*tagValue); warn != nil {
// 		util.Warnf("Skip %s [%s], because %s\n",
// 			DBClusterType, *cluster.DBClusterIdentifier, warn.Error())
// 		return nil, nil
// 	} else {
// 		return makeClusterResource(cluster, startStopTime), nil
// 	}
// }
import { RDS } from 'aws-sdk'
import { ResourceHandler, ResourceManager, ResourceType } from 'models'
import { RDSClusterResource } from './RDSClusterResource'
import {getRDSTagValue} from '../RDSTagValueParser'
import {TagValueParser} from '../../TagValueParser'

export class RDSClusterResourceManager implements ResourceManager<RDSClusterResource> {
	public readonly supportedType = ResourceType.RDS_CLUSTER

	constructor(private readonly rds: RDS, private readonly tagName: string) {}

	async eachResources(handler: ResourceHandler<RDSClusterResource>): Promise<void> {
		for await (const cluster of getTargetClusters(this.rds, this.tagName)) {
			const resource = await toResource(this.rds, cluster, this.tagName)
			if (resource) await handler(resource)
		}
	}

	async start(resource: RDSClusterResource): Promise<void> {
		const request: RDS.StartDBClusterMessage = { DBClusterIdentifier: resource.id }
		await this.rds.startDBCluster(request).promise()
	}

	async stop(resource: RDSClusterResource): Promise<void> {
		const request: RDS.StopDBClusterMessage = { DBClusterIdentifier: resource.id }
		await this.rds.stopDBCluster(request).promise()
	}
}

/**
 * RDS はタグでの検索に対応していないため、全件取得して N+1 でタグを取得する。
 * TODO: 現在は ResourceManager の search API でタグ検索ができるので後ほどリファクタリング。
 */
async function* getTargetClusters(rds: RDS, tagName: string, marker?: string): AsyncGenerator<RDS.DBCluster> {
	const request: RDS.DescribeDBClustersMessage = {}
	if (marker) request.Marker = marker
	const { DBClusters, Marker } = await rds.describeDBClusters(request).promise()
	for (const cluster of (DBClusters || [])) yield cluster
	if (Marker) return getTargetClusters(rds, tagName, Marker)
}

/**
 * 指定したタグを持っていた場合のみ、DBCluster をドメインオブジェクトに変換する。
 */
async function toResource(rds: RDS, cluster: RDS.DBCluster, tagName: string): Promise<RDSClusterResource | null> {
	const tag = await getRDSTagValue(rds, cluster.DBClusterArn || '', tagName)
	if (!tag) return null
	const tagValue = TagValueParser.parse(tag)
	if (!tagValue) return null
	return new RDSClusterResource(cluster, tagValue.startStopTime)
}
