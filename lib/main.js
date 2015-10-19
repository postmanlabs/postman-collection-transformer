var converter = require('./converter'),
    util = require('./util'),
    semver = require('semver');

module.exports = {
    convertFile: function (options, callback) {
        if (!options.output) { return callback(new Error('Output path must be specified.')); }
        if (!options.input) { return callback(new Error('Input file path must be specified.')); }

        var self = this;

        util.loadJSON(options.input, function (err, collection) {
            if (err) { return callback(err); }

            if (options.env) {
                util.loadJSON(options.env, function (err, environment) {
                    options.env = environment;
                    return self.convert(collection, options, callback);
                });
            }
            else {
                return self.convert(collection, options, callback);
            }
        });
    },

    convert: function (collection, options, callback) {
        if (!options.outputVersion || !semver.valid(options.outputVersion, true)) {
            return callback(new Error('Output version not specified or invalid: ' + options.outputVersion));
        }
        if (!options.inputVersion || !semver.valid(options.inputVersion, true)) {
            return callback(new Error('Input version not specified or invalid: ' + options.inputVersion));
        }

        return converter.convert(collection, options, callback);
    },

    util: util
};
