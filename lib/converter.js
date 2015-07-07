var semver = require('semver'),
    path = require('path'),

    FN = 'function',
    BASE_CONVERTER_DIR = './converters',
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

    if (semver.satisfies(model.input, model.output)) {
        error = 'input version ' + model.input + ' matches output version ' + model.output + ' for converter'
    }

    // If we had encountered any error during validation, we simply exit by executing the callback and forwarding the
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
        dirname: path.join(__dirname, BASE_CONVERTER_DIR),
        excludeDirs: /^\.(git|svn)$/,
        filter: /(.+)\.js$/,

        map: function (name) {
            return name; // @todo map the semver name for better readibility
        },

        resolve: function (model) {
            try {
                return generateConverter(model);
            }
            catch (err) {
                console.log('Could not load module %s: ', 'some-name', err.message || err);
            }
        }
    }),

    /**
     * @returns {Converter}
     */
    get: function (inputVersion, outputVersion) {
        var converterName,
            converter;
        inputVersion = semver.clean(inputVersion);
        outputVersion = semver.clean(outputVersion);

        for (converterName in this.converters) {
            if (this.converters.hasOwnProperty(converterName)) {
                converter = this.converters[converterName];
                if (semver.eq(converter.input, inputVersion) && semver.eq(converter.output, outputVersion)) {
                    return converter;
                }
            }
        }
    },

    convert: function (collection, options, callback) {
        var converter = this.get(options.inputVersion, options.outputVersion);

        if (!converter) {
            return callback(new Error('no conversion path found'));
        }
        converter.convert(collection, options, callback);
    }
};
