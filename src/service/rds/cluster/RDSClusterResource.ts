// const DBClusterType = "AWS::RDS::DBCluster"
//
// type dbClusterResource struct {
// 	cluster       *rds.DBCluster
// 	startStopTime *time.StartStopTime
// }
//
// func makeClusterResource(cluster *rds.DBCluster, startStopTime *time.StartStopTime) *dbClusterResource {
// 	return &dbClusterResource{
// 		cluster:       cluster,
// 		startStopTime: startStopTime,
// 	}
// }
//
// func (this *dbClusterResource) Type() string {
// 	return DBClusterType
// }
//
// func (this *dbClusterResource) Id() *string {
// 	return this.cluster.DBClusterIdentifier
// }
//
// func (this *dbClusterResource) Name() *string {
// 	return this.Id()
// }
//
// func (this *dbClusterResource) StartStopTime() *time.StartStopTime {
// 	return this.startStopTime
// }
//
// func (this *dbClusterResource) CanStart() bool {
// 	return *this.cluster.Status == "stopped"
// }
//
// func (this *dbClusterResource) CanStop() bool {
// 	return *this.cluster.Status == "available"
// }
import { RDS } from 'aws-sdk'
import {Resource, ResourceType, StartStopTime } from 'models'

export class RDSClusterResource implements Resource {
	public readonly type = ResourceType.RDS_CLUSTER
	public readonly id: string
	private readonly status: string

	constructor(cluster: RDS.DBCluster, public readonly startStopTime: StartStopTime) {
		this.id = cluster.DBClusterIdentifier || ''
		this.status = cluster.Status || ''
	}

	get name() {
		return this.id
	}

	get canStart() {
		return this.status === 'stopped'
	}

	get canStop() {
		return this.status === 'available'
	}
}
