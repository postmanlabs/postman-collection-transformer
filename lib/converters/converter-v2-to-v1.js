var _ = require('lodash'),
    util = require('../util'),

    authMap = {
        basic: 'basicAuth',
        digest: 'digestAuth',
        hawk: 'hawkAuth',
        oauth1: 'oAuth1',
        awsv4: 'awsSigV4',
        noauth: 'normal'
    },

    modeMap = {
        urlencoded: 'urlencoded',
        formdata: 'params',
        raw: 'raw'
    },

    populateIds = function (currentItem) {
        !currentItem.id && (currentItem.id = util.uid());
        var itemArray = currentItem.items || currentItem.item;
        itemArray && itemArray.length && (itemArray = _.map(itemArray, populateIds));
        return currentItem;
    },

    Builders = function ConversionBuilder (options) {
        this.options = options || {};
    };

_.extend(Builders.prototype, {

    /**
     * Constructs a monolithic raw HTTP header block from a V2 header array
     *
     * @param item
     * @returns {*|string}
     */
    headers: function (item) {
        var headers = item.request.headers || item.request.header;
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
        return modeMap[item.request.body.mode];
    },

    /**
     * Returns the appropriate request data based on the data mode.
     *
     * @param item
     * @returns {*}
     */
    data: function (item) {
        var mode = _.get(item, 'request.body.mode');
        if (mode === 'raw' || !mode) {
            return [];
        }
        return item.request.body[mode] ? item.request.body[mode] : [];
    },

    /**
     * In case of raw request bodies, this constructs the proper raw data from a V2 item.
     *
     * @param item
     * @returns {*}
     */
    rawModeData: function (item) {
        var rawData = item && item.request && item.request.body && item.request.body.mode;
        return (rawData === 'raw') ? item.request.body.raw : '';
    },

    /**
     * Creates an object of path-variables and their values from a V2 item
     *
     * @param item
     * @returns {*}
     */
    pathVariables: function (item) {
        var variable = _.get(item, 'request.url.variables') || _.get(item, 'request.url.variable');

        if (!variable) {
            return;
        }
        return _.object(_.pluck(variable, 'id'), _.pluck(variable, 'value'));
    },

    /**
     * Creates a V1 URL from a V2 item
     *
     * @param item
     */
    url: function (item) {
        var url = _.get(item, 'request.url');

        if (_.isString(url)) {
            return url;
        }

        return util.urlunparse(url);
    },

    /**
     * Extracts tests from a V2 collection
     *
     * @param item
     * @returns {string}
     */
    tests: function (item) {
        var allEvents = item.events || item.event,
            events;

        // Nothing to do if the item has no associated events
        if (!allEvents) {
            return;
        }

        events = _.filter(allEvents, {listen: 'test'});
        return _.map(events, function (event) {
            var tests = _.get(event, 'script.exec');
            if (_.isArray(tests)) {
                tests = tests.join('\n');
            }
            return tests;
        }).join('\n');
    },

    /**
     * Extracts the pre-request script from an Item
     *
     * @param item
     * @returns {string}
     */
    preRequestScript: function (item) {
        var allEvents = item.events || item.event,
            events;

        // Nothing to do if the item has no associated events
        if (!allEvents) {
            return;
        }

        events = _.filter(allEvents, {listen: 'prerequest'});
        return _.map(events, function (event) {
            var tests = _.get(event, 'script.exec');
            if (_.isArray(tests)) {
                tests = tests.join('\n');
            }
            return tests;
        }).join('\n');
    },

    /**
     * Converts a V2 cookie to a V1 cookie.
     *
     * @param cookieV2
     * @returns {{expirationDate: *, hostOnly: *, httpOnly: *,
         *          domain: (any), path: (any), secure: *, session: *, value: *, name: *}}
     */
    cookie: function (cookieV2) {
        return {
            expirationDate: cookieV2.expires,
            hostOnly: cookieV2.hostOnly,
            httpOnly: cookieV2.httpOnly,
            domain: cookieV2.domain,
            path: cookieV2.path,
            secure: cookieV2.secure,
            session: cookieV2.session,
            value: cookieV2.value,
            name: cookieV2.name
        };
    },

    /**
     * Converts a V2 response object to a V1 response
     *
     * @param responseV2
     * @returns {{}}
     */
    response: function (responseV2) {
        var self = this,
            response = {},
            originalRequest = responseV2.originalRequest || responseV2.request;
        // the true in the next line ensures that we don't recursively go on processing responses in a request.
        response.request = originalRequest ? self.request({request: originalRequest}, undefined, true) : undefined;
        response.id = util.uid();
        response.name = responseV2.name;
        response.status = responseV2.status;
        response.responseCode = {
            code: responseV2.code,
            name: responseV2.status,
            // TODO: get a list of descriptions
            detail: ''
        };
        /* jshint ignore:start */ // jscs:disable
        response.language = responseV2._postman_previewlanguage || 'Text';
        response.previewType = responseV2._postman_previewtype || 'html';
        /* jshint ignore:end */ // jscs:enable
        response.time = responseV2.responseTime;
        response.headers = responseV2.headers || responseV2.header;
        response.cookies = _.map(responseV2.cookies || responseV2.cookie, self.cookie);
        response.text = responseV2.body;
        response.rawDataType = 'text';
        return response;
    },

    /**
     * Extracts the array of responses from a V2 Item.
     *
     * @param item
     * @returns {Array}
     */
    responses: function (item) {
        var self = this,
            responses = [],
            allResponses = item.responses || item.response;
        if (!allResponses) {
            return;
        }
        _.each(allResponses, function (response) {
            responses.push(self.response(response, item));
        });
        return responses;
    },

    /**
     * Converts a V2 request to a V1 request.
     *
     * @param item
     * @param collectionId
     * @param skipResponses
     * @returns {{id: *, name: *, description: (*|string|builders.description), url: *, collectionId: *, method: *,
         *          currentHelper: *, helperAttributes: *}|*}
     */
    request: function (item, collectionId, skipResponses) {
        // TODO: Support for path variables
        var units = ['headers', 'dataMode', 'data', 'rawModeData', 'pathVariables',
                'tests', 'preRequestScript', 'url'],
            self = this,
            request,
            currentHelper,
            helperAttributes,
            auth = _.get(item, 'request.auth');

        !skipResponses && units.push('responses');

        // Extract helpers
        if (auth && auth.type) {
            currentHelper = authMap[auth.type];
            if (util.authMappersFromCurrent[currentHelper]) {
                helperAttributes = util.authMappersFromCurrent[currentHelper](auth[auth.type]);
            }
            else {
                helperAttributes = {};
            }
        }
        request = {
            // jscs:disable
            id: item.id || item._postman_id || util.uid(), // jshint ignore:line
            // jscs:enable
            name: item.name,
            description: item.request && item.request.description,
            collectionId: collectionId,
            method: item.request ? item.request.method : undefined,
            currentHelper: currentHelper,
            helperAttributes: helperAttributes
        };
        _.map(units, function (unit) {
            request[unit] = self[unit](item);
        });
        return request;
    },

    /**
     * Creates a V1 compatible array of requests from a Postman V2 parent item.
     *
     * @param parentItem
     */
    /* jshint ignore:start */ // jscs:disable
    requests: function (parentItem, collectionId) {
        var self = this,
            childItems = parentItem.items || parentItem.item,            
            requests = [];

        _.each(childItems, function (item) {
            var isFolder = (item.items || item.item);

            if (!isFolder) {
                // it's a request
                requests.push(self.request(item, collectionId));

            }
            else if(self.options.flattenMultiFolders === true) {
                // might have its own requests
                requests = requests.concat(self.requests(item, collectionId));
            }
        });
        return requests;
    },
    /* jshint ignore:end */ // jscs:enable

    /**
     * Creates a V1 compatible array of solo requestIds from a Postman collection V2
     *
     * @param collectionV2
     */
    order: function (collectionV2) {
        var itemArray = collectionV2.items || collectionV2.item,
            allItems = _.isArray(itemArray) ? itemArray : [itemArray];
        return _.filter(_.map(allItems, function (item) {
            var isFolder = (item.items || item.item);
            if (!isFolder) {
                return item.id || item._postman_id;
            }
        }));
    },

    /**
     * Creates an array of V1 compatible folders from a V2 item
     *
     * @param parentItem
     */
    folders: function (parentItem, parentId) {
        var self = this,
            itemArray = parentItem.items || parentItem.item,
            retFolders = [];

        _.each(_.filter(itemArray, function (element) {
            var isFolder = (element.items || element.item);
            return !!isFolder;
        }), function (folder) {
            var folderItems = folder.items || folder.item,
                thisFolder = {
                    /* jshint ignore:start */ // jscs:disable
                    id: folder._postman_id || folder.id || util.uid(),
                    /* jshint ignore:end */ // jscs:enable
                    name: folder.name,
                    description: folder.description,
                    order: _.map(folderItems, function (f) {
                        return f._postman_id || f.id;
                    })
                };
            if (parentId) {
                thisFolder.parentId = parentId;
            }
            retFolders.push(thisFolder);
            if (self.options.flattenMultiFolders === true) {
                retFolders = retFolders.concat(self.folders(folder, thisFolder.id));
            }
        });

        return retFolders;
    }
});

module.exports = {
    input: '2.0.0',
    output: '1.0.0',
    Builders: Builders,

    convert: function (collection, options, callback) {
        var builders = new Builders(options),
            newCollection = {
                // jscs:disable
                id: collection.info._postman_id, // jshint ignore:line
                // jscs:enable
                name: collection.info.name,
                description: collection.info.description
            };

        // ensure that each item has an ID
        collection = populateIds(collection);
        try {
            // the old method of looping over ['order', 'folder', 'request'] left
            // no room for customization
            newCollection.order = builders.order(collection);
            newCollection.folders = builders.folders(collection);
            newCollection.requests = builders.requests(collection, collection.info._postman_id);
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
