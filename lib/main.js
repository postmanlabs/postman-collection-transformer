var converter = require('./converter'),
    util = require('./util'),
    semver = require('semver');

module.exports = {
    convert: function (collection, options, callback) {
        if (!options.outputVersion || !semver.valid(options.outputVersion, true)) {
            return callback(new Error('Output version not specified or invalid: ' + options.outputVersion));
        }
        if (!options.inputVersion || !semver.valid(options.inputVersion, true)) {
            return callback(new Error('Input version not specified or invalid: ' + options.inputVersion));
        }

        return converter.convert(collection, options, callback);
    },

    util: util,

    isv1: function (object) {
        return (object.name && object.order && object.requests);
    },

    isv2: function (object) {
        return object && object.info && object.info.schema;
    }
};
