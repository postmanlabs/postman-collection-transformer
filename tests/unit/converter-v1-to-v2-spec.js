/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var expect = require('expect.js'),
    transformer = require('../../index');

/* global describe, it */
describe('v1.0.0 to v2.0.0', function () {
    describe('api', function () {
        it('should have a create function', function () {
            expect(transformer.create).to.be.a('function');
            expect(transformer.create.length).to.be(1);
        });

        it('should be able to create a converter instance', function () {
            var options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.0.0',
                    retainIds: true
                },
                converter = transformer.create(options);

            expect(converter.options).to.be(options);
        });
    });

    describe('Converter', function () {
        it('.singleItem()', function () {
            var fixture = require('./fixtures/single-request'),
                converter = transformer.create({
                    inputVersion: '1.0.0',
                    outputVersion: '2.0.0',
                    retainIds: true
                }),
                converted;

            converted = JSON.parse(JSON.stringify(converter.singleItem(fixture.v1)));

            expect(converted).to.eql(fixture.v2);
        });
    });
});
