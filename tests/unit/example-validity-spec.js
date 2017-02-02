var expect = require('expect.js'),
    requireAll = require('require-all'),
    path = require('path'),
    tv4 = require('tv4'),
    _ = require('lodash').noConflict(),
    agent = require('superagent');

describe('Example validity', function () {
    // The V1 collections contain random stuff for extremely old collections, so their tests are skipped
    describe.skip('v1.0.0', function () {
        var schemaUrl = require('../../lib/constants').SCHEMA_V1_URL,
            examplesDir = path.join(__dirname, '../../examples/v1.0.0'),
            schema,
            samples = requireAll(examplesDir);

        before(function (done) {
            agent.get(schemaUrl, function (error, response) {
                schema = _.isString(response.body) ? JSON.parse(response.body) : response.body;
                done(error);
            });
        });

        _.forEach(samples, function (sample, sampleName) {
            it('must be a valid V1 collection: ' + sampleName + '.json', function (done) {
                var validator = tv4.freshApi(),
                    result;
                validator.addSchema(schema);
                // Some of the converter functions assign "undefined" value to some properties,
                // It is necessary to get rid of them (otherwise schema validation sees an "undefined" and fails).
                // Converting to and parsing from JSON does this.
                result = validator.validate(sample, schema);
                if (!result) {
                    console.log(JSON.stringify(validator.error, null, 4)); // Helps debug on CI
                }
                if (validator.missing.length) {
                    console.log(validator.missing);
                    result = false;
                }
                expect(result).to.be(true);
                done();
            });
        });
    });

    describe('v2.0.0', function () {
        var schemaUrl = require('../../lib/constants').SCHEMA_V2_URL,
            examplesDir = path.join(__dirname, '../../examples/v2.0.0'),
            schema,
            samples = requireAll(examplesDir);

        before(function (done) {
            agent.get(schemaUrl, function (error, response) {
                schema = _.isString(response.body) ? JSON.parse(response.body) : response.body;
                done(error);
            });
        });

        _.forEach(samples, function (sample, sampleName) {
            it('must be a valid V2 collection: ' + sampleName + '.json', function (done) {
                var validator = tv4.freshApi(),
                    result;
                validator.addSchema(schema);
                // Some of the converter functions assign "undefined" value to some properties,
                // It is necessary to get rid of them (otherwise schema validation sees an "undefined" and fails).
                // Converting to and parsing from JSON does this.
                result = validator.validate(sample, schema);
                if (!result) {
                    console.log(JSON.stringify(validator.error, null, 4)); // Helps debug on CI
                }
                if (validator.missing.length) {
                    console.log(validator.missing);
                    result = false;
                }
                expect(result).to.be(true);
                done();
            });
        });
    });
});
