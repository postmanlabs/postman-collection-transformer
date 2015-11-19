var _ = require('lodash'),
    util = require('../util'),

    builders = {

        /**
         * Constructs a monolithic raw HTTP header block from a V2 header array
         *
         * @param item
         * @returns {*|string}
         */
        headers: function (item) {
            var headers = item.request.headers;
            return _.map(_.object(_.pluck(headers, 'key'), _.pluck(headers, 'value')), function (value, key) {
                return key + ': ' + value;
            }).join('\n');
        },

        /**
         * Detects the data mode from a given Postman Collection V2 item
         *
         * @param item
         * @returns {*|number|string}
         */
        dataMode: function (item) {
            return item.request.data.mode;
        },

        /**
         * Returns the appropriate request data based on the data mode.
         *
         * @param item
         * @returns {*}
         */
        data: function (item) {
            return (item.request.data.mode === 'raw') ? [] : item.request.data.content;
        },

        /**
         * In case of raw request bodies, this constructs the proper raw data from a V2 item.
         *
         * @param item
         * @returns {*}
         */
        rawModeData: function (item) {
            return (item.request.data.mode === 'raw') ? item.request.data.content : '';
        },

        /**
         * Creates an object of path-variables and their values from a V2 item
         *
         * @param item
         * @returns {*}
         */
        pathVariables: function (item) {
            var variables = _.filter(item.request.url.segments, function (segment) {
                if (typeof segment !== 'string') {
                    return true;
                }
            });
            return _.object(_.pluck(variables, 'key'), _.pluck(variables, 'value'));
        },

        /**
         * Creates a V1 compatible array of requests from a Postman V2 collection.
         *
         * @param collectionV2
         */
        /* jshint ignore:start */ // jscs:disable
        requests: function (collectionV2) {
            var self = this,
                flattenedItems = _.flatten(_.map(collectionV2.items, function (item) {
                    return (item.items) ? item.items : item;
                }));

            return _.map(flattenedItems, function (item) {
                var units = ['headers', 'dataMode', 'data', 'rawModeData', 'pathVariables'],
                    request = {
                        id: item.request._postman_compat_id,
                        name: item.name,
                        description: item.description,
                        url: item.request.url.href,
                        collectionId: collectionV2.info.id,
                        method: item.request.method,
                        currentHelper: item.request._postman_currentHelper,
                        helperAttributes: item.request._postman_helperAttributes,
                        tests: (item.request.events.test) ? item.request.events.test.exec.join('\n') : '',
                        preRequestScript: (item.request.events.setup) ? item.request.events.setup.exec.join('\n') : '',
                        responses: (item.sample) ? _.pluck(item.sample, 'response') : []
                    };
                _.map(units, function (unit) {
                    request[unit] = self[unit](item)
                });
                return request;
            });
        },
        /* jshint ignore:end */ // jscs:enable

        /**
         * Creates a V1 compatible array of solo requestIds from a Postman collection V2
         *
         * @param collectionV2
         */
        order: function (collectionV2) {
            return _.pluck(_.filter(collectionV2.items, function (element) {
                if (!element.items) {
                    return true;
                }
            }), ['request', '_postman_compat_id']); // Deep pluck the nested ID
        },

        /**
         * Creates an array of V1 compatible folders from a V2 collection
         *
         * @param collectionV2
         */
        folders: function (collectionV2) {
            return _.map(_.filter(collectionV2.items, function (element) {
                if (element.items) {
                    return true;
                }
            }), function (folder) {
                return {
                    id: util.uid(),
                    name: folder.name,
                    description: folder.description,
                    order: _.pluck(folder.items, ['request', '_postman_compat_id'])
                };
            });
        }
    };

module.exports = {
    input: '2.0.0',
    output: '1.0.0',
    builders: builders,

    convert: function (collection, options, callback) {
        var units = ['order', 'folders', 'requests'],
            newCollection = {
                // jscs:disable
                id: collection.info._postman_compat_id, // jshint ignore:line
                // jscs:enable
                name: collection.info.name,
                description: collection.info.description
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
