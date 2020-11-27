package service

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"

	"github.com/sonodar/cosmosmonkey/domain/resource"
	"github.com/sonodar/cosmosmonkey/domain/time"
	"github.com/sonodar/cosmosmonkey/infra/util"
)

/**
 * EC2 インスタンスの検索、起動、停止を行う。
 */
type EC2InstanceManager struct {
	service *ec2.EC2
	tagKey  string
}

/**
 * EC2InstanceManager を生成する。
 */
func NewEC2InstanceManager(session *session.Session, tagKey string) *EC2InstanceManager {
	return &EC2InstanceManager{service: ec2.New(session), tagKey: tagKey}
}

func (this *EC2InstanceManager) SupportedType() string {
	return EC2InstanceType
}

/**
 * リソースを起動する。
 */
func (this *EC2InstanceManager) Start(target resource.Resource) error {
	util.Debugf("called Start({%s})\n", resource.ToString(target))
	input := &ec2.StartInstancesInput{InstanceIds: []*string{target.Id()}}
	if _, err := this.service.StartInstances(input); err != nil {
		util.Errorf("ec2:StartInstances %v\n", err)
		return err
	}
	return nil
}

/**
 * リソースを停止する。
 */
func (this *EC2InstanceManager) Stop(target resource.Resource) error {
	util.Debugf("called Stop({%s})\n", resource.ToString(target))
	input := &ec2.StopInstancesInput{InstanceIds: []*string{target.Id()}}
	if _, err := this.service.StopInstances(input); err != nil {
		util.Errorf("ec2:StopInstances %v\n", err)
		return err
	}
	return nil
}

func (this *EC2InstanceManager) EachResources(handler resource.ResourceHandler) error {
	util.Debugln("called EachResources()")
	return this.eachResources(handler, nil)
}

// Private Methods

func (this *EC2InstanceManager) eachResources(handler resource.ResourceHandler, nextToken *string) error {
	input := &ec2.DescribeInstancesInput{
		Filters: []*ec2.Filter{
			{Name: aws.String("tag-key"), Values: []*string{&this.tagKey}},
		},
	}
	if nextToken != nil {
		input.SetNextToken(*nextToken)
	}

	output, err := this.service.DescribeInstances(input)
	if err != nil {
		util.Errorf("ec2:DescribeInstances %v\n", err)
		return err
	}

	for _, reservation := range output.Reservations {
		for _, instance := range reservation.Instances {
			resource := this.newInstanceResource(instance)
			if resource == nil {
				continue
			}
			if err := handler(resource); err != nil {
				return err
			}
		}
	}

	if output.NextToken == nil {
		return nil
	}

	return this.eachResources(handler, output.NextToken)
}

/**
 * ec2InstanceResource を生成する。
 */
func (this *EC2InstanceManager) newInstanceResource(instance *ec2.Instance) *ec2InstanceResource {
	if startStopTime := this.getStartStopTime(instance); startStopTime != nil {
		return &ec2InstanceResource{instance: instance, startStopTime: startStopTime}
	}
	return nil
}

/**
 * EC2 インスタンスのタグから起動・停止時刻を取得する。
 */
func (this *EC2InstanceManager) getStartStopTime(instance *ec2.Instance) *time.StartStopTime {
	autoStartStopValue := *getEC2InstanceTagValue(instance, this.tagKey)
	startStopTime, err := util.ParseStartStopTime(autoStartStopValue)
	if err != nil {
		util.Warnf("Skip %s %s, because %s [%s] is invalid\n",
			EC2InstanceType, *instance.InstanceId, this.tagKey, autoStartStopValue)
		return nil
	}
	return startStopTime
}
