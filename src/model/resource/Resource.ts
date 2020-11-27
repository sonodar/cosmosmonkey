package resource

import (
	"fmt"

	"github.com/sonodar/cosmosmonkey/domain/time"
)

/**
 * リソースを表すエンティティのインターフェース。
 */
type Resource interface {
	Type() string
	Id() *string
	Name() *string
	StartStopTime() *time.StartStopTime
	CanStart() bool
	CanStop() bool
}

func ToString(resource Resource) string {
	return fmt.Sprintf("Type = %s, Id = %s, Name = %s, %s",
		resource.Type(), *resource.Id(), *resource.Name(),
		resource.StartStopTime().ToString())
}
