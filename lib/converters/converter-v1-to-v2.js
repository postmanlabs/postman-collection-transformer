var _ = require('lodash'),
    constants = require('../constants'),
    util = require('../util'),

    regexes = {
        header: /^(\S+):(.*)$/gm,
        fold: /\r\n([ \t])/g,
        trim: /^\s*(.*\S)?\s*$/
    },

    _parseHeaders = function (data) {
        var headers = {},
            match = regexes.header.exec(data);
        data = data.toString().replace(regexes.fold, '$1');

        while (match) {
            headers[match[1]] = match[2].replace(regexes.trim, '$1');
            match = regexes.header.exec(data);
        }
        return headers;
    },

    builders = {

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
        url: function (requestV1) {  // TODO handle path variables
            return requestV1.url;
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
            return _.map(_parseHeaders(requestV1.headers), function (value, key) {
                return {
                    key: key,
                    value: value,
                    description: ''
                };
            });
        },

        /**
         * Constructs a V2 Request compatible "data" object from a V1 Postman request
         *
         * @param requestV1
         * @returns {{mode: *, content: (*|string)}}
         */
        data: function (requestV1) {
            var modes = {
                urlencoded: 'urlencoded',
                params: 'formdata',
                raw: 'raw'
            };

            return {
                mode: modes[requestV1.dataMode],
                content: (requestV1.dataMode === 'raw') ? requestV1.rawModeData || '' : requestV1.data || []
            };
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
                    listen: 'test',
                    script: {
                        type: 'text/javascript',
                        exec: requestV1.preRequestScript
                    }
                });
            }
            return events.length ? events : undefined;
        },

        // jscs:disable
        _postman_currentHelper: function (requestV1) { // jshint ignore:line
            return requestV1.currentHelper || 'normal';
        },
        // jscs:enable

        // jscs:disable
        _postman_helperAttributes: function (requestV1) { // jshint ignore:line
            return requestV1.helperAttributes || {};
        },
        // jscs:enable

        auth: function (requestV1) {
            if (!requestV1.currentHelper) {
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
            _.merge(auth[type], util.authMappersFromLegacy[requestV1.currentHelper] ?
                util.authMappersFromLegacy[requestV1.currentHelper](requestV1.helperAttributes) : {});
            return auth;
        },

        /**
         * Creates a V2 format request from a V1 Postman Collection Request
         *
         * @param request_v1
         */
        request: _.memoize(function (requestV1) {
                var self = this,
                    units = ['url', 'method', 'header', 'data', 'description'],
                    request = {
                        auth: self.auth(requestV1)
                    };

                units.map(function (unit) {
                    request[unit] = self[unit](requestV1);
                });

                return request;
            },
            function (req) {
                return req.id;
            }),

        cookie: function (cookieV1) {
            return {
                expires: (new Date(cookieV1.expirationDate * 1000)).toString(),
                hostOnly: cookieV1.hostOnly,
                httpOnly: cookieV1.httpOnly,
                domain: cookieV1.domain,
                path: cookieV1.path,
                secure: cookieV1.secure,
                session: cookieV1.session,
                value: cookieV1.value
            };
        },

        singleResponse: function (responseV1) {
            var response = {},
                self = this;
            response.name = responseV1.name || 'response';
            response.status = responseV1.responseCode && responseV1.responseCode.name || undefined;
            response.code = responseV1.responseCode && responseV1.responseCode.code || undefined;
            response.header = responseV1.headers;
            response.cookie = _.map(responseV1.cookies, function (cookie) {
                return self.cookie(cookie);
            });
            response.data = responseV1.text;
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
            return _.map(requestV1.responses, function (response) {
                return {
                    name: response.name,
                    request: self.request(requestV1),
                    response: self.singleResponse(response)
                };
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
                    id: requestV1.id,
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

            folders = _.map(collectionV1.folders, function (folder) {
                return {
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
    };

module.exports = {
    input: '1.0.0',
    output: '2.0.0',
    builders: builders,

    convert: function (collection, options, callback) {
        var units = ['info', 'item'],
            newCollection = {
                variables: (options.env) ? builders.variables(options.env) : [] // Inline building to avoid special case
            };

        try {
            units.map(function (unit) {
                newCollection[unit] = builders[unit](collection);
            });
        }
        catch (e) {
            callback(e, null);
            return;
        }

        callback(null, newCollection);
    }
};
