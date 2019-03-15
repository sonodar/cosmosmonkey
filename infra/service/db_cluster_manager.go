package service

import (
	"github.com/aws/aws-sdk-go/service/rds"
	"github.com/sonodar/cosmosmonkey/domain/resource"
	"github.com/sonodar/cosmosmonkey/infra/util"
)

/**
 * Aurora クラスターの取得、起動、停止を行う。
 */
type DBClusterManager struct {
	service *rds.RDS
	tagKey  string
}

/**
 * DBClusterManager を生成する。
 */
func NewDBClusterManager(service *rds.RDS, tagKey string) *DBClusterManager {
	return &DBClusterManager{
		service: service,
		tagKey:  tagKey,
	}
}

func (this *DBClusterManager) SupportedType() string {
	return DBClusterType
}

/**
 * DBクラスターを起動する。
 */
func (this *DBClusterManager) Start(target resource.Resource) error {
	util.Debugf("called Start({%s})\n", resource.ToString(target))
	input := &rds.StartDBClusterInput{DBClusterIdentifier: target.Id()}
	if _, err := this.service.StartDBCluster(input); err != nil {
		util.Errorf("rds:StartDBCluster %v\n", err)
		return err
	}
	return nil
}

/**
 * DBクラスターを停止する。
 */
func (this *DBClusterManager) Stop(target resource.Resource) error {
	util.Debugf("called Stop({%s})\n", resource.ToString(target))
	input := &rds.StopDBClusterInput{DBClusterIdentifier: target.Id()}
	if _, err := this.service.StopDBCluster(input); err != nil {
		util.Errorf("rds:StopDBCluster %v\n", err)
		return err
	}
	return nil
}

func (this *DBClusterManager) EachResources(handler resource.ResourceHandler) error {
	util.Debugln("called EachResources()")
	return this.eachResources(handler, nil)
}

// Private Methods

func (this *DBClusterManager) eachResources(handler resource.ResourceHandler, marker *string) error {
	input := &rds.DescribeDBClustersInput{}
	if marker != nil {
		input.SetMarker(*marker)
	}

	output, err := this.service.DescribeDBClusters(input)
	if err != nil {
		util.Errorf("rds:DescribeDBClusters %v\n", err)
		return err
	}

	for _, cluster := range output.DBClusters {
		resource, err := this.toDomainObjectWhenTarget(cluster)
		if err != nil || resource == nil {
			return err
		}
		if err := handler(resource); err != nil {
			return err
		}
	}

	if output.Marker == nil {
		return nil
	}

	return this.eachResources(handler, output.Marker)
}

/**
 * タグを持っていた場合、DBCluster をドメインオブジェクトに変換する。
 */
func (this *DBClusterManager) toDomainObjectWhenTarget(cluster *rds.DBCluster) (resource.Resource, error) {
	tagValue, err := getDBTagValue(this.service, cluster.DBClusterArn, this.tagKey)
	if err != nil || tagValue == nil {
		return nil, err
	}
	if startStopTime, warn := util.ParseStartStopTime(*tagValue); warn != nil {
		util.Warnf("Skip %s [%s], because %s\n",
			DBClusterType, *cluster.DBClusterIdentifier, warn.Error())
		return nil, nil
	} else {
		return makeClusterResource(cluster, startStopTime), nil
	}
}
