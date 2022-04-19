import { NodeStorage } from '../storage';
import { Hashtable, ResponseStore, Types } from '../types';

/**
 * Adds response to endpoint
 * @param status - HTTP status
 * @param responseType - may be a basic type (such as `string`, `number` etc), or complex. complex type should be written as '#/ComplexTypeName'
 * @param description - Response description
 */
export const Response = (status: number, responseType: string = 'string', isArray: boolean = false, description: string = 'OK'): MethodDecorator => {
  if (isArray === false && responseType.indexOf('[]') === responseType.length - 2) {
    isArray = true;
    responseType = responseType.slice(0, responseType.length - 2);
  }

  return (target: Object, methodName: string) => {
    const nodeName = target.constructor.name;
    const storage = NodeStorage.getInstance();

    const response = {
      status,
      responseType,
      isArray,
      description
    } as ResponseStore;
    storage.upsertResponse(nodeName, methodName, response.status, response);
  };
};

export const addResponseType = (name: string, scheme: Hashtable<string>, isArray: boolean = false) => {
  const type = isArray ? Types.Array : Types.Object;

  const storage = NodeStorage.getInstance();
  storage.createResponseType(name, scheme, type);

  return;
};
