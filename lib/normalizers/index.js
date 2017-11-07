var semver = require('semver'),

    // @todo: Add support for more normalizers
    normalizers = {
        '1.0.0': require('./v1')
    };

module.exports = {
    /**
     * Accepts the arguments for normalization and invokes the appropriate normalizer with them.
     *
     * @param {Object} collection - The plain collection JSON to be normalized.
     * @param {Object} options - A set of options for the current normalization.
     * @param {Function} callback - A function invoked to indicate the completion of the normalization process.
     * @returns {*}
     */
    normalize: function (collection, options, callback) {
        var version;

        if (!options || !(version = semver.valid(options.normalizeVersion, true)) || !normalizers[version]) {
            return callback(new Error('Version not specified or invalid: ' + options.version));
        }

        return normalizers[version].normalize(collection, options, callback);
    },

    /**
     * Normalizes a single request or item as per the provided version.
     *
     * @param {Object} object - The entity to be normalized.
     * @param {Object} options - The set of options to be applied to the current normalization.
     * @param {Function} callback - The function invoked when the normalization has completed.
     */
    normalizeSingle: function (object, options, callback) {
        var version;

        if (!options || !(version = semver.valid(options.normalizeVersion, true)) || !normalizers[version]) {
            return callback(new Error('Version not specified or invalid: ' + options.version));
        }

        return normalizers[version].normalizeSingle(object, options, callback);
    },

    /**
     * Normalizes a single response as per the provided version.
     *
     * @param {Object} response - The response to be normalized.
     * @param {Object} options - The set of options to be applied to the current normalization.
     * @param {Function} callback - The function invoked when the normalization has completed.
     */
    normalizeResponse: function (response, options, callback) {
        var version;

        if (!options || !(version = semver.valid(options.normalizeVersion, true)) || !normalizers[version]) {
            return callback(new Error('Version not specified or invalid: ' + options.version));
        }

        return normalizers[version].normalizeResponse(response, options, callback);
    }
};
