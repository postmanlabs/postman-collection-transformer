/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var expect = require('expect.js'),
    requireAll = require('require-all'),
    path = require('path'),
    tv4 = require('tv4'),
    _ = require('lodash');

describe('v1.0.0 ==> v2.0.0', function () {
    var fs = require('fs'),
        converter = require('../../lib/converters/converter-v1-to-v2'),
        schema = require('../../lib/schemas/json/collection/v2.0.0-draft.1/index'),
        examplesDir = path.join(__dirname, '../../examples/v1');

    describe('sample conversions', function () {
        var samples = requireAll(examplesDir);
        _.map(samples, function (sample, sampleName) {
            it('must create a valid V2 collection from ' + sampleName + '.json', function () {
                converter.convert(sample, {}, function (err, converted) {
                    var result = tv4.validate(converted, schema);
                    expect(result).to.be(true);
                });
            })
        })
    })
});
