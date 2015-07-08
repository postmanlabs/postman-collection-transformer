var converter = require('./converter'),
    util = require('./util');

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
        if (!options.outputVersion) {
            callback(new Error('Output version must be specified.'));
            return;
        }
        if (!options.inputVersion) {
            callback(new Error('Input version must be specified.'));
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
