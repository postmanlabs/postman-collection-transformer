var _ = require('lodash'),
    constants = require('../constants'),
    urlparse = require('url-parse'),

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
                id: collectionV1.id,
                description: (collectionV1.description === null) ? '' : collectionV1.description,
                schema: constants.SCHEMA_V2_URL
            };
        },

        /**
         * Constructs an array of scripts, compatible with V2 format from a V1 Postman Collection.
         *
         * @param collectionV1
         * @returns {Array}
         */
        scripts: function (collectionV1) {
            var requests = collectionV1.requests,
                scripts = [],

                createScript = function (text, id, ext) {
                    return {
                        exec: text.split('\n'),
                        id: id + ext,
                        type: 'text/javascript'
                    }
                };

            requests.forEach(function (request) {
                if (request.tests) {
                    scripts.push(createScript(request.tests, request.id, constants.TESTS_EXT));
                }

                if (request.preRequestScript) {
                    scripts.push(createScript(request.preRequestScript, request.id, constants.PREREQUEST_EXT));
                }
            });
            return scripts;
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
            })
        },

        /**
         * Constructs a V2 compatible URL object from a V1 request
         *
         * @param requestV1
         * @returns {*}
         */
        url: function (requestV1) {  // TODO handle path variables
            var parsed = urlparse(requestV1.url, true);
            parsed.query = _.map(parsed.query, function (value, key) {
                return {
                    key: key,
                    value: value,
                    description: ''
                }
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
        headers: function (requestV1) {
            return _.map(_parseHeaders(requestV1.headers), function (value, key) {
                return {
                    key: key,
                    value: value,
                    description: ''
                }
            });
        },

        /**
         * Constructs a V2 Request compatible "data" object from a V1 Postman request
         *
         * @param requestV1
         * @returns {{mode: *, content: (*|string)}}
         */
        data: function (requestV1) {
            return {
                mode: requestV1.dataMode,
                content: (requestV1.dataMode === 'raw') ? requestV1.rawModeData || '' : requestV1.data || ''
            }
        },

        /**
         * Constructs a V2 "events" object from a V1 Postman Request
         *
         * @param requestV1
         * @returns {{test: string, setup: string}}
         */
        events: function (requestV1) {
            return {
                test: (requestV1.tests) ? requestV1.id + constants.TESTS_EXT : '',
                setup: (requestV1.preRequestScript) ? requestV1.id + constants.PREREQUEST_EXT : ''
            };
        },

        /**
         * Creates a V2 format request from a V1 Postman Collection Request
         *
         * @param request_v1
         */
        request: _.memoize(function (requestV1) {
            var self = this,
                units = ['url', 'method', 'headers', 'data', 'events'],
                request = {
                    _postman_compat_id: requestV1.id
                };

            units.map(function (unit) {
                request[unit] = self[unit](requestV1);
            });

            return request;
        },
        function (req) {
            return req.id;
        }),

        /**
         * Constructs an array of "sample" responses (compatible with a V2 collection)
         * from a Postman Collection V1 Request.
         *
         * @param requestV1
         * @returns {Array}
         */
        sample: function (requestV1) {
            var self = this;
            return _.map(requestV1.responses, function (response) {
                return {
                    name: response.name,
                    request: self.request(requestV1),
                    response: response
                }
            })
        },

        /**
         * Creates a V2 compatible ``item`` from a V1 Postman Collection Request
         *
         * @param requestV1 - Postman collection V1 request
         */
        item: function (requestV1) {
            var self = this,
                units = ['request', 'sample'],
                item = {
                    name: requestV1.name || ''  // Inline building to avoid additional function call
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
        items: function (collectionV1) {
            var self = this,
                requestsCache = _.indexBy(collectionV1.requests, 'id'),
                allRequests = _.pluck(collectionV1.requests, 'id'),
                folders,
                requests;

            folders = _.map(collectionV1.folders, function (folder) {
                // Use intersection to ignore requests that don't exist in the collection
                return _.map(_.intersection(folder.order, allRequests), function (requestId) {
                    return self.item(requestsCache[requestId])
                })
            });

            requests = _.map(_.intersection(collectionV1.order, allRequests), function (requestId) {
                return self.item(requestsCache[requestId]);
            });

            return [].concat(folders, requests); // Looks better than folders.concat(requests)
        }
    };

module.exports = {
    input: '1.0.0',
    output: '2.0.0',
    builders: builders,

    convert: function (collection, options, callback) {
        var units = ['info', 'scripts', 'items'],
            newCollection = {
                variables: (options.env) ? builders.variables(options.env) : [] // Inline building to avoid special case
            };

        units.map(function (unit) {
            newCollection[unit] = builders[unit](collection)
        });

        callback(null, newCollection);
    }
};
