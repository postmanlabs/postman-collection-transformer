var _ = require('lodash').noConflict(),

    v2Common = require('../common/v2'),
    constants = require('../../constants'),

    Builders = function ConversionBuilder (options) {
        this.options = options || {};
    };

_.assign(Builders.prototype, {

    /**
     * Converts a V2.1.0 request to a V2.0.0 request.
     *
     * @param {Object} request - The wrapped request instance to be converted.
     * @returns {Object} An equivalent v2.0.0 representation for the current v2.1.0 request.
     */
    request: function (request) {
        var req = _.cloneDeep(request), // do not mutate the original
            auth = req && req.auth;

        if (auth) {
            // the auth structure is the only difference across the v2.1.0 and v2.0.0 formats
            // conversion is done as below to handle cases where a single request may have multiple auth manifests
            _.forEach(['aws', 'basic', 'digest', 'hawk', 'noauth', 'oauth1', 'oauth2'], function (type) {
                // only convert if auth params aren't already an object.
                if (_.has(auth, type) && !_.isObject(auth[type])) {
                    auth[type] = _.transform(auth[type], function (result, value, key) {
                        result[key] = value;
                    }, {});
                }
            });

            req.auth = auth;
        }
        return req;
    },

    /**
     * Converts a response from the v2.1.0 format to the v2.0.0 format.
     *
     * @param {Object[]} response - The incoming array of response objects to be converted.
     * @returns {Object[]} - The processed responses array for v2.0.0 compliance.
     */
    response: function (response) {
        var self = this,
            newRes = _.cloneDeep(response);

        newRes.originalRequest = self.request(newRes.originalRequest);
        return newRes;
    },

    /**
     * Normalizes incoming itemGroups (folders) for v2.0.0 format compliance.
     *
     * @param {Object} itemGroup - The folder to be converted to the v2.0.0 format.
     * @returns {Object} - The processed item group in v2.0.0 format.
     */
    itemGroup: function (itemGroup) {
        var self = this,
            id = itemGroup && (itemGroup._postman_id || itemGroup.id),
            newItemGroup = {
                _postman_id: self.options.retainIds ? id : undefined
            };

        // The order is important here, hence this is being done outside the initialization
        itemGroup.name && (newItemGroup.name = itemGroup.name);
        !_.isEmpty(itemGroup.description) && (newItemGroup.description = itemGroup.description);
        newItemGroup.item = self.item(itemGroup);

        return newItemGroup;
    },

    /**
     * Converts items and item groups in the v2.1.0 format to the v2.0.0 format.
     *
     * @param {Object} collectionV2 - A v2.0.0 compliant collection object.
     * @returns {Object[]} - The processed set of v2.1.0 format compliant items.
     */
    item: function (collectionV2) {
        var self = this,
            itemGroup = collectionV2 && (collectionV2.item || collectionV2.items);

        return _.map(itemGroup, function (item) {
            // The current entity is an itemGroup(folder), process it further
            if (item && (item.item || item.items)) {
                return self.itemGroup(item);
            }

            var newItem = _.cloneDeep(item);

            if (_.has(newItem, 'id')) {
                !_.has(newItem, '_postman_id') && (newItem._postman_id = newItem.id);
                delete newItem.id;
            }

            newItem.request = self.request(newItem && newItem.request);
            newItem.response = _.map(newItem.response || newItem.responses, function (response) {
                return self.response(response);
            });

            return newItem;
        });
    }
});

module.exports = {
    input: '2.1.0',
    output: '2.0.0',
    Builders: Builders,

    /**
     * Converts a single V2.1.0 item to a V2.0.0 request.
     *
     * @param request
     * @param options
     * @param callback
     * @returns {*}
     */
    convertSingle: function (request, options, callback) {
        var err,
            converted,
            builders = new Builders(options);

        try { converted = builders.request(request); }
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

        try { converted = builders.response(response); }
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
        var units = ['item'],
            builders = new Builders(options),
            info = collection && collection.info,
            newCollection = {
                info: {
                    _postman_id: builders.options.retainIds ? info && (info._postman_id || info.id) : undefined
                },
                // this is done to avoid mutating the original collection
                variables: (options && options.env) ? builders.variables(options.env) : []
            };

        info && info.name && (newCollection.info.name = info.name);
        newCollection.info.schema = constants.SCHEMA_V2_URL;

        try {
            units.forEach(function (unit) {
                newCollection[unit] = builders[unit](collection);
            });
        }
        catch (e) {
            if (callback) { return callback(e, null); }
            throw e;
        }

        if (callback) { return callback(null, newCollection); }
        return newCollection;
    },

    authMap: v2Common.authMap
};