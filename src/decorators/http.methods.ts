import { pullOutParamsFromUrl } from '../helpers';
import { normalizePath } from '../helpers/normalize.path';
import { NodeStorage } from '../storage';
import { Endpoint, HttpMethods } from '../types';

export const Get = (path: string, description: string = '') => {
  return HttpMethodDecorator(HttpMethods.GET, path, description);
};

export const Post = (path: string, description: string = '') => {
  return HttpMethodDecorator(HttpMethods.POST, path, description);
};

export const Put = (path: string, description: string = '') => {
  return HttpMethodDecorator(HttpMethods.PUT, path, description);
};

export const Patch = (path: string, description: string = '') => {
  return HttpMethodDecorator(HttpMethods.PATCH, path, description);
};

export const Delete = (path: string, description: string = '') => {
  return HttpMethodDecorator(HttpMethods.DELETE, path, description);
};

export const HttpMethodDecorator = (
  method: HttpMethods,
  path: string,
  description: string = ''
): MethodDecorator => {
  path = normalizePath(path);
  const urlParams = pullOutParamsFromUrl(path);

  return (target: Object, endpointName: string) => {
    const nodeName = target.constructor.name;

    const endpoint = {
      name: endpointName,
      path,
      method,
      description,
      urlParams
    } as Endpoint;

    NodeStorage.getInstance().upsertEndpoint(nodeName, endpoint.name, endpoint);
  };
};
