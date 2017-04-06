/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var expect = require('expect.js'),
    _ = require('lodash'),
    transformer = require('../../index');

/* global describe, it */
describe('v2.0.0 to v1.0.0', function () {
    describe('api', function () {
        it('should have a create function', function () {
            expect(transformer.create).to.be.a('function');
            expect(transformer.create.length).to.be(1);
        });

        it('should be able to create a converter instance', function () {
            var options = {
                    inputVersion: '2.0.0',
                    outputVersion: '1.0.0',
                    retainIds: true
                },
                converter = transformer.create(options);

            expect(converter.options).to.be(options);
        });
    });

    describe('Converter', function () {
        it('.request()', function () {
            var fixture = require('./fixtures/single-request'),
                converter = transformer.create({
                    inputVersion: '2.0.0',
                    outputVersion: '1.0.0',
                    retainIds: true
                }),
                converted;

            // the v2 tp v
            converted = JSON.parse(JSON.stringify(converter.request(fixture.v2), fixture.v1.collectionId));

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
        });
    });
});
