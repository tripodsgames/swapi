import { normalizePath } from '../helpers/normalize.path';
import { NodeStorage } from '../storage';
import { Node } from '../types';

export const BaseUrl = (path: string, relatedTo?: { new(...args: any[]): any }, pathCombiner: string = null): ClassDecorator => {
  path = normalizePath(path);

  return (constructor: Function) => {
    const node: Node = {
      name: constructor.name,
      path,
      relatedTo: relatedTo ? relatedTo.name : null,
      combiner: pathCombiner,
      isAbstract: false
    } as Node;

    const storageInstance = NodeStorage.getInstance();
    storageInstance.upsertNode(node);

    const inheritedNodeName = (constructor as any).__proto__.name;
    const inheritedNode = storageInstance.findNodeByName(inheritedNodeName);

    if (!inheritedNode) {
      return;
    }

    inheritedNode.endpoints.forEach((endpoint) => {
      const storedEndpoint = storageInstance.findEndpointByName(node.name, endpoint.name);

      // NOTICE: endpoint was overridden by inheritor
      if (storedEndpoint) {
        storageInstance.upsertEndpoint(node.name, endpoint.name, endpoint);
      } else {
        storageInstance.addEndpoint(node.name, Object.assign({}, endpoint));
      }
    });
  }
};
