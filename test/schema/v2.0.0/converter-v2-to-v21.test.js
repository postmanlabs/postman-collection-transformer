/**
 * @fileoverview This test suite runs tests on the V2 to V1 converter.
 */

var expect = require('chai').expect,
    requireAll = require('require-all'),
    path = require('path'),
    tv4 = require('tv4'),
    _ = require('lodash').noConflict(),
    agent = require('superagent');

/* global describe, it, before */
describe('v2.0.0 ==> v2.1.0', function () {
    var converter = require('../../../lib/converters/v2.0.0/converter-v2-to-v21'),
        schemaUrl = require('../../../lib/constants').SCHEMA_V2_1_0_URL,
        examplesDir = path.join(__dirname, '../../../examples/v2.0.0');

    describe('sample conversions', function () {
        var schema,
            samples = requireAll(examplesDir);

        before(function (done) {
            agent.get(schemaUrl, function (error, response) {
                schema = _.isString(response.body) ? JSON.parse(response.body) : response.body;
                done(error);
            });
        });

        _.forEach(samples, function (sample, sampleName) {
            // eslint-disable-next-line max-len
            (_.includes(['echo', 'helpers'], sampleName) ? it.skip : it)('must create a valid v2.1.0 collection from ' + sampleName + '.json', function (done) {
                converter.convert(sample, {}, function (err, converted) {
                    var validator = tv4.freshApi(),
                        result;
                    validator.addSchema(schema);
                    // Some of the converter functions assign "undefined" value to some properties,
                    // It is necessary to get rid of them (otherwise schema validation sees an "undefined" and fails).
                    // Converting to and parsing from JSON does this.
                    converted = JSON.parse(JSON.stringify(converted));
                    result = validator.validate(converted, schema);
                    if (!result) {
                        console.log(JSON.stringify(validator.error, null, 4)); // Helps debug on CI
                    }
                    if (validator.missing.length) {
                        console.log(validator.missing);
                        result = false;
                    }
                    expect(result).to.equal(true);
                    expect(err).to.equal(null);
                    done();
                });
            });
        });

        _.forEach(samples, function (sample, sampleName) {
            // eslint-disable-next-line max-len
            (_.includes(['echo', 'helpers'], sampleName) ? it.skip : it)(`must create a valid v2.1.0 collection from ${sampleName}.json with synchronous API`,
                function (done) {
                    var result,
                        validator = tv4.freshApi(),
                        converted = converter.convert(sample);

                    validator.addSchema(schema);

                    // Some of the converter functions assign "undefined" value to some properties,
                    // It is necessary to get rid of them (otherwise schema validation sees an "undefined" and fails).
                    // Converting to and parsing from JSON does this.
                    converted = JSON.parse(JSON.stringify(converted));

                    result = validator.validate(converted, schema);
                    if (!result) {
                        console.log(JSON.stringify(validator.error, null, 4)); // Helps debug on CI
                    }
                    if (validator.missing.length) {
                        console.log(validator.missing);
                        result = false;
                    }
                    expect(result).to.equal(true);
                    done();
                });
        });
    });
});
