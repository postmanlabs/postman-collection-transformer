var converter = require('./converter'),
    util = require('./util'),
    semver = require('semver');

module.exports = {
    convert: function (options, callback) {
        if (!options.output) {
            callback(new Error('Output path must be specified.'));
            return;
        }
        if (!options.input) {
            callback(new Error('Input file path must be specified.'));
            return;
        }
        if (!options.outputVersion || !semver.valid(options.outputVersion, true)) {
            callback(new Error('Output version not specified or invalid: ' + options.outputVersion));
            return;
        }
        if (!options.inputVersion || !semver.valid(options.inputVersion, true)) {
            callback(new Error('Input version not specified or invalid: ' + options.inputVersion));
            return;
        }

        util.loadJSON(options.input, function (err, collection) {
            if (err) {
                callback(err);
                return;
            }
            if (options.env) {
                util.loadJSON(options.env, function (err, environment) {
                    options.env = environment;
                    converter.convert(collection, options, callback);
                });
            }
            else {
                converter.convert(collection, options, callback);
            }
        });
    },

    util: util
};
