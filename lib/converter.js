var semver = require('semver'),
    logger = require('winston'),
    async = require('async'),

    FN = 'function',
    BASE_CONVERTER_DIR = '/lib/converters',
    generateConverter; // constructor

/**
 * Prototype interface definition of a converter
 *
 * @param {string} name
 * @param {object} model
 * @param {string<semver>} model.input
 * @param {string<semver>} model.output
 * @param {function} model.convert
 * @param {function=} [model.init]
 *
 * @throws {Error} If model definition does not meet requirements
 */
generateConverter = function (model) {
    var error;

    // validate the model
    if (!model) {
        error = 'invalid definition of converter';
    }
    // ensure that the input version support is a valid semver
    else if (!semver.valid(model.input)) {
        error = 'input version support for converter is invalid';
    }
    // ensure that the output version support is a valid semver
    else if (!semver.valid(model.output)) {
        error = 'output version support for converter is invalid';
    }
    else if (typeof model.convert !== FN) {
        error = 'convert function is not defined';
    }

    // @todo:
    // - check to ensure that output does NOT lie within the input range using semver.satisfies
    // - ensure that model.convert exists as a function

    // If we had encouneterd any error during validation, we simply exit by executing the callback and forwarding the
    // error.
    if (error) {
        throw new Error(error);
    }

    return model;
};

module.exports = {
    /**
     * All converters
     * @type {object<Converter>}
     *
     * @note this form of loading is most likely not browser friendly, find browser alternative
     */
    converters: require('require-all')({
        dirname: __dirname + BASE_CONVERTER_DIR,
        excludeDirs:  /^\.(git|svn)$/,
        filter:  /(.+)\.js$/,

        map: function (name) {
            return name; // @todo map the semver name for better readibility
        },

        resolve: function (model) {
            try {
                return generateConverter(model);
            }
            catch (err) {
                logger.error('Could not load module %s: ', 'some-name', err.message || err);
            }
        }
    }),

    /**
     * @returns {Converter}
     */
    get: function (/* inputVersion, outputVersion */) {
        // @todo: implement by using a proper graph data structure or hard coded for now.
        return this.converters['some-name'];
    },

    convert: function (collection, options, callback) {
        var converters = this.get(options.inputVersion, options.outputVersion);

        if (!converters) {
            return callback(new Error('no conversion path found'));
        }

        // @todo better separate original collection var. use a final function in eachSeries, etc
        async.eachSeries(Array.isArray(converters) ? converters : (converters = [converters]), function (item, next) {
            item.convert(collection, options, function (error, transformed) {
                !error && (collection = transformed);  // make the collection the new transformed data
                next(error);
            });
        });

        // @todo - apply something similar to async.each
        callback(null, collection);
    }
};
