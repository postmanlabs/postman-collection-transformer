var converter = require('./converters'),
    normalizers = require('./normalizers'),
    util = require('./util'),
    semver = require('semver');

module.exports = {

    /**
     * Converts a Collection between different versions, based on the given input.
     *
     * @param collection
     * @param options
     * @param options.outputVersion
     * @param options.inputVersion
     * @param {Function=} callback
     * @returns {*}
     */
    convert: function (collection, options, callback) {
        if (!options.outputVersion || !semver.valid(options.outputVersion, true)) {
            return callback(new Error('Output version not specified or invalid: ' + options.outputVersion));
        }
        if (!options.inputVersion || !semver.valid(options.inputVersion, true)) {
            return callback(new Error('Input version not specified or invalid: ' + options.inputVersion));
        }

        return converter.convert(collection, options, callback);
    },

    normalize: normalizers.normalize,
    normalizeSingle: normalizers.normalizeSingle,
    normalizeResponse: normalizers.normalizeResponse,

    /**
     * Export the utilities
     */
    util: util,

    /**
     * Checks whether the given object is a v1 collection
     *
     * @param object
     * @returns {Boolean}
     */
    isv1: function (object) {
        return Boolean(object.name && object.order && object.requests);
    },

    /**
     * Checks whether the given object is a v2 collection
     *
     * @param object
     * @returns {Boolean}
     */
    isv2: function (object) {
        return Boolean(object && object.info && object.info.schema);
    },

    /**
     * Converts a single V1 request to a V2 Item, or a V2 item to a single V1 request.
     *
     * @param object - A V1 request or a V2 item.
     * @param options
     * @param options.outputVersion
     * @param options.inputVersion
     * @param callback
     */
    convertSingle: function (object, options, callback) {
        if (!options.outputVersion || !semver.valid(options.outputVersion, true)) {
            return callback(new Error('Output version not specified or invalid: ' + options.outputVersion));
        }
        if (!options.inputVersion || !semver.valid(options.inputVersion, true)) {
            return callback(new Error('Input version not specified or invalid: ' + options.inputVersion));
        }

        return converter.convertSingle(object, options, callback);
    },

    /**
     * Converts a single V1 request to a V2 Item, or a V2 item to a single V1 request.
     *
     * @param object - A V1 request or a V2 item.
     * @param options
     * @param options.outputVersion
     * @param options.inputVersion
     * @param callback
     */
    convertResponse: function (object, options, callback) {
        if (!options.outputVersion || !semver.valid(options.outputVersion, true)) {
            return callback(new Error('Output version not specified or invalid: ' + options.outputVersion));
        }
        if (!options.inputVersion || !semver.valid(options.inputVersion, true)) {
            return callback(new Error('Input version not specified or invalid: ' + options.inputVersion));
        }

        return converter.convertResponse(object, options, callback);
    }
};
