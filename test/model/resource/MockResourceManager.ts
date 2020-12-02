import { Resource, ResourceManager, ResourceType, ResourceHandler } from 'models'

export class MockResourceManager implements ResourceManager<Resource> {
  constructor(
    public supportedType: ResourceType,
    public resources: Resource[],
    public start: (resource: Resource) => Promise<void>,
    public stop: (resource: Resource) => Promise<void>
  ) {}

  async eachResources(handler: ResourceHandler<Resource>): Promise<void> {
    for (const resource of this.resources) handler(resource)
  }
}
