var _ = require('lodash').noConflict(),
    constants = require('../constants'),
    util = require('../util'),

    regexes = {
        header: /^(\S+):(.*)$/gm,
        fold: /\r\n([ \t])/g,
        trim: /^\s*(.*\S)?\s*$/
    },

    headersCommentPrefix = '//',

    _parseHeaders = function (data) {
        if (!data) {
            return;
        }

        var headers = {},
            match = regexes.header.exec(data);
        data = data.toString().replace(regexes.fold, '$1');

        while (match) {
            headers[match[1]] = match[2].replace(regexes.trim, '$1');
            match = regexes.header.exec(data);
        }
        return headers;
    },

    Builders = function ConverterBuilder (options) {
        this.options = options || {};
    };

_.extend(Builders.prototype, {

    /**
     * Constructs a V2 compatible "info" object from a V1 Postman Collection
     *
     * @param collectionV1
     * @returns object
     */
    info: function (collectionV1) {
        return {
            name: collectionV1.name,
            // jscs:disable
            _postman_id: collectionV1.id, // jshint ignore:line
            // jscs:enable
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
        if (_.isEmpty(requestV1.pathVariables)) {
            return requestV1.url;
        }

        var parsed = util.urlparse(requestV1.url);
        parsed.variable = _.map(requestV1.pathVariables, function (value, id) {
            return {
                value: value,
                id: id
            };
        });
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
     * Constructs a hashmap of Key-Values from a raw HTTP Header string.
     *
     * @param requestV1
     * @returns {*}
     */
    header: function (requestV1) {
        if (_.isArray(requestV1.headers)) {
            return requestV1.headers;
        }
        return _.map(_parseHeaders(requestV1.headers), function (value, key) {
            var thisHeaderObject = {
                key: key,
                value: value,
                description: ''
            };
            _.startsWith(key, headersCommentPrefix) && (thisHeaderObject.disabled = true);
            return thisHeaderObject;
        });
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
                raw: 'raw'
            },
            mode,
            data = {};

        mode = modes[requestV1.dataMode];
        !mode && (mode = 'raw');
        data.mode = mode;

        if (mode === 'raw') {
            // If request.rawModeData exists, use it, or use request.data
            data[mode] = _.isString(requestV1.rawModeData || requestV1.data) ?
            requestV1.rawModeData || requestV1.data : '';
        }
        else {
            data[mode] = requestV1.data ? _.map(requestV1.data, function (param) {
                if (param.type === 'file' && param.value) {
                    param.src = param.value;
                    delete param.value;
                }
                return param;
            }) : [];
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
                    exec: requestV1.tests
                }
            });
        }
        if (requestV1.preRequestScript) {
            events.push({
                listen: 'prerequest',
                script: {
                    type: 'text/javascript',
                    exec: requestV1.preRequestScript
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
            units = ['url', 'method', 'header', 'body', 'description'],
            request = {
                auth: self.auth(requestV1)
            };

        units.map(function (unit) {
            request[unit] = self[unit](requestV1);
        });

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
        originalRequest = responseV1.request;
        if (_.isString(responseV1.request)) {
            originalRequest = self.request.cache[responseV1.request];
        }
        response.id = self.options.retainIds ? responseV1.id : util.uid();
        response.name = responseV1.name || 'response';
        response.originalRequest = originalRequest ? self.request(originalRequest) : undefined;
        response.status = responseV1.responseCode && responseV1.responseCode.name || undefined;
        response.code = responseV1.responseCode && responseV1.responseCode.code || undefined;
        /* jshint ignore:start */ // jscs:disable
        response._postman_previewlanguage = responseV1.language;
        response._postman_previewtype = responseV1.previewType;
        /* jshint ignore:end */ // jscs:enable
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
                /* jshint ignore:start */ // jscs:disable
                _postman_id: self.options.retainIds ? requestV1.id : undefined,
                /* jshint ignore:end */ // jscs:enable
                name: requestV1.name || '',  // Inline building to avoid additional function call
                event: self.itemEvent(requestV1)
            };
        units.map(function (unit) {
            item[unit] = self[unit](requestV1);
        });

        return item;
    },

    /**
     * Creates a V2 compatible array of items from a V1 Postman Collection
     *
     * @param collectionV1 - A Postman Collection object in the V1 format.
     */
    item: function (collectionV1) {
        var self = this,
            requestsCache = _.indexBy(collectionV1.requests, 'id'),
            allRequests = _.pluck(collectionV1.requests, 'id'),
            folders,
            requests;
        self.request.cache = requestsCache;
        folders = _.map(collectionV1.folders, function (folder) {
            return {
                /* jshint ignore:start */ // jscs:disable
                _postman_id: self.options.retainIds ? folder.id : undefined,
                /* jshint ignore:end */ // jscs:enable
                name: folder.name,
                description: folder.description,
                // Use intersection to ignore requests that don't exist in the collection
                item: _.map(_.intersection(folder.order, allRequests), function (requestId) {
                    return self.singleItem(requestsCache[requestId]);
                })
            };
        });

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

    convert: function (collection, options, callback) {
        var units = ['info', 'item'],
            builders = new Builders(options),
            newCollection = {
                variables: (options && options.env) ?
                    builders.variables(options.env) : [] // Inline building to avoid special case
            };

        try {
            units.map(function (unit) {
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
