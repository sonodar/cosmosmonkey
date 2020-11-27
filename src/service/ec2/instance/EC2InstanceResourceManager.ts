// /**
//  * EC2 インスタンスの検索、起動、停止を行う。
//  */
// type EC2InstanceManager struct {
// 	service *ec2.EC2
// 	tagKey  string
// }
//
// /**
//  * EC2InstanceManager を生成する。
//  */
// func NewEC2InstanceManager(session *session.Session, tagKey string) *EC2InstanceManager {
// 	return &EC2InstanceManager{service: ec2.New(session), tagKey: tagKey}
// }
//
// func (this *EC2InstanceManager) SupportedType() string {
// 	return EC2InstanceType
// }
//
// /**
//  * リソースを起動する。
//  */
// func (this *EC2InstanceManager) Start(target resource.Resource) error {
// 	util.Debugf("called Start({%s})\n", resource.ToString(target))
// 	input := &ec2.StartInstancesInput{InstanceIds: []*string{target.Id()}}
// 	if _, err := this.service.StartInstances(input); err != nil {
// 		util.Errorf("ec2:StartInstances %v\n", err)
// 		return err
// 	}
// 	return nil
// }
//
// /**
//  * リソースを停止する。
//  */
// func (this *EC2InstanceManager) Stop(target resource.Resource) error {
// 	util.Debugf("called Stop({%s})\n", resource.ToString(target))
// 	input := &ec2.StopInstancesInput{InstanceIds: []*string{target.Id()}}
// 	if _, err := this.service.StopInstances(input); err != nil {
// 		util.Errorf("ec2:StopInstances %v\n", err)
// 		return err
// 	}
// 	return nil
// }
//
// func (this *EC2InstanceManager) EachResources(handler resource.ResourceHandler) error {
// 	util.Debugln("called EachResources()")
// 	return this.eachResources(handler, nil)
// }
//
// // Private Methods
//
// func (this *EC2InstanceManager) eachResources(handler resource.ResourceHandler, nextToken *string) error {
// 	input := &ec2.DescribeInstancesInput{
// 		Filters: []*ec2.Filter{
// 			{Name: aws.String("tag-key"), Values: []*string{&this.tagKey}},
// 		},
// 	}
// 	if nextToken != nil {
// 		input.SetNextToken(*nextToken)
// 	}
//
// 	output, err := this.service.DescribeInstances(input)
// 	if err != nil {
// 		util.Errorf("ec2:DescribeInstances %v\n", err)
// 		return err
// 	}
//
// 	for _, reservation := range output.Reservations {
// 		for _, instance := range reservation.Instances {
// 			resource := this.newInstanceResource(instance)
// 			if resource == nil {
// 				continue
// 			}
// 			if err := handler(resource); err != nil {
// 				return err
// 			}
// 		}
// 	}
//
// 	if output.NextToken == nil {
// 		return nil
// 	}
//
// 	return this.eachResources(handler, output.NextToken)
// }
//
// /**
//  * ec2InstanceResource を生成する。
//  */
// func (this *EC2InstanceManager) newInstanceResource(instance *ec2.Instance) *ec2InstanceResource {
// 	if startStopTime := this.getStartStopTime(instance); startStopTime != nil {
// 		return &ec2InstanceResource{instance: instance, startStopTime: startStopTime}
// 	}
// 	return nil
// }
//
// /**
//  * EC2 インスタンスのタグから起動・停止時刻を取得する。
//  */
// func (this *EC2InstanceManager) getStartStopTime(instance *ec2.Instance) *time.StartStopTime {
// 	autoStartStopValue := *getEC2InstanceTagValue(instance, this.tagKey)
// 	startStopTime, err := util.ParseStartStopTime(autoStartStopValue)
// 	if err != nil {
// 		util.Warnf("Skip %s %s, because %s [%s] is invalid\n",
// 			EC2InstanceType, *instance.InstanceId, this.tagKey, autoStartStopValue)
// 		return nil
// 	}
// 	return startStopTime
// }
import { EC2 } from 'aws-sdk'
import { ResourceHandler, ResourceType, ResourceManager } from 'models'
import { EC2InstanceResource } from './EC2InstanceResource'
import { TagValueParser } from '../../TagValueParser'

export class EC2InstanceResourceManager implements ResourceManager<EC2InstanceResource> {
	public readonly supportedType = ResourceType.EC2_INSTANCE

	constructor(private readonly ec2: EC2, private readonly tagName: string) {}

	async eachResources(handler: ResourceHandler<EC2InstanceResource>): Promise<void> {
		for await (const instance of getTargetInstances(this.ec2, this.tagName)) {
			const resource = toResource(instance, this.tagName)
			if (!resource) continue
			await handler(resource)
		}
	}

	async start(resource: EC2InstanceResource): Promise<void> {
		console.info(`${resource.type} "${resource.name}" starting ...`)
		await this.ec2.startInstances({ InstanceIds: [resource.id] }).promise()
	}

	async stop(resource: EC2InstanceResource): Promise<void> {
		console.info(`${resource.type} "${resource.name}" stopping ...`)
		await this.ec2.stopInstances({ InstanceIds: [resource.id] }).promise()
	}
}

async function* getTargetInstances(ec2: EC2, tagName: string, nextToken?: string): AsyncGenerator<EC2.Instance> {
	const request: EC2.DescribeInstancesRequest = {
		Filters: [
			{ Name: 'tag-key', Values: [tagName] },
			{ Name: 'instance-state-name', Values: ['running', 'stopped'] },
		],
	}
	if (nextToken) {
		request.NextToken = nextToken
	}
	const { Reservations, NextToken } = await ec2.describeInstances(request).promise()
	const instances = (Reservations || []).map(reservation => reservation.Instances || []).flat()
	for (const instance of instances) yield instance
	if (NextToken) return getTargetInstances(ec2, tagName, NextToken)
}

function toResource(instance: EC2.Instance, tagName: string): EC2InstanceResource | null {
	const value = getTagValue(instance, tagName)
	if (!value) return null
	const tagValue = TagValueParser.parse(value)
	if (!tagValue) return null
	return new EC2InstanceResource(instance, tagValue.startStopTime)
}

function getTagValue(instance: EC2.Instance, name: string): string | undefined {
	const tag = (instance.Tags || []).find(t => t.Key === name)
	if (tag) return tag.Value
	console.warn(`missing ${name} tag`)
	return
}
