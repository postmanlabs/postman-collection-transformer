var expect = require('chai').expect,
    transformer = require('../../../index');

describe('v1.0.0 normalization', function () {
    describe('api', function () {
        it('should have a .normalizeSingle() function', function () {
            expect(transformer.normalizeSingle).to.be.a('function');
            expect(transformer.normalizeSingle.length).to.equal(3);
        });

        it('should have a .normalizeResponse() function', function () {
            expect(transformer.normalizeResponse).to.be.a('function');
            expect(transformer.normalizeResponse.length).to.equal(3);
        });

        it('should have a .normalize() function', function () {
            expect(transformer.normalize).to.be.a('function');
            expect(transformer.normalize.length).to.equal(3);
        });
    });

    describe('transformer', function () {
        it('should work correctly for .normalizeSingle calls', function (done) {
            var fixture = require('../fixtures/normalizer/v1/single-request'),
                options = {
                    normalizeVersion: '1.0.0',
                    retainIds: true
                };

            transformer.normalizeSingle(fixture.raw, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.normalized);
                done();
            });
        });

        it('should work correctly for .normalizeResponse calls', function (done) {
            var fixture = require('../fixtures/normalizer/v1/single-response'),
                options = {
                    normalizeVersion: '1.0.0',
                    retainIds: true
                };

            transformer.normalizeResponse(fixture.raw, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.normalized);
                done();
            });
        });

        it('should work correctly for .normalize calls', function (done) {
            var fixture = require('../fixtures/normalizer/v1/sample-collection'),
                options = {
                    normalizeVersion: '1.0.0',
                    retainIds: true
                };

            transformer.normalize(fixture.raw, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.normalized);
                done();
            });
        });
    });
});
