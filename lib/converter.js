var util = require('./util'),
    semver = require('semver'),
    logger = require('winston'),

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
    var Converter,
        error;

    // validate the model
    if (!model) {
        error = util.format('invalid definition of converter');
    }
    // ensure that the input version support is a valid semver
    else if (!semver.valid(model.input)) {
        error = util.format('input version support for converter %s is invalid');
    }
    // ensure that the output version support is a valid semver
    else if (!semver.valid(model.output)) {
        error = util.format('output version support for converter %s is invalid');
    }

    // @todo:
    // - check to ensure that output does NOT lie within the input range using semver.satisfies
    // - ensure that model.convert exists as a function

    // If we had encouneterd any error during validation, we simply exit by executing the callback and forwarding the
    // error.
    if (error) {
        throw new Error(error);
    }

    // Create the converter function for constructor definition
    Converter = function () {
        // execute the model init if it is defined
        this.init && this.init.apply(this, arguments);
    };

    // Use the model to create the prototype
    util.extend(Converter.prototype, model);

    return Converter;
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

        resolve: function (definition) {
            try {
                return generateConverter(definition);
            }
            catch (err) {
                logger.error('Could not load module %s: ', 'some-name', err.message || err);
            }
        }
    }),

    convert: function (/* inputVersion, outputVersion, */ options) {
        // @todo: for now it could be hard-coded getter for 1>2 and 2>1.
        return new this.converters['some-name'](options);
    }
};
