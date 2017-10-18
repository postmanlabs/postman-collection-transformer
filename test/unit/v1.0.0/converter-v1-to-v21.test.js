/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var expect = require('chai').expect,
    transformer = require('../../../index');

/* global describe, it */
describe('v1.0.0 to v2.1.0', function () {
    describe('api', function () {
        it('should have a .convertSingle() function', function () {
            expect(transformer.convertSingle).to.be.a('function');
            expect(transformer.convertSingle.length).to.equal(3);
        });

        it('should have a .convert() function', function () {
            expect(transformer.convert).to.be.a('function');
            expect(transformer.convert.length).to.equal(3);
        });
    });

    describe('transformer', function () {
        describe('.convertSingle()', function () {
            it('should work as intended', function (done) {
                var fixture = require('../fixtures/single-request'),
                    options = {
                        inputVersion: '1.0.0',
                        outputVersion: '2.1.0',
                        retainIds: true
                    };

                transformer.convertSingle(fixture.v1, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql(fixture.v21);
                    done();
                });
            });
        });

        describe('.convert()', function () {
            it('should work as intended', function (done) {
                var fixture = require('../fixtures/sample-collection'),
                    options = {
                        inputVersion: '1.0.0',
                        outputVersion: '2.1.0',
                        retainIds: true
                    };

                transformer.convert(fixture.v1, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql(fixture.v21);
                    done();
                });
            });
        });

        describe('.convertResponse()', function () {
            it('should work as intended', function (done) {
                var fixture = require('../fixtures/single-response'),
                    options = {
                        inputVersion: '1.0.0',
                        outputVersion: '2.1.0',
                        retainIds: true
                    };

                transformer.convertResponse(fixture.v1, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));
                    expect(converted).to.eql(fixture.v21);
                    done();
                });
            });
        });
    });

    describe('descriptions', function () {
        it('should correctly handle descriptions whilst converting from v1 to v2.1.0', function (done) {
            var fixture = require('../fixtures/sample-description'),
                options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.1.0',
                    retainIds: true
                };

            transformer.convert(fixture.v1, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v21);
                done();
            });
        });
    });

    describe('request file body', function () {
        it('should correctly handle request file bodies whilst converting from v1 to v2', function (done) {
            var fixture = require('../fixtures/request-body-file'),
                options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.1.0',
                    retainIds: true
                };

            transformer.convert(fixture.v1, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v21);
                done();
            });
        });
    });

    describe('auth', function () {
        it('should be handled correctly in v1 -> v2.1.0 conversions', function (done) {
            var fixture = require('../fixtures/sample-auth'),
                options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.1.0',
                    retainIds: true
                };

            transformer.convert(fixture.v1, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v21);
                done();
            });
        });

        it('should override auth with legacy attributes if they exist', function (done) {
            var options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.1.0',
                    retainIds: true
                },
                source = {
                    currentHelper: 'basicAuth',
                    helperAttributes: {
                        id: 'basic',
                        username: 'username',
                        password: 'password'
                    },
                    auth: {
                        type: 'bearer',
                        bearer: [{key: 'token', value: 'randomSecretString', type: 'string'}]
                    }
                };

            transformer.convertSingle(source, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql({
                    name: '',
                    request: {
                        auth: {
                            type: 'basic',
                            basic: [
                                { key: 'username', value: 'username', type: 'string' },
                                { key: 'password', value: 'password', type: 'string' },
                                { key: 'saveHelperData', type: 'any' },
                                { key: 'showPassword', value: false, type: 'boolean' }
                            ]
                        },
                        body: {
                            mode: 'raw',
                            raw: ''
                        },
                        header: []
                    },
                    response: []
                });
                done();
            });
        });

        it('should use auth if legacy auth attributes are absent', function (done) {
            var options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.1.0',
                    retainIds: true
                },
                source = {
                    auth: {
                        type: 'basic',
                        basic: [{
                            key: 'username',
                            value: 'username',
                            type: 'string'
                        }, {
                            key: 'password',
                            value: 'password',
                            type: 'string'
                        }]
                    }
                };

            transformer.convertSingle(source, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql({
                    name: '',
                    request: {
                        auth: {
                            type: 'basic',
                            basic: [
                                { key: 'username', value: 'username', type: 'string' },
                                { key: 'password', value: 'password', type: 'string' }
                            ]
                        },
                        body: {
                            mode: 'raw',
                            raw: ''
                        },
                        header: []
                    },
                    response: []
                });
                done();
            });
        });
    });

    describe('nested entities', function () {
        it('should be handled correctly in v1 -> v2.1.0 conversions', function (done) {
            var fixture = require('../fixtures/nested-entities'),
                options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.1.0',
                    retainIds: true
                };

            transformer.convert(fixture.v1, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v21);
                done();
            });
        });
    });

    describe('scripts', function () {
        it('should override events with legacy properties if they exist', function (done) {
            var options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.1.0',
                    retainIds: true
                },
                source = {
                    preRequestScript: 'console.log("Request level pre-request script");',
                    tests: 'console.log("Request level test script");',
                    events: [{
                        listen: 'prerequest',
                        script: {
                            type: 'text/javascript',
                            exec: ['console.log("Alternative request level pre-request script");']
                        }
                    }, {
                        listen: 'test',
                        script: {
                            type: 'text/javascript',
                            exec: ['console.log("Alternative request level test script");']
                        }
                    }]
                };

            transformer.convertSingle(source, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql({
                    name: '',
                    event: [{
                        listen: 'test',
                        script: {
                            type: 'text/javascript',
                            exec: ['console.log("Request level test script");']
                        }
                    }, {
                        listen: 'prerequest',
                        script: {
                            type: 'text/javascript',
                            exec: ['console.log("Request level pre-request script");']
                        }
                    }],
                    request: {
                        body: {
                            mode: 'raw',
                            raw: ''
                        },
                        header: []
                    },
                    response: []
                });
                done();
            });
        });

        it('should use events if legacy properties are absent', function (done) {
            var options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.1.0',
                    retainIds: true
                },
                source = {
                    events: [{
                        listen: 'prerequest',
                        script: {
                            type: 'text/javascript',
                            exec: ['console.log("Alternative request level pre-request script");']
                        }
                    }, {
                        listen: 'test',
                        script: {
                            type: 'text/javascript',
                            exec: ['console.log("Alternative request level test script");']
                        }
                    }]
                };

            transformer.convertSingle(source, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql({
                    name: '',
                    event: [{
                        listen: 'prerequest',
                        script: {
                            type: 'text/javascript',
                            exec: ['console.log("Alternative request level pre-request script");']
                        }
                    }, {
                        listen: 'test',
                        script: {
                            type: 'text/javascript',
                            exec: ['console.log("Alternative request level test script");']
                        }
                    }],
                    request: {
                        body: {
                            mode: 'raw',
                            raw: ''
                        },
                        header: []
                    },
                    response: []
                });
                done();
            });
        });
    });
});
