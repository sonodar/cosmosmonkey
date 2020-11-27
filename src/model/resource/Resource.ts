// /**
//  * リソースを表すエンティティのインターフェース。
//  */
// type Resource interface {
//   Type() string
//   Id() *string
//   Name() *string
//   StartStopTime() *time.StartStopTime
//   CanStart() bool
//   CanStop() bool
// }
//
// func ToString(resource Resource) string {
//   return fmt.Sprintf("Type = %s, Id = %s, Name = %s, %s",
//       resource.Type(), *resource.Id(), *resource.Name(),
//       resource.StartStopTime().ToString())
// }
import { ResourceType } from './ResourceType'
import { StartStopTime } from '../time'

export interface Resource {
  type: ResourceType
  id: string
  name: string
  startStopTime: StartStopTime
  canStart: boolean
  canStop: boolean
}
