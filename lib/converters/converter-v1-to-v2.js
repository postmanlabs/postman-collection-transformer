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
                // jscs:disable
                _postman_compat_id: collectionV1.id, // jshint ignore:line
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
        scripts: function () {
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
            var urlV1 = requestV1.url,
                parsed;

            try {
                parsed = urlparse(urlV1, true);
            }
            catch (e) {
                // Parsing failed, which can happen for various reasons
                // Anywho, return the unparsed URL
                return {href: urlV1};
            }

            parsed.query = _.map(parsed.query, function (value, key) {
                return {
                    key: key,
                    value: value,
                    description: ''
                };
            });

            // TODO: The following bit is commented out because the url-parse library has a bug
            // where it lower-cases values in the "host" par automatically.
            // The quickest hack around this is to not parse the URL at all. ;)

            // // Handle the edge cases where the V1 URL may be of the form {{host}}/abc/123
            // // In this case, the output href looks like: //{{host}}/abc/123?
            // // 1. Remove the leading slashes
            // parsed.href = (util.stringStartsWith(parsed.href, '//')) ? parsed.href.substring(2) : parsed.href;
            // // 2. Remove the trailing "?"
            // parsed.href = (util.stringEndsWith(parsed.href, '?')) ? parsed.href.slice(0, -1) : parsed.href;
            parsed.href = urlV1;

            parsed.segments = _.map(parsed.pathname.split('/'), function (segment) {
                var varName;
                if (/:(.)*/.test(segment)) { // Path variable
                    varName = segment.substr(1);
                    return {
                        type: 'string',
                        key: varName,
                        value: requestV1.pathVariables && requestV1.pathVariables[varName] || ''
                    };
                }
                else {
                    return segment;
                }
            }).filter(Boolean);
            return parsed;
        },

        /**
         * Extracts the HTTP Method from a V1 request
         *
         * @param requestV1
         * @returns {*}
         */
        method: function (requestV1) {
            return requestV1.method || 'GET';
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
            return {
                mode: requestV1.dataMode,
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
         * @returns {{test: object, setup: object}}
         */
        events: function (requestV1) {
            return {
                test: (requestV1.tests) ? {
                    exec: requestV1.tests.split('\n'),
                    type: 'text/javascript',
                    id: '' // Keep blank since this is an inline script
                } : '',
                setup: (requestV1.preRequestScript) ? {
                    exec: requestV1.preRequestScript.split('\n'),
                    type: 'text/javascript',
                    id: ''
                } : ''
            };
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

        /**
         * Creates a V2 format request from a V1 Postman Collection Request
         *
         * @param request_v1
         */
        request: function (requestV1) {
            var self = this,
                units = ['url', 'method', 'headers', 'data', 'description', 'events', '_postman_currentHelper',
                         '_postman_helperAttributes'],
                request = {
                    // jscs:disable
                    _postman_compat_id: requestV1.id // jshint ignore:line
                    // jscs:enable
                };

            units.map(function (unit) {
                request[unit] = self[unit](requestV1);
            });

            return request;
        },

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
                };
            });
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
                return {
                    name: folder.name,
                    description: folder.description,
                    // Use intersection to ignore requests that don't exist in the collection
                    items: _.map(_.intersection(folder.order, allRequests), function (requestId) {
                        return self.item(requestsCache[requestId]);
                    })
                };
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
