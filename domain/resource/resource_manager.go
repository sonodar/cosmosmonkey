package resource

type ResourceHandler func(Resource) error

/**
 * リソースの検索、起動、停止を行うドメインオブジェクトのインターフェース。
 */
type ResourceManager interface {
	/** 起動・停止対象となるリソースに対して処理を行う */
	EachResources(handler ResourceHandler) error

	/** 当該サービスリソースを起動する。起動方法はサービスによって様々。 */
	Start(resource Resource) error

	/** 当該サービスリソースを停止する。停止方法はサービスによって様々。 */
	Stop(resource Resource) error
}
