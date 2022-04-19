import { Parameter } from '../types';
import { generateParamMeta } from './generate.param.meta';

export const pullOutParamsFromUrl = (path: string): Array<Parameter> =>
  path.split('/')
    .filter((part) => part.indexOf(':') === 0)
    .map((param) => param.slice(1))
    .reduce((params, param) => params.concat(generateParamMeta(param)), []);
