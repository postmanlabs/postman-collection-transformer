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

            transformer.normalizeSingle(fixture.raw, options, function (err, normalized) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                normalized = JSON.parse(JSON.stringify(normalized));

                expect(normalized).to.eql(fixture.normalized);
                done();
            });
        });

        it('should work correctly for .normalizeResponse calls', function (done) {
            var fixture = require('../fixtures/normalizer/v1/single-response'),
                options = {
                    normalizeVersion: '1.0.0',
                    retainIds: true
                };

            transformer.normalizeResponse(fixture.raw, options, function (err, normalized) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                normalized = JSON.parse(JSON.stringify(normalized));

                expect(normalized).to.eql(fixture.normalized);
                done();
            });
        });

        it('should work correctly for .normalize calls', function (done) {
            var fixture = require('../fixtures/normalizer/v1/sample-collection'),
                options = {
                    normalizeVersion: '1.0.0',
                    retainIds: true
                };

            transformer.normalize(fixture.raw, options, function (err, normalized) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                normalized = JSON.parse(JSON.stringify(normalized));

                expect(normalized).to.eql(fixture.normalized);
                done();
            });
        });
    });

    describe('special cases', function () {
        describe('auth', function () {
            it('should override auth with legacy properties if both are present', function (done) {
                var options = {
                        normalizeVersion: '1.0.0',
                        retainIds: true
                    },
                    source = {
                        id: 'bd79f978-d862-49f1-9cea-7c71a762cc12',
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

                transformer.normalizeSingle(source, options, function (err, normalized) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    normalized = JSON.parse(JSON.stringify(normalized));

                    expect(normalized).to.eql({
                        id: 'bd79f978-d862-49f1-9cea-7c71a762cc12',
                        data: [],
                        currentHelper: 'basicAuth',
                        helperAttributes: {
                            id: 'basic',
                            username: 'username',
                            password: 'password'
                        },
                        auth: {
                            type: 'basic',
                            basic: [
                                {key: 'username', value: 'username', type: 'string'},
                                {key: 'password', value: 'password', type: 'string'},
                                {key: 'saveHelperData', type: 'any'},
                                {key: 'showPassword', value: false, type: 'boolean'}
                            ]
                        }
                    });
                    done();
                });
            });

            it('should fall back to auth if legacy properties are absent', function (done) {
                var options = {
                        normalizeVersion: '1.0.0',
                        retainIds: true
                    },
                    source = {
                        id: '722795b9-c9bc-4a01-a024-dd9358548dc1',
                        auth: {
                            type: 'basic',
                            basic: [
                                {key: 'username', value: 'username', type: 'string'},
                                {key: 'password', value: 'password', type: 'string'}
                            ]
                        }
                    };

                transformer.normalizeSingle(source, options, function (err, normalized) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    normalized = JSON.parse(JSON.stringify(normalized));

                    expect(normalized).to.eql({
                        id: '722795b9-c9bc-4a01-a024-dd9358548dc1',
                        data: [],
                        currentHelper: 'basicAuth',
                        helperAttributes: {
                            id: 'basic',
                            username: 'username',
                            password: 'password'
                        },
                        auth: {
                            type: 'basic',
                            basic: [
                                {key: 'username', value: 'username', type: 'string'},
                                {key: 'password', value: 'password', type: 'string'}
                            ]
                        }
                    });
                    done();
                });
            });
        });

        describe('scripts', function () {
            it('should override events with legacy properties if they exist', function (done) {
                var options = {
                        normalizeVersion: '1.0.0',
                        retainIds: true
                    },
                    source = {
                        id: '95df70cd-8631-4459-bc42-3830f30ecae0',
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

                transformer.normalizeSingle(source, options, function (err, normalized) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    normalized = JSON.parse(JSON.stringify(normalized));

                    expect(normalized).to.eql({
                        id: '95df70cd-8631-4459-bc42-3830f30ecae0',
                        data: [],
                        preRequestScript: 'console.log("Request level pre-request script");',
                        tests: 'console.log("Request level test script");',
                        events: [{
                            listen: 'prerequest',
                            script: {
                                type: 'text/javascript',
                                exec: ['console.log("Request level pre-request script");']
                            }
                        }, {
                            listen: 'test',
                            script: {
                                type: 'text/javascript',
                                exec: ['console.log("Request level test script");']
                            }
                        }]
                    });
                    done();
                });
            });

            it('should use events if legacy properties are absent', function (done) {
                var options = {
                        normalizeVersion: '1.0.0',
                        retainIds: true
                    },
                    source = {
                        id: '53540ee4-8499-44af-9b74-20d415a6fd43',
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

                transformer.normalizeSingle(source, options, function (err, normalized) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    normalized = JSON.parse(JSON.stringify(normalized));

                    expect(normalized).to.eql({
                        id: '53540ee4-8499-44af-9b74-20d415a6fd43',
                        data: [],
                        preRequestScript: 'console.log("Alternative request level pre-request script");',
                        tests: 'console.log("Alternative request level test script");',
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
                    });
                    done();
                });
            });
        });
    });
});
