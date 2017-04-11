/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var expect = require('expect.js'),
    transformer = require('../../index');

/* global describe, it */
describe('v2.0.0 to v1.0.0', function () {
    describe('api', function () {
        it('should have a .convertSingle() function', function () {
            expect(transformer.convertSingle).to.be.a('function');
            expect(transformer.convertSingle.length).to.be(3);
        });
    });

    describe('transformer', function () {
        it('.convertSingle()', function (done) {
            var fixture = require('./fixtures/single-request'),
                options = {
                    inputVersion: '2.0.0',
                    outputVersion: '1.0.0',
                    retainIds: true
                };

            transformer.convertSingle(fixture.v2, options, function (err, converted) {
                expect(err).to.not.be.ok();

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));
                [
                    'id',
                    'name',
                    'description',
                    'method',
                    'headers',
                    'dataMode',
                    'data',
                    'rawModeData',
                    'tests',
                    'preRequestScript',
                    'url',
                    'responses'
                ].forEach(function (p) {
                    expect(converted).to.have.property(p);
                });
                done();
            });
        });
    });
});
