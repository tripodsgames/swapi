import { NodeStorage } from '../storage';
import { Node } from '../types';

export const AbstractRouter: ClassDecorator = (constructor: Function) => {
  const node: Node = {
    name: constructor.name,
    isAbstract: true
  } as Node;

  NodeStorage.getInstance().upsertNode(node);
};
