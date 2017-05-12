/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var expect = require('expect.js'),
    transformer = require('../../index');

/* global describe, it */
describe('v1.0.0 to v2.0.0', function () {
    describe('api', function () {
        it('should have a .convertSingle() function', function () {
            expect(transformer.convertSingle).to.be.a('function');
            expect(transformer.convertSingle.length).to.be(3);
        });

        it('should have a .convert() function', function () {
            expect(transformer.convert).to.be.a('function');
            expect(transformer.convert.length).to.be(3);
        });
    });

    describe('transformer', function () {
        it('.convertSingle()', function (done) {
            var fixture = require('./fixtures/single-request'),
                options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.0.0',
                    retainIds: true
                };

            transformer.convertSingle(fixture.v1, options, function (err, converted) {
                expect(err).to.not.be.ok();

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v2);
                done();
            });
        });

        it('.convert()', function (done) {
            var fixture = require('./fixtures/sample-collection'),
                options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.0.0',
                    retainIds: true
                };

            transformer.convert(fixture.v1, options, function (err, converted) {
                expect(err).to.not.be.ok();

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v2);
                done();
            });
        });
    });

    describe('descriptions', function () {
        it('should correctly handle descriptions whilst converting from v1 to v2', function (done) {
            var fixture = require('./fixtures/sample-description'),
                options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.0.0',
                    retainIds: true
                };

            transformer.convert(fixture.v1, options, function (err, converted) {
                expect(err).to.not.be.ok();

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v2);
                done();
            });
        });
    });
});
