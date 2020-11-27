package service

import (
	"fmt"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/autoscaling"
	"github.com/sonodar/cosmosmonkey/domain/resource"
	"github.com/sonodar/cosmosmonkey/domain/time"
	"github.com/sonodar/cosmosmonkey/infra/util"
)

type AutoScalingManager struct {
	service           *autoscaling.AutoScaling
	tagKey            string
	maxConcurrentSize int
}

/**
 * AutoScalingManager を生成する。
 */
func NewAutoScalingManager(session *session.Session, tagKey string) *AutoScalingManager {
	return &AutoScalingManager{
		service: autoscaling.New(session),
		tagKey:  tagKey,
	}
}

func (this *AutoScalingManager) SupportedType() string {
	return AutoScalingType
}

/**
 * AutoScalingGroup の起動数を元に戻す。
 */
func (this *AutoScalingManager) Start(target resource.Resource) error {
	util.Debugf("called Start({%s})\n", resource.ToString(target))
	group, _ := target.(*autoScalingGroupResource)
	input := &autoscaling.UpdateAutoScalingGroupInput{
		AutoScalingGroupName: group.Name(),
		MinSize:              group.originalPolicy.getMinSize(),
		MaxSize:              group.originalPolicy.getMaxSize(),
		DesiredCapacity:      group.originalPolicy.getDesiredCapacity(),
	}
	if _, err := this.service.UpdateAutoScalingGroup(input); err != nil {
		util.Errorf("autoscaling:UpdateAutoScalingGroup %v\n", err)
		return err
	}
	return nil
}

/**
 * AutoScalingGroup の起動数を 0 にする。
 */
func (this *AutoScalingManager) Stop(target resource.Resource) error {
	util.Debugf("called Stop({%s})\n", resource.ToString(target))
	input := &autoscaling.UpdateAutoScalingGroupInput{
		AutoScalingGroupName: target.Name(),
		MinSize:              aws.Int64(0),
		MaxSize:              aws.Int64(0),
		DesiredCapacity:      aws.Int64(0),
	}
	if _, err := this.service.UpdateAutoScalingGroup(input); err != nil {
		util.Errorf("autoscaling:UpdateAutoScalingGroup %v\n", err)
		return err
	}
	return nil
}

func (this *AutoScalingManager) EachResources(handler resource.ResourceHandler) error {
	util.Debugln("called EachResources()")
	return this.eachResources(handler, nil)
}

// Private Methods

func (this *AutoScalingManager) eachResources(handler resource.ResourceHandler, nextToken *string) error {
	input := &autoscaling.DescribeAutoScalingGroupsInput{}
	if nextToken != nil {
		input.SetNextToken(*nextToken)
	}

	output, err := this.service.DescribeAutoScalingGroups(input)
	if err != nil {
		util.Errorf("autoscaling:DescribeAutoScalingGroups %v\n", err)
		return err
	}

	for _, group := range output.AutoScalingGroups {
		resource := this.newAutoScalingGroupResource(group)
		if resource == nil {
			continue
		}
		if err := handler(resource); err != nil {
			return err
		}
	}

	if output.NextToken == nil {
		return nil
	}

	return this.eachResources(handler, output.NextToken)
}

func (this *AutoScalingManager) newAutoScalingGroupResource(group *autoscaling.Group) *autoScalingGroupResource {
	if startStopTime, originPolicy, ok := this.getGroupMetadata(group); !ok {
		return nil
	} else {
		return &autoScalingGroupResource{
			group:          group,
			originalPolicy: originPolicy,
			startStopTime:  startStopTime,
		}
	}
}

func (this *AutoScalingManager) getStartStopTagValue(group *autoscaling.Group) *string {
	for _, tag := range group.Tags {
		if *tag.Key == this.tagKey {
			return tag.Value
		}
	}
	return nil
}

func (this *AutoScalingManager) getGroupMetadata(group *autoscaling.Group) (*time.StartStopTime, *originAutoScalingPolicy, bool) {
	tagValue := this.getStartStopTagValue(group)
	if tagValue == nil {
		return nil, nil, false
	}
	return this.toGroupMetadata(group, *tagValue)
}

/**
 * タグの値を起動・停止時刻およびスケーリングポリシーに変換する。
 */
func (this *AutoScalingManager) toGroupMetadata(group *autoscaling.Group, tagValue string) (*time.StartStopTime, *originAutoScalingPolicy, bool) {
	timePart, policyPart, warn := splitTimeAndProps(tagValue)
	if warn != nil {
		util.Warnf("Skip %s %s, because %s %v\n",
			AutoScalingType, *group.AutoScalingGroupName, this.tagKey, warn)
		return nil, nil, false
	}

	startStopTime, warn := util.ParseStartStopTime(timePart)
	if warn != nil {
		util.Warnf("Skip %s %s, because %s %v\n",
			AutoScalingType, *group.AutoScalingGroupName, this.tagKey, warn)
		return nil, nil, false
	}

	scalingPolicy := toOriginScalingPolicy(policyPart)

	util.Debugf("Scaling Policy of %s %s = %s\n",
		scalingPolicy.toString(), AutoScalingType, *group.AutoScalingGroupName)

	return startStopTime, scalingPolicy, true
}

// Private Functions

func splitTimeAndProps(tagValue string) (string, string, error) {
	values := strings.SplitN(tagValue, "|", 2)
	if len(values) > 1 {
		return values[0], values[1], nil
	}
	return "", "", fmt.Errorf("'%s' has no starting scaling policy attributes", tagValue)
}

func toOriginScalingPolicy(tagValue string) *originAutoScalingPolicy {
	policy := originAutoScalingPolicy{}
	keyValues := util.ParseKeyValues(tagValue)
	for key, value := range keyValues {
		switch {
		case isMinSize(key):
			policy.minSize = util.ToInt64P(value)
		case isMaxSize(key):
			policy.maxSize = util.ToInt64P(value)
		case isDesiredCapacity(key):
			policy.desiredCapacity = util.ToInt64P(value)
		}
	}
	return &policy
}

func isMinSize(key string) bool {
	return strings.HasPrefix(strings.ToLower(key), "min")
}

func isMaxSize(key string) bool {
	return strings.HasPrefix(strings.ToLower(key), "max")
}

func isDesiredCapacity(key string) bool {
	lower := strings.ToLower(key)
	return strings.HasPrefix(lower, "desire") || strings.HasPrefix(lower, "cap")
}
