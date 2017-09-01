var _ = require('lodash').noConflict(),
    util = require('../../util'),
    inherits = require('inherits'),

    v2Common = require('../common/v2'),
    BaseBuilders = require('../v2.0.0/converter-v2-to-v1').Builders,

    Builders;

inherits(Builders = function ConversionBuilder () {
    Builders.super_.apply(this, arguments);
}, BaseBuilders);

_.extend(Builders.prototype, {
    /**
     * Converts a V2.1 request to a V1 request.
     *
     * @param {Item|Object} item - The wrapped request instance to be converted.
     * @param {String} collectionId - The collection id to be added to the converted v1.0.0 compliant request.
     * @param {Boolean} skipResponses - Will result in saved responses being ignored for conversion if set to true.
     * @returns {Object} An equivalent v1.0.0 representation for the current v2.1.0 request.
     */
    request: function (item, collectionId, skipResponses) {
        var auth = _.get(item, 'request.auth');

        if (auth && auth.type && _.isArray(auth[auth.type])) {
            auth[auth.type] = _.transform(auth[auth.type], function (a, element) {
                a[element.key] = element.value;
            }, {});

            item.request.auth = auth;
        }

        // call the superclass method.
        return Builders.super_.prototype.request.apply(this, [item, collectionId, skipResponses]);
    }
});

module.exports = {
    input: '2.1.0',
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
        var err,
            converted,
            builders = new Builders(options);

        try { converted = builders.request(_.cloneDeep(request)); }
        catch (e) { err = e; }

        if (callback) { return callback(err, converted); }

        if (err) { throw err; }

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

        try { converted = builders.response(_.cloneDeep(response)); }
        catch (e) { err = e; }

        if (callback) { return callback(err, converted); }

        if (err) { throw err; }

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

        if (!(_.get(collection, 'info._postman_id') || _.get(collection, 'info.id'))) {
            _.set(collection, 'info.id', util.uid());
        }

        var builders = new Builders(options),
            units = ['order', 'folders_order', 'folders', 'requests'],
            description = builders.description(collection.info.description),
            newCollection = {
                id: _.get(collection, 'info._postman_id') || _.get(collection, 'info.id') || util.uid(),
                name: collection.info.name
            };

        !_.isEmpty(description) && (newCollection.description = description);

        // ensure that each item has an id
        collection = v2Common.populateIds(collection);
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
    }
};
