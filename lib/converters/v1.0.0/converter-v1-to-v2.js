var _ = require('lodash').noConflict(),
    constants = require('../../constants'),
    util = require('../../util'),

    regexes = {
        header: /^((\/\/\s*)?\S+):(.*)$/gm,
        fold: /\r\n([ \t])/g,
        trim: /^\s*(.*\S)?\s*$/
    },

    headersCommentPrefix = '//',

    /**
     * Parses a string of headers to an object.
     *
     * @param data
     * @returns {Object[]}
     * @private
     */
    _parseHeaders = function (data) {
        if (!data) {
            return;
        }

        var head,
            headers = [],
            match = regexes.header.exec(data);

        data = data.toString().replace(regexes.fold, '$1');

        while (match) {
            head = {
                key: match[1],
                value: match[3].replace(regexes.trim, '$1')
            };

            if (_.startsWith(head.key, headersCommentPrefix)) {
                head.disabled = true;
                head.key = head.key.replace(headersCommentPrefix, '').trim();
            }

            headers.push(head);
            match = regexes.header.exec(data);
        }
        return headers;
    },

    /**
     * A constructor that is capable of being used for one-off conversions of requests, and folders.
     *
     * @param options
     * @class Builders
     * @constructor
     */
    Builders = function ConverterBuilder (options) {
        this.options = options || {};
    };

_.assign(Builders.prototype, {

    /**
     * Constructs a V2 compatible "info" object from a V1 Postman Collection
     *
     * @param collectionV1
     * @returns {object}
     */
    info: function (collectionV1) {
        return {
            name: collectionV1.name,
            _postman_id: collectionV1.id,
            description: (collectionV1.description === null) ? '' : collectionV1.description,
            schema: constants.SCHEMA_V2_URL
        };
    },

    /**
     * Constructs an array of scripts, compatible with V2 format from a V1 Postman Collection.
     *
     * @returns {Array}
     */
    event: function () {
        // restore this function (using git blame) if and when we decide to add global scripts.
        return [];
    },

    /**
     * Creates a V2 compatible array of variables from a Postman Environment
     *
     * @param env
     * @returns {*|Array}
     */
    variables: function (env) {
        return env.values.map(function (item) {
            return {
                id: item.key,
                value: item.value,
                type: item.type
            };
        });
    },

    /**
     * Constructs a V2 compatible URL object from a V1 request
     *
     * @param requestV1
     * @returns {*}
     */
    url: function (requestV1) {
        var queryParams = [],
            pathVariables = [],
            traversedVars = {},
            traversedQueryParams = {},
            parsed = util.urlparse(requestV1.url);

        // Merge query params
        _.forEach(requestV1.queryParams, function (queryParam) {
            (queryParam.enabled === false) && (queryParam.disabled = true);

            delete queryParam.enabled;
            _.has(queryParam, 'description') && _.isEmpty(queryParam.description) && (delete queryParam.description);

            queryParams.push(queryParam);
            traversedQueryParams[queryParam.key] = true;
        });
        // parsed query params are taken from the url, so no descriptions are available from them
        _.forEach(parsed.query, function (queryParam) {
            !traversedQueryParams[queryParam.key] && queryParams.push(queryParam);
        });

        // Merge path variables
        _.forEach(requestV1.pathVariableData, function (pathVariable) {
            _.has(pathVariable, 'description') && _.isEmpty(pathVariable.description) &&
                (delete pathVariable.description);

            pathVariables.push(pathVariable);
            traversedVars[pathVariable.key] = true;
        });
        // pathVariables in v1 are of the form  {foo: bar}, so no descriptions can be obtained from them
        _.forEach(requestV1.pathVariables, function (value, id) {
            !traversedVars[id] && pathVariables.push({
                value: value,
                id: id
            });
        });

        !_.isEmpty(queryParams) && (parsed.query = queryParams);
        !_.isEmpty(pathVariables) && (parsed.variable = pathVariables);
        return parsed;
    },

    /**
     * Extracts the HTTP Method from a V1 request
     *
     * @param requestV1
     * @returns {*}
     */
    method: function (requestV1) {
        return requestV1.method;
    },

    /**
     * Constructs an array of Key-Values from a raw HTTP Header string.
     *
     * @param requestV1
     * @returns {*}
     */
    header: function (requestV1) {
        if (_.isArray(requestV1.headers)) {
            return requestV1.headers;
        }

        var headers = [],
            traversed = {},
            headerData = requestV1.headerData || [];

        _.forEach(headerData, function (header) {
            if (_.startsWith(header.key, headersCommentPrefix) || (header.enabled === false)) {
                header.disabled = true;
                header.key = header.key.replace(headersCommentPrefix, '').trim();
            }

            // prevent empty header descriptions from showing up in converted results. This keeps the collections clean
            _.has(header, 'description') && _.isEmpty(header.description) && (delete header.description);

            delete header.enabled;
            headers.push(header); // @todo Improve this sequence to account for multi-valued headers

            traversed[header.key] = true;
        });

        // requestV1.headers is a string, so no descriptions can be obtained from it
        _.forEach(_parseHeaders(requestV1.headers), function (header) {
            !traversed[header.key] && headers.push(header);
        });

        return headers;
    },

    /**
     * Constructs a V2 Request compatible "body" object from a V1 Postman request
     *
     * @param requestV1
     * @returns {{mode: *, content: (*|string)}}
     */
    body: function (requestV1) {
        var modes = {
                urlencoded: 'urlencoded',
                params: 'formdata',
                raw: 'raw',
                binary: 'file'
            },
            mode,
            data = {};

        mode = modes[requestV1.dataMode];
        !mode && (mode = 'raw');

        if (mode === 'raw') {
            data.mode = mode; // don't try to "clean" this up by moving it outside the "if". You'll break a test.

            // If request.rawModeData exists, use it, or use request.data
            data[mode] = _.isString(requestV1.rawModeData || requestV1.data) ?
                requestV1.rawModeData || requestV1.data : '';
        }
        else if (mode === 'file') {
            data.mode = mode;
            data[mode] = { src: _.get(requestV1, 'rawModeData') };
        }
        else if (!_.isEmpty(requestV1.data)) {
            data.mode = mode;
            data[mode] = _.map(requestV1.data, function (param) {
                if (param.type === 'file' && param.value) {
                    param.src = param.value;
                    delete param.value;
                }
                if (param.enabled === false) {
                    param.disabled = true;
                }

                // Prevent empty descriptions from showing up in the converted results. This keeps collections clean.
                _.has(param.description) && _.isEmpty(param.description) && (delete param.description);

                delete param.enabled;
                return param;
            });
        }
        return data;
    },

    /**
     * Constructs a V2 Request compatible "description" from a V1 Postman request
     *
     * @param requestV1
     * @returns {*}
     */
    description: function (requestV1) {
        return requestV1.description;
    },

    /**
     * Constructs a V2 "events" object from a V1 Postman Request
     *
     * @param requestV1
     * @returns {Array}
     */
    itemEvent: function (requestV1) {
        var events = [];
        if (requestV1.tests) {
            events.push({
                listen: 'test',
                script: {
                    type: 'text/javascript',
                    exec: _.isString(requestV1.tests) ?
                        requestV1.tests.split('\n') :
                        requestV1.tests
                }
            });
        }
        if (requestV1.preRequestScript) {
            events.push({
                listen: 'prerequest',
                script: {
                    type: 'text/javascript',
                    exec: _.isString(requestV1.preRequestScript) ?
                        requestV1.preRequestScript.split('\n') :
                        requestV1.preRequestScript
                }
            });
        }
        return events.length ? events : undefined;
    },

    /**
     * A number of auth parameter names have changed from V1 to V2. This function calls the appropriate
     * mapper function, and creates the V2 auth parameter object.
     *
     * @param requestV1
     * @returns {{type: *}}
     */
    auth: function (requestV1) {
        if ((requestV1.currentHelper === 'normal') || (!requestV1.currentHelper)) {
            return;
        }

        var types = {
                basicAuth: 'basic',
                digestAuth: 'digest',
                hawkAuth: 'hawk',
                oAuth1: 'oauth1',
                awsSigV4: 'awsv4',
                normal: 'noauth'
            },
            type = types[requestV1.currentHelper] || requestV1.currentHelper,
            auth = {
                type: type
            };
        auth[type] = {};

        // Some legacy versions of the App export Helper Attributes as a string.
        if (_.isString(requestV1.helperAttributes)) {
            try {
                requestV1.helperAttributes = JSON.parse(requestV1.helperAttributes);
            }
            catch (e) {
                return;
            }
        }

        _.merge(auth[type], requestV1.helperAttributes && util.authMappersFromLegacy[requestV1.currentHelper] ?
            util.authMappersFromLegacy[requestV1.currentHelper](requestV1.helperAttributes) : {});
        return auth;
    },

    /**
     * Creates a V2 format request from a V1 Postman Collection Request
     *
     * @param requestV1
     */
    request: function (requestV1) {
        var self = this,
            description,
            url = self.url(requestV1),
            units = ['auth', 'method', 'header', 'body'],
            request = {};

        url && url.raw && (request.url = url); // URL special case: Empty URLs shouldn't show up in converted v2 results

        units.forEach(function (unit) {
            request[unit] = self[unit](requestV1);
        });

        description = self.description(requestV1);

        // Prevent empty request descriptions from showing up in the converted results, keeps collections clean.
        !_.isEmpty(description) && (request.description = description);

        return request;
    },

    /**
     * Converts a V1 cookie to a V2 cookie.
     *
     * @param cookieV1
     * @returns {{expires: string, hostOnly: *, httpOnly: *, domain: *, path: *, secure: *, session: *, value: *}}
     */
    cookie: function (cookieV1) {
        return {
            expires: (new Date(cookieV1.expirationDate * 1000)).toString(),
            hostOnly: cookieV1.hostOnly,
            httpOnly: cookieV1.httpOnly,
            domain: cookieV1.domain,
            path: cookieV1.path,
            secure: cookieV1.secure,
            session: cookieV1.session,
            value: cookieV1.value,
            key: cookieV1.name
        };
    },

    /**
     * Gets the saved request for the given response, and handles edge cases between Apps & Sync
     *
     * Handles a lot of edge cases, so the code is not very clean.
     *
     * The Flow followed here is:
     *
     * If responseV1.requestObject is present
     *      If it is a string
     *          Try parsing it as JSON
     *              If parsed,
     *                  return it
     *              else
     *                  It is a request ID
     * If responseV1.request is present
     *      If it is a string
     *          Try parsing it as JSON
     *              If parsed,
     *                  return it
     *              else
     *                  It is a request ID
     * Look up the collection for the request ID and return it, or return undefined.
     *
     * @param responseV1
     */
    savedRequest: function (responseV1) {
        var self = this,
            associatedRequestId;

        if (responseV1.requestObject) {
            if (_.isString(responseV1.requestObject)) {
                try {
                    return JSON.parse(responseV1.requestObject);
                }
                catch (e) {
                    // if there was an error parsing it as JSON, it's probably an ID, so store it in the ID variable
                    associatedRequestId = responseV1.requestObject;
                }
            }
            else {
                return responseV1.requestObject;
            }
        }

        if (responseV1.request) {
            if (_.isString(responseV1.request)) {
                try {
                    return JSON.parse(responseV1.request);
                }
                catch (e) {
                    // if there was an error parsing it as JSON, it's probably an ID, so store it in the ID variable
                    associatedRequestId = responseV1.request;
                }
            }
            else {
                return responseV1.request;
            }
        }

        // we have a request ID
        return associatedRequestId && _.get(self, ['cache', associatedRequestId]);
    },

    /**
     * Since a V2 response contains the entire associated request that was sent, creating the response means it
     * also must use the V1 request.
     *
     * @param responseV1
     * @returns {{}}
     */
    singleResponse: function (responseV1) {
        var response = {},
            self = this,
            originalRequest;

        originalRequest = self.savedRequest(responseV1);

        response.id = self.options.retainIds ? responseV1.id : util.uid();
        response.name = responseV1.name || 'response';
        response.originalRequest = originalRequest ? self.request(originalRequest) : undefined;
        response.status = responseV1.responseCode && responseV1.responseCode.name || undefined;
        response.code = responseV1.responseCode && responseV1.responseCode.code || undefined;
        response._postman_previewlanguage = responseV1.language;
        response._postman_previewtype = responseV1.previewType;
        response.header = responseV1.headers;
        response.cookie = _.map(responseV1.cookies, function (cookie) {
            return self.cookie(cookie);
        });
        response.responseTime = responseV1.time;
        response.body = responseV1.text;
        return response;
    },

    /**
     * Constructs an array of "sample" responses (compatible with a V2 collection)
     * from a Postman Collection V1 Request.
     *
     * @param requestV1
     * @returns {Array}
     */
    response: function (requestV1) {
        var self = this;
        return _.map(requestV1.responses, function (responseV1) {
            return self.singleResponse(responseV1);
        });
    },

    /**
     * Creates a V2 compatible ``item`` from a V1 Postman Collection Request
     *
     * @param requestV1 - Postman collection V1 request
     */
    singleItem: function (requestV1) {
        var self = this,
            units = ['request', 'response'],
            item = {
                _postman_id: self.options.retainIds ? requestV1.id : undefined,
                name: requestV1.name || '', // Inline building to avoid additional function call
                event: self.itemEvent(requestV1)
            };
        units.forEach(function (unit) {
            item[unit] = self[unit](requestV1);
        });

        return item;
    },

    /**
     * Constructs an array of Items & ItemGroups compatible with the V2 format.
     *
     * @param collectionV1
     */
    itemGroups: function (collectionV1) {
        var self = this,
            items = [],
            itemGroupCache = {};

        // Read all folder data, and prep it so that we can throw subfolders in the right places
        itemGroupCache = _.reduce(collectionV1.folders, function (accumulator, folder) {
            var result = {
                _postman_id: self.options.retainIds ? folder.id : undefined,
                name: folder.name,
                item: []
            };

            // prevent empty folder descriptions from showing up in the converted result. This keeps collections clean.
            !_.isEmpty(folder.description) && (result.description = folder.description);

            accumulator[folder.id] = result;
            return accumulator;
        }, {});

        // Populate each ItemGroup with subfolders
        _.forEach(collectionV1.folders, function (folderV1) {
            var itemGroup = itemGroupCache[folderV1.id],
                hasSubfolders = folderV1.folders_order && folderV1.folders_order.length,
                hasRequests = folderV1.order && folderV1.order.length;

            // Add subfolders
            hasSubfolders && _.forEach(folderV1.folders_order, function (subFolderId) {
                if (!itemGroupCache[subFolderId]) {
                    // todo: figure out what to do when a collection contains a subfolder ID,
                    // but the subfolder is not actually there.
                    return;
                }

                itemGroupCache[subFolderId]._postman_isSubFolder = true;

                itemGroup.item.push(itemGroupCache[subFolderId]);
            });

            // Add items
            hasRequests && _.forEach(folderV1.order, function (requestId) {
                if (!self.cache[requestId]) {
                    // todo: what do we do here??
                    return;
                }

                itemGroup.item.push(self.singleItem(self.cache[requestId]));
            });
        });

        // This compromises some self-healing, which was originally present, but the performance cost of
        // doing self-healing the right way is high, so we directly rely on collectionV1.folders_order
        // The self-healing way would be to iterate over itemGroupCache directly, but preserving the right order
        // becomes a pain in that case.
        _.forEach(_.uniq(collectionV1.folders_order || _.map(collectionV1.folders, 'id')), function (folderId) {
            var itemGroup = itemGroupCache[folderId];
            itemGroup && !_.get(itemGroup, '_postman_isSubFolder') && items.push(itemGroup);
        });

        // This is useful later
        self.itemGroupCache = itemGroupCache;
        return items;
    },

    /**
     * Creates a V2 compatible array of items from a V1 Postman Collection
     *
     * @param collectionV1 - A Postman Collection object in the V1 format.
     */
    item: function (collectionV1) {
        var self = this,
            requestsCache = _.keyBy(collectionV1.requests, 'id'),
            allRequests = _.map(collectionV1.requests, 'id'),
            folders,
            requests;
        self.cache = requestsCache;
        folders = self.itemGroups(collectionV1);

        requests = _.map(_.intersection(collectionV1.order, allRequests), function (requestId) {
            return self.singleItem(requestsCache[requestId]);
        });

        return [].concat(folders, requests); // Looks better than folders.concat(requests)
    }
});

module.exports = {
    input: '1.0.0',
    output: '2.0.0',
    Builders: Builders,

    /**
     * Converts a single V1 request to a V2 item.
     *
     * @param request
     * @param options
     * @param callback
     * @returns {*}
     */
    convertSingle: function (request, options, callback) {
        var builders = new Builders(options),
            converted,
            err;

        try {
            converted = builders.singleItem(_.cloneDeep(request));
        }
        catch (e) {
            err = e;
        }

        if (callback) {
            return callback(err, converted);
        }

        if (err) {
            throw err;
        }

        return converted;
    },

    /**
     * Converts a single V1 Response to a V2 Response.
     *
     * @param response
     * @param options
     * @param callback
     * @returns {*}
     */
    convertResponse: function (response, options, callback) {
        var builders = new Builders(options),
            converted,
            err;

        try {
            converted = builders.singleResponse(_.cloneDeep(response));
        }
        catch (e) {
            err = e;
        }

        if (callback) {
            return callback(err, converted);
        }

        if (err) {
            throw err;
        }

        return converted;
    },

    /**
     * Converts a V1 collection to a V2 collection (performs ID replacement, etc as necessary).
     *
     * @param collection
     * @param options
     * @param callback
     * @returns {*}
     */
    convert: function (collection, options, callback) {
        collection = _.cloneDeep(collection);

        var units = ['info', 'item'],
            builders = new Builders(options),
            newCollection = {};

        options && options.env && (newCollection.variables = builders.variables(options.env));

        try {
            units.forEach(function (unit) {
                newCollection[unit] = builders[unit](collection);
            });
        }
        catch (e) {
            if (callback) {
                return callback(e, null);
            }
            throw e;
        }

        if (callback) {
            return callback(null, newCollection);
        }
        return newCollection;
    }
};
