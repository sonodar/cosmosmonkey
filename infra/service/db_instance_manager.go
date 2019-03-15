package service

import (
	"github.com/aws/aws-sdk-go/service/rds"

	"github.com/sonodar/cosmosmonkey/domain/resource"
	"github.com/sonodar/cosmosmonkey/infra/util"
)

/**
 * RDS インスタンスの取得、起動、停止を行う。
 */
type DBInstanceManager struct {
	service *rds.RDS
	tagKey  string
}

/**
 * DBInstanceManager を生成する。
 */
func NewDBInstanceManager(service *rds.RDS, tagKey string) *DBInstanceManager {
	return &DBInstanceManager{service: service, tagKey: tagKey}
}

func (this *DBInstanceManager) SupportedType() string {
	return DBInstanceType
}

/**
 * DB インスタンスを起動する。
 */
func (this *DBInstanceManager) Start(target resource.Resource) error {
	util.Debugf("called Start({%s})\n", resource.ToString(target))
	input := &rds.StartDBInstanceInput{DBInstanceIdentifier: target.Id()}
	if _, err := this.service.StartDBInstance(input); err != nil {
		util.Errorf("rds:StartDBInstance %v\n", err)
		return err
	}
	return nil
}

/**
 * DB インスタンスを停止する。
 */
func (this *DBInstanceManager) Stop(target resource.Resource) error {
	util.Debugf("called Stop({%s})\n", resource.ToString(target))
	input := &rds.StopDBInstanceInput{DBInstanceIdentifier: target.Id()}
	if _, err := this.service.StopDBInstance(input); err != nil {
		util.Errorf("rds:StopDBInstance %v\n", err)
		return err
	}
	return nil
}

func (this *DBInstanceManager) EachResources(handler resource.ResourceHandler) error {
	util.Debugln("called EachResources()")
	return this.eachResources(handler, nil)
}

// Private Methods

func (this *DBInstanceManager) eachResources(handler resource.ResourceHandler, marker *string) error {
	input := &rds.DescribeDBInstancesInput{}
	if marker != nil {
		input.SetMarker(*marker)
	}

	output, err := this.service.DescribeDBInstances(input)
	if err != nil {
		util.Errorf("rds:DescribeDBClusters %v\n", err)
		return err
	}

	for _, instance := range output.DBInstances {
		resource, err := this.newInstanceResource(instance)
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
 * dbInstanceResource を生成する。
 */
func (this *DBInstanceManager) newInstanceResource(instance *rds.DBInstance) (resource.Resource, error) {
	tagValue, err := getDBTagValue(this.service, instance.DBInstanceArn, this.tagKey)
	if err != nil || tagValue == nil {
		return nil, err
	}

	startStopTime, warn := util.ParseStartStopTime(*tagValue)

	if warn != nil {
		util.Warnf("Skip %s [%s], because %v\n",
			DBInstanceType, *instance.DBClusterIdentifier, warn)
		return nil, nil
	}

	return &dbInstanceResource{
		instance:      instance,
		startStopTime: *startStopTime,
	}, nil
}
