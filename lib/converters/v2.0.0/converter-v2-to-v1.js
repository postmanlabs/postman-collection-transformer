var _ = require('lodash').noConflict(),
    util = require('../../util'),

    v2Common = require('../../common/v2'),

    Builders = function ConversionBuilder (options) {
        this.options = options || {};
    };

_.assign(Builders.prototype, {

    /**
     * Converts v2 style auth manifests into their v1 equivalents.
     *
     * @param {Object} entityV2  - The v1 auth manifest to be transformed into v1.
     * @param {?Object} options - The set of options for the current auth cleansing operation.
     * @param {?Boolean} [options.includeNoauth=false] - When set to true, noauth is set to null.
     *
     * @returns {Object} The transformed auth object.
     */
    auth: function (entityV2, options) {
        return util.authMapToArray(entityV2, options);
    },

    /**
     * Constructs a V1 "events" object from a V2 Postman entity
     *
     * @param entityV2
     * @returns {Array}
     */
    events: function (entityV2) {
        // events is treated as the source of truth in v1, so handle that first and bail out.
        var source = entityV2.events || entityV2.event;

        if (_.isArray(source)) {
            // @todo: Improve this to order prerequest events before test events
            _.forEach(source, function (event) {
                !event.listen && (event.listen = 'test');

                if (event.script) {
                    !event.script.type && (event.script.type = 'text/javascript');

                    // @todo: Add support for src
                    _.isString(event.script.exec) && (event.script.exec = event.script.exec.split('\n'));
                }
            });

            return source;
        }
    },

    /**
     * Facilitates sanitized variable transformations across all levels for v1 collection normalization.
     *
     * @param {Object} entity - The wrapper object containing variable definitions.
     * @param {?Object} options - The set of options for the current variable transformation.
     * @param {?Object} options.fallback - The set of fallback values to be applied when no variables exist.
     * @param {?Boolean} options.noDefaults - When set to true, no defaults are applied.
     * @returns {Object[]} - The set of sanitized variables.
     */
    variables: function (entity, options) {
        return util.handleVars(entity, options);
    },

    /**
     * Extracts all subfolders from a v2.0.0 collection or folder
     *
     * @param folderOrCollection
     */
    extractFolderItems: function (folderOrCollection) {
        if (!folderOrCollection) { return; }

        var i,
            self = this,
            folders = [],
            items = folderOrCollection.item || folderOrCollection.items;

        !_.isArray(items) && (items = [items]);

        for (i = 0; i < items.length; i++) {
            if (items[i] && (items[i].items || items[i].item)) {
                folders.push(items[i]);
                folders = [].concat(folders, self.extractFolderItems(items[i]));
            }
        }
        return folders;
    },

    /**
     * Extracts all requests from a v2.0.0 collection or folder
     *
     * @param folderOrCollection
     */
    extractItems: function (folderOrCollection) {
        if (!folderOrCollection) { return; }

        var i,
            self = this,
            requests = [],
            isFolder,
            items = folderOrCollection.item || folderOrCollection.items;

        !_.isArray(items) && (items = [items]);
        for (i = 0; i < items.length; i++) {
            isFolder = items[i] && (items[i].items || items[i].item);
            if (items[i]) {
                isFolder ? (requests = [].concat(requests, self.extractItems(items[i]))) : requests.push(items[i]);
            }
        }
        return requests;
    },

    /**
     * Constructs a monolithic raw HTTP header block from a V2 header array
     *
     * @param item
     * @returns {*|string}
     */
    headers: function (item) {
        if (!(item && item.request)) { return; }

        return _.map(item.request.headers || item.request.header, function (header) {
            return (header.disabled ? '// ' : '') + header.key + ': ' + header.value;
        }).join('\n');
    },

    /**
     * Detects the data mode from a given Postman Collection V2 item
     *
     * @param item
     * @returns {*|number|string}
     */
    dataMode: function (item) {
        return v2Common.modeMap[_.get(item, 'request.body.mode')];
    },

    /**
     * Returns the appropriate request data based on the data mode.
     *
     * @param item
     * @returns {*}
     */
    data: function (item) {
        var mode = _.get(item, 'request.body.mode');
        if (mode === 'raw' || mode === 'file' || !mode) {
            return [];
        }
        return _.map(item.request.body[mode], function (elem) {
            // Only update the value in v1 if src in v2 is non-empty
            if (elem && elem.type === 'file' && _.has(elem, 'src') && !_.isEmpty(elem.src)) {
                elem.value = elem.src;
                delete elem.src;
            }

            // Prevents empty request body descriptions from showing up in the result, keeps collections clean.
            _.has(elem, 'description') && _.isEmpty(elem.description) && (delete elem.description);
            _.has(elem, 'disabled') && (elem.enabled = !elem.disabled);

            delete elem.disabled;
            return elem;
        });
    },

    /**
     * In case of raw request bodies, this constructs the proper raw data from a V2 item.
     *
     * @param item
     * @returns {*}
     */
    rawModeData: function (item) {
        var mode = item && item.request && item.request.body && item.request.body.mode;

        if (mode === 'raw') {
            return item.request.body.raw;
        }
        else if (mode === 'file') {
            return _.get(item.request.body, 'file.src', '');
        }

        return ''; // v1 requires an empty string
    },

    /**
     * Creates an object of path-variables and their values from a V2 item
     *
     * @param item
     * @returns {*}
     */
    pathVariables: function (item) {
        var variable = _.get(item, 'request.url.variables') || _.get(item, 'request.url.variable');

        if (!variable) { return; }

        return _.transform(variable, function (accumulator, v) {
            accumulator[v.key || v.id] = v.value; // v2.0.0 supports both key and id, v2.1.0 will drop id support
        }, {});
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

        if (!url) {
            return '';
        }

        return util.urlunparse(url);
    },

    /**
     * Extracts test from a V2 collection
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
            name: cookieV2.key || cookieV2.name
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
            id = responseV2.id || responseV2._postman_id,
            originalRequest = responseV2.originalRequest || responseV2.request;

        // the true in the next line ensures that we don't recursively go on processing responses in a request.
        response.request = originalRequest ? self.request({request: originalRequest}, undefined, true) : undefined;

        // add the requestObject to the response (needed by sync)
        try {
            response.request && (response.requestObject = JSON.stringify(response.request));
        }
        catch (e) { /* It's fine, not a fatal error, just move on. */ }

        response.id = self.options.retainIds && id ? id : util.uid();
        response.name = responseV2.name;
        response.status = responseV2.status;
        response.responseCode = {
            code: responseV2.code,
            name: responseV2.status,
            // TODO: get a list of descriptions
            detail: ''
        };
        response.language = responseV2._postman_previewlanguage || 'Text';
        response.previewType = responseV2._postman_previewtype || 'html';
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
            allResponses = item.responses || item.response;

        if (!allResponses) { return; }
        return _.map(allResponses, function (response) {
            return self.response(response, item);
        });
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
        if (!item) { return; }

        var units = ['headers', 'dataMode', 'data', 'rawModeData', 'pathVariables', 'tests', 'preRequestScript', 'url'],
            self = this,
            request,
            description,
            currentHelper,
            helperAttributes,
            req = item && item.request,
            v2Auth = req && req.auth,
            auth = self.auth(req),
            events = self.events(item),
            variables = self.variables(item),
            url = req && req.url,
            urlObj = _.isString(url) ? util.urlparse(url) : url;

        !skipResponses && units.push('responses');

        if (v2Auth && v2Auth.type) {
            // @todo: Add support for custom auth helpers
            currentHelper = v2Common.authMap[v2Auth.type];
            if (util.authMappersFromCurrent[currentHelper]) {
                _.isArray(v2Auth[v2Auth.type]) && (v2Auth = util.authArrayToMap(req));
                helperAttributes = util.authMappersFromCurrent[currentHelper](v2Auth[v2Auth.type]);
            }
            else {
                helperAttributes = null;
            }
        }
        else if (v2Auth === null) {
            currentHelper = null;
            helperAttributes = null;
        }

        request = {
            id: item.id || item._postman_id || util.uid(),
            name: item.name,
            collectionId: collectionId,
            method: item.request ? item.request.method : undefined,
            currentHelper: currentHelper,
            helperAttributes: helperAttributes
        };

        description = item.request && self.description(item.request.description);

        // Prevent empty request descriptions from showing up in the converted result, keeps collections clean.
        !_.isEmpty(description) && (request.description = description);

        (auth || (auth === null)) && (request.auth = auth);
        events && events.length && (request.events = events);
        variables && variables.length && (request.variables = variables);

        _.forEach(units, function (unit) {
            request[unit] = self[unit](item);
        });

        // description transformations for v2 to v1
        urlObj && (request.pathVariableData = _.map(urlObj.variables || urlObj.variable, function (v) {
            var result = { key: v.key || v.id, value: v.value };

            // Prevent empty path variable descriptions from showing up in converted results, keeps collections clean.
            !_.isEmpty(v.description) && (result.description = v.description);

            return result;
        }));

        urlObj && (request.queryParams = _.map(urlObj.query, function (queryParam) {
            // Prevents empty query param descriptions from showing up in the result, keeps collections clean.
            _.has(queryParam, 'description') && _.isEmpty(queryParam.description) && (delete queryParam.description);
            _.has(queryParam, 'disabled') && (queryParam.enabled = !queryParam.disabled);
            delete queryParam.disabled;

            return queryParam;
        }));

        // item truthiness is already validated by this point
        request.headerData = _.map(item.request && (item.request.headers || item.request.header), function (header) {
            // Prevents empty query param descriptions from showing up in the result, keeps collections clean.
            _.has(header, 'description') && _.isEmpty(header.description) && (delete header.description);
            _.has(header, 'disabled') && (header.enabled = !header.disabled);
            delete header.disabled;

            return header;
        });

        return request;
    },

    /**
     * Creates a V1 compatible array of requests from a Postman V2 collection.
     *
     * @param collectionV2
     */
    requests: function (collectionV2) {
        var self = this,
            requests = [],
            id = (collectionV2.info.id || collectionV2.info._postman_id || collectionV2.id);

        _.forEach(self.extractItems(collectionV2), function (item) {
            var requestV1 = self.request(item, id);
            requests.push(requestV1);
        });
        return requests;
    },

    /**
     * Creates a V1 compatible array of solo requestIds from a Postman collection V2
     *
     * @param collectionV2
     */
    order: function (collectionV2) {
        var itemArray = collectionV2.items || collectionV2.item,
            allItems = _.isArray(itemArray) ? itemArray : [itemArray];
        return _.filter(_.map(allItems, function (item) {
            if (!item) { return; }

            var isFolder = (item.items || item.item);
            if (!isFolder) {
                return item.id || item._postman_id;
            }
        }));
    },

    /**
     * Creates a V1 compatible array of folder orders from a Postman collection V2
     *
     * @param folderOrCollection
     */
    folders_order: function (folderOrCollection) {
        var itemArray = folderOrCollection.items || folderOrCollection.item,
            allItems = _.isArray(itemArray) ? itemArray : [itemArray];

        return _.filter(_.map(allItems, function (item) {
            if (!item) { return; }

            var isFolder = (item.items || item.item);
            if (isFolder) {
                return item.id || item._postman_id;
            }
        }));
    },

    /**
     * Creates an array of V1 compatible folders from a V2 collection
     *
     * @param collectionV2
     */
    folders: function (collectionV2) {
        var self = this;

        return _.map(self.extractFolderItems(collectionV2), function (folder) {
            if (!folder) { return; }

            var folderItems = folder.items || folder.item,
                description = self.description(folder.description),
                auth = self.auth(folder),
                events = self.events(folder),
                variables = self.variables(folder),
                id = folder.id || folder._postman_id,
                result = {
                    id: self.options.retainIds && id ? id : util.uid(),
                    name: folder.name,
                    order: _.filter(_.map(folderItems, function (f) {
                        if (!f) { return; }

                        var isFolder = (f.items || f.item);
                        return !isFolder && (f.id || f._postman_id);
                    })),
                    folders_order: self.folders_order(folder)
                };

            ((auth && auth.type) || (auth === null)) && (result.auth = auth);
            events && events.length && (result.events = events);
            variables && variables.length && (result.variables = variables);

            // Prevent empty folder descriptions from showing up in the result, keeps collections clean.
            !_.isEmpty(description) && (result.description = description);
            return result;
        });
    },

    /**
     * Creates the v1.0.0 compatable description string from the v2.0.0 description format.
     *
     * @param descriptionV2
     *
     * @returns {String=}
     */
    description: function (descriptionV2) {
        if (_.isObject(descriptionV2) && !_.isEmpty(descriptionV2.content)) {
            return _.isString(descriptionV2.content) ? descriptionV2.content : '';
        }
        return _.isString(descriptionV2) ? descriptionV2 : '';
    }
});

module.exports = {
    input: '2.0.0',
    output: '1.0.0',
    Builders: Builders,

    /**
     * Converts a single V2 item to a V1 request.
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
            converted = builders.request(_.cloneDeep(request));
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
     * Converts a single V2 item to a V1 request.
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
            converted = builders.response(_.cloneDeep(response));
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
     * Converts a V2 collection to a V1 collection (performs ID replacement, etc as necessary).
     *
     * @param collection
     * @param options
     * @param callback
     * @returns {*}
     */
    convert: function (collection, options, callback) {
        collection = _.cloneDeep(collection);

        var auth,
            events,
            variables,
            description,
            builders = new Builders(options),
            authOptions = { excludeNoauth: true },
            varOpts = { fallback: options && options.env },
            units = ['order', 'folders_order', 'folders', 'requests'],
            id = _.get(collection, 'info._postman_id') || _.get(collection, 'info.id'),
            newCollection = {
                id: id && options && options.retainIds ? id : util.uid(),
                name: collection.info.name
            };

        // ensure that each item has an ID
        collection = v2Common.populateIds(collection);
        try {
            // eslint-disable-next-line max-len
            (description = builders.description(collection.info.description)) && (newCollection.description = description);
            (auth = builders.auth(collection, authOptions)) && (newCollection.auth = auth);
            (events = builders.events(collection)) && (newCollection.events = events);
            (variables = builders.variables(collection, varOpts)) && (newCollection.variables = variables);

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
