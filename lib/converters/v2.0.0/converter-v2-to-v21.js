var _ = require('lodash').noConflict(),

    url = require('../../url'),
    v2Common = require('../common/v2'),
    constants = require('../../constants'),

    Builders = function ConversionBuilder (options) {
        this.options = options || {};
    };

_.assign(Builders.prototype, {

    auth: function (auth) {
        if (!auth) { return; }

        // the auth structure is one of the differences across the v2.0.0 and v2.1.0 formats
        // only convert if auth params aren't already an array.
        if (_.has(auth, 'type') && !_.isArray(auth[auth.type])) {
            auth[auth.type] = _.map(auth[auth.type], function (value, key) {
                return { key: key, value: value };
            });
        }

        return auth;
    },

    url: function (v2Url) {
        var self = this;

        _.isString(v2Url) && (v2Url = url.parse(v2Url));

        v2Url.variable && (v2Url.variable = self.variable(v2Url.variable));

        return v2Url;
    },

    variable: function (variables) {
        return _.map(variables, function (variable) {
            if (_.has(variable, 'id')) {
                !_.has(variable, 'key') && (variable.key = variable.id);
                delete variable.id;
            }

            return variable;
        });
    },

    /**
     * Converts a V2 request to a V2.1 request.
     *
     * @param {Object} request - The wrapped request instance to be converted.
     * @returns {Object} An equivalent v1.0.0 representation for the current v2.1.0 request.
     */
    request: function (request) {
        if (!request) { return; }

        var self = this,
            fields = ['auth', 'url'];

        fields.forEach(function (field) {
            var value = request[field];

            if (!(value && _.isFunction(self[field]))) { return; }

            request[field] = self[field](value);
        });

        return request;
    },

    /**
     * Converts a response from the v2.0.0 format to the v2.1.0 format.
     *
     * @param {Object} response - The incoming array of response objects to be converted.
     * @returns {Object} - The processed responses array for v2.1.0 compliance.
     */
    response: function (response) {
        var self = this;

        response.originalRequest = self.request(response.originalRequest);
        return response;
    },

    /**
     * Normalizes incoming itemGroups (folders) for v2.1.0 format compliance.
     *
     * @param {Object} itemGroup - The collection/folder to be converted to the v2.1.0 format.
     * @returns {Object} - The processed collection/folder in v2.1.0 format.
     */
    item: function (itemGroup) {
        var self = this,
            newItemGroup = {},
            id = itemGroup && (itemGroup._postman_id || itemGroup.id);

        self.options.retainIds && (newItemGroup._postman_id = id);
        // The order is important here, hence this is being done outside the initialization
        itemGroup.name && (newItemGroup.name = itemGroup.name);
        !_.isEmpty(itemGroup.description) && (newItemGroup.description = itemGroup.description);

        newItemGroup.item = _.map(itemGroup.item || itemGroup.items, function (item) {
            return self.itemSingle(item);
        });

        return newItemGroup;
    },

    /**
     * Converts items and item groups in the v2.0.0 format to the v2.1.0 format.
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

        // handle malformed v2 entities as well
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
    input: '2.0.0',
    output: '2.1.0',
    Builders: Builders,

    /**
     * Converts a single V2 item to a V2.1 item.
     *
     * @param {Object} item - The request to convert to v2.1.0.
     * @param {Object} options - The set of options for the v2.0.0 to v2.1.0 request conversion.
     * @param {?Function} callback - The function invoked when the conversion has completed.
     * @returns {*} - The converted v2.1.0 request.
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
     * Converts a single V2 item to a V2.1 request.
     *
     * @param {Object} response - The response object to be converted to v2.1.0.
     * @param {Object} options - The set of options for the current response conversion.
     * @param {?Function} callback - The function invoked when the response has been converted.
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
     * Converts a V2 collection to a V2.1 collection (performs ID replacement, etc as necessary).
     *
     * @param {Object} collection - The v2.0.0 collection to be converted to v2.1.0.
     * @param {Object} options - The set of options passed to the current conversion sequence.
     * @param {?Function} callback - The function invoked when the v2 -> v2.1.0 conversion has completed.
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

        // the order is important
        options && options.env && (newCollection.variables = builders.variables(options.env));
        info && info.name && (newCollection.info.name = info.name);
        newCollection.info.schema = constants.SCHEMA_V2_1_0_URL;
        newCollection.item = builders.item(collection).item;

        if (callback) { return callback(null, newCollection); }
        return newCollection;
    },

    authMap: v2Common.authMap
};
