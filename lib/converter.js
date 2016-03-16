var semver = require('semver'),
    FN = 'function',
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
        error = 'input version ' + model.input + ' matches output version ' + model.output + ' for converter';
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
    converters: {
        'converter-v1-to-v2': require('./converters/converter-v1-to-v2'),
        'converter-v2-to-v1': require('./converters/converter-v2-to-v1')
    },

    /**
     * @returns {Converter}
     */
    getConverter: function (inputVersion, outputVersion) {
        var converter;

        inputVersion = semver.clean(inputVersion);
        outputVersion = semver.clean(outputVersion);

        for (converter in this.converters) {
            converter = this.converters.hasOwnProperty(converter) && this.converters[converter];
            if (converter && semver.eq(converter.input, inputVersion) && semver.eq(converter.output, outputVersion)) {
                return generateConverter(converter);
            }
        }
    },

    convert: function (collection, options, callback) {
        var chosenConverter = this.getConverter(options.inputVersion, options.outputVersion);

        if (!chosenConverter) {
            return callback(new Error('no conversion path found'));
        }
        return chosenConverter.convert(collection, options, callback);
    }
};
