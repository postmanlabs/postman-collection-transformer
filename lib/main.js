var converter = require('./converter'),
    util = require('./util'),
    semver = require('semver');

module.exports = {

    /**
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
     * Creates a converter for the given input and output versions.
     *
     * @param options
     * @returns {Builder}
     */
    create: function (options) {
        return converter.builder(options);
    }
};
