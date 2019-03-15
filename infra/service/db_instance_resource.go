package service

import (
	"github.com/aws/aws-sdk-go/service/rds"
	"github.com/sonodar/cosmosmonkey/domain/time"
)

const DBInstanceType = "AWS::RDS::DBInstance"

type dbInstanceResource struct {
	instance      *rds.DBInstance
	startStopTime time.StartStopTime
}

func (this *dbInstanceResource) Type() string {
	return DBInstanceType
}

func (this *dbInstanceResource) Id() *string {
	return this.instance.DBInstanceIdentifier
}

func (this *dbInstanceResource) Name() *string {
	return this.Id()
}

func (this *dbInstanceResource) StartStopTime() *time.StartStopTime {
	return &this.startStopTime
}

func (this *dbInstanceResource) CanStart() bool {
	return *this.instance.DBInstanceStatus == "stopped"
}

func (this *dbInstanceResource) CanStop() bool {
	return *this.instance.DBInstanceStatus == "available"
}
