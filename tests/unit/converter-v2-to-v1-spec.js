/**
 * @fileoverview This test suite runs tests on the V2 to V1 converter.
 */

var expect = require('expect.js'),
    requireAll = require('require-all'),
    path = require('path'),
    tv4 = require('tv4'),
    _ = require('lodash'),
    agent = require('superagent');

/* global describe, it, before */
describe('v2.0.0 ==> v1.0.0', function () {
    var converter = require('../../lib/converters/converter-v2-to-v1'),
        schemaUrl = require('../../lib/constants').SCHEMA_V1_URL,
        examplesDir = path.join(__dirname, '../../examples/v2.1.0');

    describe('sample conversions', function () {
        var schema,
            samples = requireAll(examplesDir);

        before(function (done) {
            agent.get(schemaUrl, function (error, response) {
                schema = _.isString(response.body) ? JSON.parse(response.body) : response.body;
                done(error);
            });
        });

        it('must create a V1 collection with multi folder support from twitter_multifolder', function (done) {
            converter.convert(samples.twitter_multifolder, {
                flattenMultiFolders: true
            }, function (err, converted) {
                var validator = tv4.freshApi(),
                    result,
                    innerFolder;
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
                expect(result).to.be(true);
                expect(err).to.be(null);

                // Atleast 1 folder with a parentId
                innerFolder = _.find(converted.folders, function (folder) {
                    return folder.parentId;
                });
                expect(innerFolder).to.be.ok();

                done();
            });
        });

        _.forEach(samples, function (sample, sampleName) {
            it('must create a valid V1 collection from ' + sampleName + '.json', function (done) {
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
                    expect(result).to.be(true);
                    expect(err).to.be(null);
                    done();
                });
            });
        });

        _.forEach(samples, function (sample, sampleName) {
            it('must create a valid V1 collection from ' + sampleName + '.json with synchronous API', function (done) {
                var validator = tv4.freshApi(),
                    result,
                    converted;
                validator.addSchema(schema);
                converted = converter.convert(sample);

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
                expect(result).to.be(true);
                done();
            });
        });
    });

    it.skip('must be compatible with both v2.0.0 and v2.1.0 formats', function () {
        var samples_2_1_0 = requireAll(path.join(__dirname, '../../examples/v2.1.0')),
            samples_2_0_0 = requireAll(path.join(__dirname, '../../examples/v2.0.0')),

            deepCompare = function (first, second, omitProperties) {
                if (_.isNaN(first) ||
                    _.isDate(first) ||
                    _.isString(first) ||
                    _.isBoolean(first) ||
                    _.isNumber(first) ||
                    _.isNull(first)) {
                    return first === second;
                }

                for (var key in first) {
                    if (!first.hasOwnProperty(key)) {
                        continue;
                    }
                    if (_.includes(omitProperties, key)) {
                        if (_.isArray(first[key])) {
                            return first[key].length === second[key].length;
                        }
                        continue;
                    }
                    if (!deepCompare(first[key], second[key], omitProperties)) {
                        return false;
                    }
                }
                return true;
            };

        expect(_.keys(samples_2_0_0)).to.eql(_.keys(samples_2_1_0));

        _.forOwn(samples_2_0_0, function (sample, sampleName) {
            var convertedExpectation = converter.convert(sample),
                convertedActual = converter.convert(samples_2_1_0[sampleName]);

            expect(_.keys(convertedExpectation)).to.eql(_.keys(convertedActual));
            expect(_.keys(convertedExpectation)).to.not.be.empty();

            expect(deepCompare(convertedExpectation, convertedActual, ['id', 'order'])).to.equal(true);
        });
    });
});
