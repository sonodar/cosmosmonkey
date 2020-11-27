// const DBInstanceType = "AWS::RDS::DBInstance"
//
// type dbInstanceResource struct {
// 	instance      *rds.DBInstance
// 	startStopTime time.StartStopTime
// }
//
// func (this *dbInstanceResource) Type() string {
// 	return DBInstanceType
// }
//
// func (this *dbInstanceResource) Id() *string {
// 	return this.instance.DBInstanceIdentifier
// }
//
// func (this *dbInstanceResource) Name() *string {
// 	return this.Id()
// }
//
// func (this *dbInstanceResource) StartStopTime() *time.StartStopTime {
// 	return &this.startStopTime
// }
//
// func (this *dbInstanceResource) CanStart() bool {
// 	return *this.instance.DBInstanceStatus == "stopped"
// }
//
// func (this *dbInstanceResource) CanStop() bool {
// 	return *this.instance.DBInstanceStatus == "available"
// }
import { RDS } from 'aws-sdk'
import { Resource, ResourceType, StartStopTime } from 'models'

export class RDSInstanceResource implements Resource {
	public readonly type = ResourceType.RDS_INSTANCE
	public readonly id: string
	private readonly status: string

	constructor(instance: RDS.DBInstance, public readonly startStopTime: StartStopTime) {
		this.id = instance.DBInstanceIdentifier || ''
		this.status = instance.DBInstanceStatus || ''
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
