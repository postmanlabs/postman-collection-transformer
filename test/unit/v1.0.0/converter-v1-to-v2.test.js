/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var _ = require('lodash'),
    expect = require('chai').expect,
    transformer = require('../../../index');

/* global describe, it */
describe('v1.0.0 to v2.0.0', function () {
    var options = {
        inputVersion: '1.0.0',
        outputVersion: '2.0.0',
        retainIds: true
    };

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
                        outputVersion: '2.0.0',
                        retainIds: true
                    };

                transformer.convertSingle(fixture.v1, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql(fixture.v2);
                    done();
                });
            });
        });

        describe('.convert()', function () {
            it('should work as intended', function (done) {
                var fixture = require('../fixtures/sample-collection'),
                    options = {
                        inputVersion: '1.0.0',
                        outputVersion: '2.0.0',
                        retainIds: true
                    };

                transformer.convert(fixture.v1, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql(fixture.v2);
                    done();
                });
            });
        });

        describe('.convertResponse()', function () {
            it('should work as intended', function (done) {
                var fixture = require('../fixtures/single-response'),
                    options = {
                        inputVersion: '1.0.0',
                        outputVersion: '2.0.0',
                        retainIds: true
                    };

                transformer.convertResponse(fixture.v1, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));
                    expect(converted).to.eql(fixture.v2);
                    done();
                });
            });
        });
    });

    describe('descriptions', function () {
        it('should correctly handle descriptions whilst converting from v1 to v2', function (done) {
            var fixture = require('../fixtures/sample-description'),
                options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.0.0',
                    retainIds: true
                };

            transformer.convert(fixture.v1, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v2);
                done();
            });
        });
    });

    describe('request file body', function () {
        it('should correctly handle request file bodies whilst converting from v1 to v2', function (done) {
            var fixture = require('../fixtures/request-body-file'),
                options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.0.0',
                    retainIds: true
                };

            transformer.convert(fixture.v1, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v2);
                done();
            });
        });
    });

    describe('auth', function () {
        it('should be handled correctly in v1 -> v2 conversions', function (done) {
            var fixture = require('../fixtures/sample-auth'),
                options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.0.0',
                    retainIds: true
                },
                // eslint-disable-next-line max-len
                result = _.omit(_.cloneDeep(fixture.v2), ['item.0.event.0.id', 'item.0.event.0.script.id', 'item.1.event.0.id', 'item.1.event.0.script.id', 'item.2.event.0.id', 'item.2.event.0.script.id']);

            transformer.convert(fixture.v1, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(result);
                done();
            });
        });

        it('should override auth with legacy attributes if they exist', function (done) {
            var options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.0.0',
                    retainIds: true
                },
                source = {
                    id: '018f44a5-5342-4435-a827-88f01a1f78ad',
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
                    _postman_id: '018f44a5-5342-4435-a827-88f01a1f78ad',
                    name: '',
                    request: {
                        auth: {
                            type: 'basic',
                            basic: {
                                username: 'username',
                                password: 'password',
                                showPassword: false
                            }
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
                    outputVersion: '2.0.0',
                    retainIds: true
                },
                source = {
                    id: 'e36db284-d601-4e2f-9d9e-6b411c10242d',
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
                    _postman_id: 'e36db284-d601-4e2f-9d9e-6b411c10242d',
                    name: '',
                    request: {
                        auth: {
                            type: 'basic',
                            basic: {
                                username: 'username',
                                password: 'password'
                            }
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

        it('should correctly handle currentHelper (normal) and auth (noauth)', function (done) {
            var source = {
                id: 'd3811502-af69-4540-a56c-ffe0acdcbd92',
                auth: { type: 'noauth' },
                currentHelper: 'normal'
            };

            transformer.convertSingle(source, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                expect(JSON.parse(JSON.stringify(converted))).to.eql({
                    _postman_id: 'd3811502-af69-4540-a56c-ffe0acdcbd92',
                    name: '',
                    request: {
                        auth: null,
                        body: { mode: 'raw', raw: '' },
                        header: []
                    },
                    response: []
                });
                done();
            });
        });

        describe('requests', function () {
            describe('with noauth', function () {
                it('should correctly infer a noauth type from the auth object', function (done) {
                    var source = {
                        id: '853f9415-cdec-49c7-96c7-01236af4be8b',
                        auth: { type: 'noauth' }
                    };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            _postman_id: '853f9415-cdec-49c7-96c7-01236af4be8b',
                            name: '',
                            request: {
                                auth: { type: 'noauth' },
                                body: { mode: 'raw', raw: '' },
                                header: []
                            },
                            response: []
                        });
                        done();
                    });
                });

                it('should correctly infer a noauth type from `currentHelper`', function (done) {
                    var source = {
                        id: '6ce4c316-4b8d-4836-a324-39aa9a1e0e30',
                        currentHelper: 'normal',
                        helperAttributes: { id: 'normal', foo: 'bar' }
                    };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            _postman_id: '6ce4c316-4b8d-4836-a324-39aa9a1e0e30',
                            name: '',
                            request: {
                                auth: null,
                                body: { mode: 'raw', raw: '' },
                                header: []
                            },
                            response: []
                        });
                        done();
                    });
                });

                it('should correctly infer a noauth type from `currentHelper`, even if auth exists', function (done) {
                    var source = {
                        id: '876e057d-f790-4cee-b0a7-994c65c4355b',
                        currentHelper: 'normal',
                        helperAttributes: { id: 'normal', foo: 'bar' },
                        auth: {
                            type: 'basic',
                            basic: { username: 'postman', password: 'password' }
                        }
                    };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            _postman_id: '876e057d-f790-4cee-b0a7-994c65c4355b',
                            name: '',
                            request: {
                                auth: null,
                                body: { mode: 'raw', raw: '' },
                                header: []
                            },
                            response: []
                        });
                        done();
                    });
                });
            });

            describe('with null', function () {
                it('should correctly infer a noauth type from the auth object.', function (done) {
                    var source = { id: '8f3b9923-efae-4b5f-ad11-c7ef618ffe34', auth: null };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            _postman_id: '8f3b9923-efae-4b5f-ad11-c7ef618ffe34',
                            name: '',
                            request: {
                                auth: null,
                                body: { mode: 'raw', raw: '' },
                                header: []
                            },
                            response: []
                        });
                        done();
                    });
                });

                it('should correctly infer a noauth type from `currentHelper`', function (done) {
                    var source = {
                        id: '671f28a3-3008-454c-bac7-e623f37790bc',
                        currentHelper: null,
                        helperAttributes: { id: 'normal', foo: 'bar' }
                    };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            _postman_id: '671f28a3-3008-454c-bac7-e623f37790bc',
                            name: '',
                            request: {
                                auth: null,
                                body: { mode: 'raw', raw: '' },
                                header: []
                            },
                            response: []
                        });
                        done();
                    });
                });

                it('should correctly handle currentHelper and auth set to null', function (done) {
                    var source = {
                        id: '5a579297-0f4d-45eb-bb5a-0fcf6200ce1e',
                        auth: null,
                        currentHelper: null
                    };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            _postman_id: '5a579297-0f4d-45eb-bb5a-0fcf6200ce1e',
                            name: '',
                            request: {
                                auth: null,
                                body: { mode: 'raw', raw: '' },
                                header: []
                            },
                            response: []
                        });
                        done();
                    });
                });

                it('should correctly handle currentHelper (null) and auth (noauth)', function (done) {
                    var source = {
                        id: 'c0418eb5-6fbc-4c0d-8429-92906194699b',
                        auth: { type: 'noauth' },
                        currentHelper: null
                    };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            _postman_id: 'c0418eb5-6fbc-4c0d-8429-92906194699b',
                            name: '',
                            request: {
                                auth: null,
                                body: { mode: 'raw', raw: '' },
                                header: []
                            },
                            response: []
                        });
                        done();
                    });
                });

                it('should correctly infer a noauth type from `currentHelper`, even if auth exists', function (done) {
                    var source = {
                        id: '7b24c348-94df-4584-980a-c3ea2307a8b3',
                        currentHelper: null,
                        helperAttributes: { id: 'normal', foo: 'bar' },
                        auth: {
                            type: 'basic',
                            basic: { username: 'postman', password: 'password' }
                        }
                    };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            _postman_id: '7b24c348-94df-4584-980a-c3ea2307a8b3',
                            name: '',
                            request: {
                                auth: null,
                                body: { mode: 'raw', raw: '' },
                                header: []
                            },
                            response: []
                        });
                        done();
                    });
                });
            });
        });

        describe('collections', function () {
            it('should correctly infer a noauth type from a regular auth object', function (done) {
                var source = {
                    auth: { type: 'noauth' },
                    folders: [{ auth: { type: 'noauth' } }]
                };

                transformer.convert(source, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    expect(JSON.parse(JSON.stringify(converted))).to.eql({
                        info: {
                            schema: 'https://schema.getpostman.com/json/collection/v2.0.0/collection.json'
                        },
                        item: [{
                            auth: { type: 'noauth' },
                            item: []
                        }]
                    });
                    done();
                });
            });

            it('should correctly infer a noauth type from a null auth object', function (done) {
                var source = {
                    auth: null,
                    folders: [{ auth: null }]
                };

                transformer.convert(source, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    expect(JSON.parse(JSON.stringify(converted))).to.eql({
                        info: {
                            schema: 'https://schema.getpostman.com/json/collection/v2.0.0/collection.json'
                        },
                        item: [{
                            auth: null,
                            item: []
                        }]
                    });
                    done();
                });
            });
        });
    });

    describe('nested entities', function () {
        it('should be handled correctly in v1 -> v2 conversions', function (done) {
            var fixture = require('../fixtures/nested-entities'),
                options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.0.0',
                    retainIds: true
                },
                // eslint-disable-next-line max-len
                result = _.omit(_.cloneDeep(fixture.v2), ['item.0.item.0.event.0.id', 'item.0.item.0.event.1.id', 'item.0.item.0.event.0.script.id', 'item.0.item.0.event.1.script.id', 'item.1.event.0.id', 'item.1.event.1.id', 'item.1.event.0.script.id', 'item.1.event.1.script.id']);

            transformer.convert(fixture.v1, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(result);
                done();
            });
        });
    });

    describe('scripts', function () {
        it('should override events with legacy properties if they exist', function (done) {
            var options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.0.0',
                    retainIds: true
                },
                source = {
                    id: '64e2d354-4a20-4ff9-942e-eb8e5fe84258',
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
                    _postman_id: '64e2d354-4a20-4ff9-942e-eb8e5fe84258',
                    name: '',
                    event: [{
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
                    outputVersion: '2.0.0',
                    retainIds: true
                },
                source = {
                    id: '4efbbdc8-6158-4947-aec5-7a3ca7d37999',
                    events: [{
                        id: '6a389433-bc29-42aa-8a4d-e017a337fa83',
                        listen: 'prerequest',
                        script: {
                            id: 'e03f4d5c-7a9a-4cd1-bacc-09eb887ab06d',
                            type: 'text/javascript',
                            exec: ['console.log("Alternative request level pre-request script");']
                        }
                    }, {
                        id: '57156a97-3a97-4f3f-9001-faf545b5a05a',
                        listen: 'test',
                        script: {
                            id: 'd0caca55-1e54-4ea6-b24c-4c989e493d2f',
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
                    _postman_id: '4efbbdc8-6158-4947-aec5-7a3ca7d37999',
                    name: '',
                    event: [{
                        id: '6a389433-bc29-42aa-8a4d-e017a337fa83',
                        listen: 'prerequest',
                        script: {
                            id: 'e03f4d5c-7a9a-4cd1-bacc-09eb887ab06d',
                            type: 'text/javascript',
                            exec: ['console.log("Alternative request level pre-request script");']
                        }
                    }, {
                        id: '57156a97-3a97-4f3f-9001-faf545b5a05a',
                        listen: 'test',
                        script: {
                            id: 'd0caca55-1e54-4ea6-b24c-4c989e493d2f',
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
