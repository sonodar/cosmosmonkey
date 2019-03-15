package service

import (
	"github.com/aws/aws-sdk-go/service/rds"
	"github.com/sonodar/cosmosmonkey/domain/time"
)

const DBClusterType = "AWS::RDS::DBCluster"

type dbClusterResource struct {
	cluster       *rds.DBCluster
	startStopTime *time.StartStopTime
}

func makeClusterResource(cluster *rds.DBCluster, startStopTime *time.StartStopTime) *dbClusterResource {
	return &dbClusterResource{
		cluster:       cluster,
		startStopTime: startStopTime,
	}
}

func (this *dbClusterResource) Type() string {
	return DBClusterType
}

func (this *dbClusterResource) Id() *string {
	return this.cluster.DBClusterIdentifier
}

func (this *dbClusterResource) Name() *string {
	return this.Id()
}

func (this *dbClusterResource) StartStopTime() *time.StartStopTime {
	return this.startStopTime
}

func (this *dbClusterResource) CanStart() bool {
	return *this.cluster.Status == "stopped"
}

func (this *dbClusterResource) CanStop() bool {
	return *this.cluster.Status == "available"
}
