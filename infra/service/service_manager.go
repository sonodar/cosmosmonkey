package service

import "github.com/sonodar/cosmosmonkey/domain/resource"

/**
 * リソースの検索、起動、停止を行うドメインオブジェクトのインターフェース。
 */
type ServiceManager interface {
	resource.ResourceManager

	/** 当該実装クラスがサポートしているリソースタイプを返す。 */
	SupportedType() string
}
