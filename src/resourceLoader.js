import { id } from "./id";
import { fetchResource } from "./network";

let RESOURCE_FETCH_DELAY = 1000;
let cachedFilesInSession = {};

export const fetchAndSaveInCache = (url, indexedDBAccess) =>
    new Promise((resolve, reject) => {
        fetchResource(url)
            .then(content => {
                resolve(content);
                indexedDBAccess.putResource(id(url), content);
            })
            .catch(e => {
                reject(e);
            });
    });

export const loadResource = (indexedDBAccess, resourceUrl, immediate = false) => {
    const promise = new Promise((resolve, reject) => {
        indexedDBAccess
            .getResource(id(resourceUrl))
            .then((result) => {
                console.log(`resource ${resourceUrl} was in cache`);
                resolve({ ...result, fromCache: true });
            })
            .catch(err => {
                console.log(
                    err
                        ? `failed to fetch resource from cache ${resourceUrl}. error: ${err}`
                        : `resource ${resourceUrl} was not in cache`
                );
                if (immediate) {
                    fetchAndSaveInCache(resourceUrl, indexedDBAccess)
                        .then(content => resolve({ resource: content, fromCache: false }))
                        .catch(err => reject(err));
                } else {
                    window.setTimeout(() => fetchAndSaveInCache(resourceUrl, indexedDBAccess), RESOURCE_FETCH_DELAY);
                    reject(null);
                }
            });
    });
    cachedFilesInSession[id(resourceUrl)] = true;
    return promise;
};

export const getCachedFiles = () => Object.keys(cachedFilesInSession);
