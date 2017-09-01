var inherits = require('inherits'),
    _ = require('lodash').noConflict(),

    constants = require('../../constants'),
    BaseBuilders = require('./converter-v1-to-v2').Builders,
    Builders,
    typeMap = {
        string: 'string',
        boolean: 'boolean',
        number: 'number'
    };

inherits(Builders = function ConversionBuilder () {
    Builders.super_.apply(this, arguments);
}, BaseBuilders);

_.assign(Builders.prototype, {

    /**
     * Derives v2.1.0 collection info from a v1.0.0 collection object.
     *
     * @param collectionV1 - The v1.0.0 collection object to be converted to v2.1.0.
     * @return {Object} - The compiled v2.x collection info manifest.
     */
    info: function (collectionV1) {
        var info = Builders.super_.prototype.info.call(this, collectionV1);

        info.schema = constants.SCHEMA_V2_1_0_URL;

        return info;
    },

    /**
     * A number of auth parameter names have changed from V1 to V2. This function calls the appropriate
     * mapper function, and creates the V2 auth parameter object.
     *
     * @param {Object} requestV1 - A Collection V1 compliant request instance
     * @returns {{type: *}} - The v2.1.0 compliant request object
     */
    auth: function (requestV1) {
        var result,
            auth = Builders.super_.prototype.auth.call(this, requestV1);

        if (!(auth && auth.type && auth[auth.type])) { return; }

        result = { type: auth.type }; // @todo: Replace this with ES6 style dynamic property definition later
        result[auth.type] = _.map(auth[auth.type], function (value, key) {
            return {
                key: key,
                value: value,
                type: typeMap[typeof value] || 'any'
            };
        });

        return result;
    }
});

module.exports = {
    input: '1.0.0',
    output: '2.1.0',
    Builders: Builders,

    /**
     * Converts a single V1 request to a v2.1.0 item.
     *
     * @param {Object} request - The v1.0.0 request to be converted to a v2.1.0 format.
     * @param {Object} options - The set of options for the current conversion sequence.
     * @param {?Function} callback - The function invoked to mark the end of the current conversion process.
     * @returns {*}
     */
    convertSingle: function (request, options, callback) {
        var err,
            converted,
            builders = new Builders(options);

        try { converted = builders.singleItem(_.cloneDeep(request)); }
        catch (e) { err = e; }

        if (callback) { return callback(err, converted); }

        if (err) { throw err; }

        return converted;
    },

    /**
     * Converts a single V1 Response to a v2.1.0 Response.
     *
     * @param {Object} response - The V1 compliant response to convert to a v2.1.0 format.
     * @param {Object} options - The set of options for the current conversion process.
     * @param {?Function} callback - The function invoked to mark the completion of the response conversion.
     * @returns {*}
     */
    convertResponse: function (response, options, callback) {
        var err,
            converted,
            builders = new Builders(options);

        try { converted = builders.singleResponse(_.cloneDeep(response)); }
        catch (e) { err = e; }

        if (callback) { return callback(err, converted); }

        if (err) { throw err; }

        return converted;
    },

    /**
     * Converts a V1 collection to a V2 collection (performs ID replacement, etc as necessary).
     *
     * @param {Object} collection - The V1 collection instance to convert to a v2.1.0 format.
     * @param {Object} options - The set of options for the current conversion sequence.
     * @param {?Function} callback - The function invoked to mark the completion of the conversion process/
     * @returns {*}
     */
    convert: function (collection, options, callback) {
        collection = _.cloneDeep(collection);

        var units = ['info', 'item'],
            builders = new Builders(options),
            newCollection = {};

        options && options.env && (newCollection.variables = builders.variables(options.env));

        try {
            units.forEach(function (unit) {
                newCollection[unit] = builders[unit](collection);
            });
        }
        catch (e) {
            if (callback) { return callback(e); }
            throw e;
        }

        if (callback) { return callback(null, newCollection); }
        return newCollection;
    }
};
