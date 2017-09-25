/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var _ = require('lodash'),
    expect = require('chai').expect,
    transformer = require('../../../index');

/* global describe, it */
describe('v2.1.0 to v1.0.0', function () {
    describe('api', function () {
        it('should have a .convertSingle() function', function () {
            expect(transformer.convertSingle).to.be.a('function');
            expect(transformer.convertSingle.length).to.equal(3);
        });
    });

    describe('transformer', function () {
        describe('.convertSingle()', function () {
            it('should work as intended', function (done) {
                var fixture = require('../fixtures/single-request'),
                    options = {
                        inputVersion: '2.1.0',
                        outputVersion: '1.0.0',
                        retainIds: true
                    };

                transformer.convertSingle(fixture.v21, options, function (err, converted) {
                    expect(err).to.not.be.ok;

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

        describe('.convertResponse()', function () {
            it('should work as intended', function (done) {
                var fixture = require('../fixtures/single-response'),
                    options = {
                        inputVersion: '2.1.0',
                        outputVersion: '1.0.0',
                        retainIds: true
                    };

                transformer.convertResponse(fixture.v21, options, function (err, converted) {
                    if (err) { return done(err); }

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted.requestObject).to.be.a('string');
                    expect(function () {
                        JSON.parse(converted.requestObject);
                    }).to.not.throw();

                    expect(_.omit(converted, [
                        'rawDataType',
                        'request',
                        'requestObject',
                        'responseCode',
                        'status'
                    ])).to.eql(_.omit(fixture.v1, [
                        'code',
                        'dataURI',
                        'empty',
                        'failed',
                        'fileName',
                        'forceNoPretty',
                        'mime',
                        'mimeType',
                        'request',
                        'responseCode',
                        'responseSize',
                        'searchResultScrolledTo',
                        'state',
                        'status',
                        'write'
                    ]));
                    done();
                });
            });
        });

        describe('path variables', function () {
            it('should work with id as indexing property', function (done) {
                var fixture = {
                        id: 'some-id',
                        name: 'some-name',
                        request: {
                            url: {
                                host: ['postman-echo', 'com'],
                                path: [':method'],
                                variable: [{
                                    id: 'method',
                                    value: 'get'
                                }]
                            },
                            method: 'GET'
                        }
                    },
                    options = {
                        inputVersion: '2.1.0',
                        outputVersion: '1.0.0',
                        retainIds: true
                    };

                transformer.convertSingle(fixture, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    expect(converted.pathVariables).to.eql({
                        method: 'get'
                    });

                    expect(converted.pathVariableData).to.eql([{
                        key: 'method',
                        value: 'get'
                    }]);
                    done();
                });
            });

            it('should work with key as indexing property', function (done) {
                var fixture = {
                        id: 'some-id',
                        name: 'some-name',
                        request: {
                            url: {
                                host: ['postman-echo', 'com'],
                                path: [':method'],
                                variable: [{
                                    key: 'method',
                                    value: 'get'
                                }]
                            },
                            method: 'GET'
                        }
                    },
                    options = {
                        inputVersion: '2.1.0',
                        outputVersion: '1.0.0',
                        retainIds: true
                    };

                transformer.convertSingle(fixture, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    expect(converted.pathVariables).to.eql({
                        method: 'get'
                    });

                    expect(converted.pathVariableData).to.eql([{
                        key: 'method',
                        value: 'get'
                    }]);
                    done();
                });
            });
        });
    });

    describe('descriptions', function () {
        it('should correctly handle descriptions whilst converting from v2.1.0 to v1', function (done) {
            var fixture = require('../fixtures/sample-description'),
                options = {
                    inputVersion: '2.1.0',
                    outputVersion: '1.0.0',
                    retainIds: true
                };

            transformer.convert(fixture.v21, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v1);
                done();
            });
        });
    });

    describe('request file body', function () {
        it('should correctly handle request file bodies whilst converting from v2.1.0 to v1', function (done) {
            var fixture = require('../fixtures/request-body-file'),
                options = {
                    inputVersion: '2.1.0',
                    outputVersion: '1.0.0',
                    retainIds: true
                };

            transformer.convert(fixture.v21, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v1);
                done();
            });
        });
    });
});
