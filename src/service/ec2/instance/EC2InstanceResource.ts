package service

import (
	"fmt"
	"github.com/aws/aws-sdk-go/service/ec2"
	"github.com/sonodar/cosmosmonkey/domain/time"
)

const EC2InstanceType = "AWS::EC2::Instance"

type ec2InstanceResource struct {
	instance      *ec2.Instance
	startStopTime *time.StartStopTime
	_name         *string
}

func (this *ec2InstanceResource) toString() string {
	return fmt.Sprintf("%s Id = %s, Name = %s, State = %s, %s",
		EC2InstanceType, *this.Id(), *this.Name(), this.state(), this.startStopTime.ToString())
}

func (this *ec2InstanceResource) Type() string {
	return EC2InstanceType
}

func (this *ec2InstanceResource) Id() *string {
	return this.instance.InstanceId
}

func (this *ec2InstanceResource) Name() *string {
	if this._name == nil {
		this._name = getEC2InstanceTagValue(this.instance, "Name")
		if this._name == nil {
			this._name = this.Id()
		}
	}
	return this._name
}

func (this *ec2InstanceResource) StartStopTime() *time.StartStopTime {
	return this.startStopTime
}

func (this *ec2InstanceResource) CanStart() bool {
	return this.state() == "stopped"
}

func (this *ec2InstanceResource) CanStop() bool {
	return this.state() == "running"
}

func (this *ec2InstanceResource) state() string {
	return *this.instance.State.Name
}

// Private Functions

func getEC2InstanceTagValue(instance *ec2.Instance, tagKey string) *string {
	for _, tag := range instance.Tags {
		if *tag.Key == tagKey {
			return tag.Value
		}
	}
	return nil
}
