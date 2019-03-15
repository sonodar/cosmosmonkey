package service

import (
	"github.com/aws/aws-sdk-go/service/autoscaling"

	"github.com/sonodar/cosmosmonkey/domain/time"
)

const AutoScalingType = "AWS::AutoScaling::Group"

type autoScalingGroupResource struct {
	group          *autoscaling.Group
	originalPolicy *originAutoScalingPolicy
	startStopTime  *time.StartStopTime
}

func (this *autoScalingGroupResource) Type() string {
	return AutoScalingType
}

func (this *autoScalingGroupResource) Id() *string {
	return this.Name()
}

func (this *autoScalingGroupResource) Name() *string {
	return this.group.AutoScalingGroupName
}

func (this *autoScalingGroupResource) StartStopTime() *time.StartStopTime {
	return this.startStopTime
}

func (this *autoScalingGroupResource) CanStart() bool {
	return *this.group.DesiredCapacity == 0 && *this.group.MaxSize == 0 && *this.group.MinSize == 0
}

func (this *autoScalingGroupResource) CanStop() bool {
	return *this.group.DesiredCapacity > 0 || *this.group.MaxSize > 0 || *this.group.MinSize > 0
}
