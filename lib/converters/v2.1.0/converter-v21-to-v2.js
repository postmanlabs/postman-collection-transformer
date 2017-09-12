var _ = require('lodash').noConflict(),

    url = require('../../url'),
    v2Common = require('../common/v2'),
    constants = require('../../constants'),

    Builders = function ConversionBuilder (options) {
        this.options = options || {};
    };

_.assign(Builders.prototype, {

    /**
     * Converts a request auth record from the V2.1.0 to the V2.0.0 format.
     *
     * @param {Object} auth - The v2.1.0 compliant request auth manifest to be converted.
     * @returns {Object} - An equivalent v2.0.0 representation for the current v2.1.0 request auth structure.
     */
    auth: function (auth) {
        if (!auth) { return; }

        // the auth structure is the only difference across the v2.1.0 and v2.0.0 formats
        // only convert if auth params aren't already an object.
        if (_.has(auth, 'type') && !_.isObject(auth[auth.type])) {
            auth[auth.type] = _.transform(auth[auth.type], function (result, value, key) {
                result[key] = value;
            }, {});
        }

        return auth;
    },

    /**
     * Converts a V2.1.0 request URL to a V2.0.0 request URL.
     *
     * @param {Object} v21Url - The wrapped request instance to be converted.
     * @returns {Object} An equivalent v2.0.0 representation for the current v2.1.0 request URL.
     */
    url: function (v21Url) {
        if (!v21Url) { return; }

        return (v21Url.query || v21Url.variable) ? v21Url : url.unparse(v21Url);
    },

    /**
     * Converts a V2.1.0 request to a V2.0.0 request.
     *
     * @param {Object} request - The wrapped request instance to be converted.
     * @returns {Object} An equivalent v2.0.0 representation for the current v2.1.0 request.
     */
    request: function (request) {
        if (!request) { return; }

        var self = this,
            fields = ['auth', 'url']; // this array represents fields that differ across the v2.0.0 and v2.1.0 formats

        fields.forEach(function (field) {
            var value = request[field];

            // it's good to be paranoid
            if (!(value && _.isFunction(self[field]))) { return; }

            request[field] = self[field](value);
        });

        return request;
    },

    /**
     * Converts a response from the v2.1.0 format to the v2.0.0 format.
     *
     * @param {Object} response - The incoming array of response objects to be converted.
     * @returns {Object} - The processed responses array for v2.0.0 compliance.
     */
    response: function (response) {
        response.originalRequest = this.request(response.originalRequest);
        return response;
    },

    /**
     * Normalizes incoming itemGroups (folders) for v2.0.0 format compliance.
     *
     * @param {Object} itemGroup - The folder to be converted to the v2.0.0 format.
     * @returns {Object} - The processed item group in v2.0.0 format.
     */
    item: function (itemGroup) {
        var self = this,
            newItemGroup = {},
            id = itemGroup && (itemGroup._postman_id || itemGroup.id);

        // The order is important here, hence this is being done outside the initialization
        self.options.retainIds && (newItemGroup._postman_id = id);
        itemGroup.name && (newItemGroup.name = itemGroup.name);
        !_.isEmpty(itemGroup.description) && (newItemGroup.description = itemGroup.description);

        newItemGroup.item = _.map(itemGroup.item || itemGroup.items, function (item) {
            return self.itemSingle(item);
        });

        return newItemGroup;
    },

    /**
     * Converts items and item groups in the v2.1.0 format to the v2.0.0 format.
     *
     * @param {Object} item - A v2.0.0 compliant collection object.
     * @returns {Object} - The processed set of v2.1.0 format compliant items.
     */
    itemSingle: function (item) {
        var self = this;

        // The current entity is an itemGroup(folder), process it further
        if (item && (item.item || item.items)) {
            return self.item(item);
        }

        if (_.has(item, 'id')) {
            !_.has(item, '_postman_id') && (item._postman_id = item.id);
            delete item.id;
        }

        item.request = self.request(item && item.request);
        item.response = _.map(item.response || item.responses, function (response) {
            return self.response(response);
        });

        return item;
    }
});

module.exports = {
    input: '2.1.0',
    output: '2.0.0',
    Builders: Builders,

    /**
     * Converts a single V2.1.0 item to a V2.0.0 item.
     *
     * @param item
     * @param options
     * @param callback
     * @returns {*}
     */
    convertSingle: function (item, options, callback) {
        var err,
            converted,
            builders = new Builders(options);

        try { converted = builders.itemSingle(_.cloneDeep(item)); }
        catch (e) { err = e; }

        if (callback) { return callback(err, converted); }

        if (err) { throw err; }

        return converted;
    },

    /**
     * Converts a single V2.1.0 item to a V2.0.0 request.
     *
     * @param response
     * @param options
     * @param callback
     * @returns {*}
     */
    convertResponse: function (response, options, callback) {
        var err,
            converted,
            builders = new Builders(options);

        try { converted = builders.response(_.cloneDeep(response)); }
        catch (e) { err = e; }

        if (callback) { return callback(err, converted); }

        if (err) { throw err; }

        return converted;
    },

    /**
     * Converts a V2.1.0 collection to a V2.0.0 collection (performs ID replacement, etc as necessary).
     *
     * @param collection
     * @param options
     * @param callback
     * @returns {*}
     */
    convert: function (collection, options, callback) {
        collection = _.cloneDeep(collection);

        var builders = new Builders(options),
            info = collection && collection.info,
            newCollection = {
                info: {
                    _postman_id: builders.options.retainIds ? info && (info._postman_id || info.id) : undefined
                }
            };

        options && options.env && (newCollection.variables = builders.variables(options.env));
        info && info.name && (newCollection.info.name = info.name);
        newCollection.info.schema = constants.SCHEMA_V2_URL;
        newCollection.item = builders.item(collection).item;

        if (callback) { return callback(null, newCollection); }
        return newCollection;
    },

    authMap: v2Common.authMap
};
