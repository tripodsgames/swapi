import { generateParamMeta, isReference } from '../helpers';
import { NodeStorage } from '../storage';
import { ParameterLocation, Types } from '../types';

export const BodyIsArray: MethodDecorator = (target: Object, methodName: string) => {
  const nodeName = target.constructor.name;
  const storageInstance = NodeStorage.getInstance();

  storageInstance.markBodyAsArray(nodeName, methodName);
};

export const BodyIsObject: MethodDecorator = (target: Object, methodName: string) => {
  setBodyType(target, methodName, Types.Object);
};

export const BodyIsString: MethodDecorator = (target: Object, methodName: string) => {
  setBodyType(target, methodName, Types.String);
};

export const BodyIsNumber: MethodDecorator = (target: Object, methodName: string) => {
  setBodyType(target, methodName, Types.Number);
};

export const setBodyType = (target: any, methodName: string, type: Types) => {
  const nodeName = target.constructor.name;
  const storageInstance = NodeStorage.getInstance();

  storageInstance.setBodyType(nodeName, methodName, type);
};

export const Param = (name: string | Object, type?: string) => {
  return VariativeDataDecorator(name, ParameterLocation.UrlPath, type);
};

export const Query = (name: string | Object, type?: string, required?: boolean) => {
  return VariativeDataDecorator(name, ParameterLocation.Query, type, required);
};

export const Body = (name: string | Object, type?: string, required?: boolean) => {
  return VariativeDataDecorator(name, ParameterLocation.Body, type, required);
};

export const Header = (name: string | Object, type?: string, required?: boolean) => {
  return VariativeDataDecorator(name, ParameterLocation.Header, type, required);
};

const VariativeDataDecorator = (
  name: string | Object,
  location: ParameterLocation,
  type?: string,
  required?: boolean
): MethodDecorator => {
  return (target: Object, endpointName: string) => {
    const nodeName = target.constructor.name;
    const storageInstance = NodeStorage.getInstance();

    // NOTICE: works in case `@Body('#/Entity')`
    if (typeof name === 'string' && isReference(name)) {
      storageInstance.setBodyType(nodeName, endpointName, name);
      return;
    }

    let addParam: Function;
    if (location === ParameterLocation.Header) {
      addParam = storageInstance.upsertHeaderParam;
    } else if (location === ParameterLocation.Body) {
      addParam = storageInstance.upsertBodyParam;
    } else if (location === ParameterLocation.Query) {
      addParam = storageInstance.upsertQueryParam;
    } else if (location === ParameterLocation.UrlPath) {
      addParam = storageInstance.upsertUrlParam;
    }

    if (typeof name === 'string') {
      const param = generateParamMeta(name, type, required);

      addParam.call(storageInstance, nodeName, endpointName, param);
    } else {
      Object
        .entries(name)
        .forEach(([name, type]) => {
          const param = generateParamMeta(name, type, required);
          addParam.call(storageInstance, nodeName, endpointName, param);
        });
    }
  }
};
