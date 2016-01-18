/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var expect = require('expect.js'),
    requireAll = require('require-all'),
    path = require('path'),
    tv4 = require('tv4'),
    _ = require('lodash');

/* global describe, it */
describe('v1.0.0 ==> v2.0.0', function () {
    var converter = require('../../lib/converters/converter-v1-to-v2'),
        schema = require('../../lib/schemas/json/collection/v2.0.0-draft.4/index'),
        examplesDir = path.join(__dirname, '../../examples/v1');

    describe('sample conversions', function () {
        var samples = requireAll(examplesDir);
        _.map(samples, function (sample, sampleName) {
            it('must create a valid V2 collection from ' + sampleName + '.json', function (done) {
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
                        console.log(JSON.stringify(tv4.error, null, 4)); // Helps debug on CI
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
});
