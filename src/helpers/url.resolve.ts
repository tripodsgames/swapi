import { normalizePath } from './normalize.path';

export const urlResolve = (...urls: Array<string>) => {
  let resolved = '';
  urls.forEach((url) => {
    url = normalizePath(url);
    resolved += url === '//' || url === '/' ? url : `/${url}/`;
  });

  return resolved.replace(/\/\//g, '/');
};
