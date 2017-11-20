/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var _ = require('lodash'),
    expect = require('chai').expect,
    transformer = require('../../../index');

/* global describe, it */
describe('v1.0.0 to v2.1.0', function () {
    var options = {
        inputVersion: '1.0.0',
        outputVersion: '2.1.0',
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
                },
                // eslint-disable-next-line max-len
                result = _.omit(_.cloneDeep(fixture.v21), ['item.0.event.0.id', 'item.0.event.0.script.id', 'item.1.event.0.id', 'item.1.event.0.script.id', 'item.2.event.0.id', 'item.2.event.0.script.id']);

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
                    outputVersion: '2.1.0',
                    retainIds: true
                },
                source = {
                    id: 'daa896ba-1aff-49e4-a2eb-8db0dd099caa',
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
                    _postman_id: 'daa896ba-1aff-49e4-a2eb-8db0dd099caa',
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
                    id: '5f858c21-b6cc-4b8d-85e9-a04f1055a79b',
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
                    _postman_id: '5f858c21-b6cc-4b8d-85e9-a04f1055a79b',
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

        it('should correctly handle currentHelper (normal) and auth (noauth)', function (done) {
            var source = {
                id: 'd4f21d96-6bee-4184-aa65-5632634b8cf0',
                auth: { type: 'noauth' },
                currentHelper: 'normal'
            };

            transformer.convertSingle(source, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                expect(JSON.parse(JSON.stringify(converted))).to.eql({
                    _postman_id: 'd4f21d96-6bee-4184-aa65-5632634b8cf0',
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
                it('should correctly infer a noauth type from the auth object.', function (done) {
                    var source = { id: '7cf0cb18-f63b-4ee2-a340-ed7c71687ada', auth: { type: 'noauth' } };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            _postman_id: '7cf0cb18-f63b-4ee2-a340-ed7c71687ada',
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
                        id: '9f66b4e4-cfef-4114-808c-0e28ede1c5e2',
                        currentHelper: 'normal',
                        helperAttributes: { id: 'normal', foo: 'bar' }
                    };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            _postman_id: '9f66b4e4-cfef-4114-808c-0e28ede1c5e2',
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
                        id: '885a3729-d5ca-4b09-b4cf-57a3bb2ae4ba',
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
                            _postman_id: '885a3729-d5ca-4b09-b4cf-57a3bb2ae4ba',
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
                    var source = { id: '0b288977-3f4e-4b0a-8218-e0959e21cd37', auth: null };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            _postman_id: '0b288977-3f4e-4b0a-8218-e0959e21cd37',
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
                        id: '261c7dec-ef36-42b0-a1cd-19c0132823c4',
                        currentHelper: null,
                        helperAttributes: { id: 'normal', foo: 'bar' }
                    };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            _postman_id: '261c7dec-ef36-42b0-a1cd-19c0132823c4',
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
                        id: 'af35f2fc-ed73-425c-b5e7-ef9e9cc92938',
                        auth: null,
                        currentHelper: null
                    };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            _postman_id: 'af35f2fc-ed73-425c-b5e7-ef9e9cc92938',
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
                        id: '571d3422-2a63-4bef-a966-1c3bffc230d1',
                        auth: { type: 'noauth' },
                        currentHelper: null
                    };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            _postman_id: '571d3422-2a63-4bef-a966-1c3bffc230d1',
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
                        id: '8faaec24-9f2e-418e-9b29-479f4ef31cad',
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
                            _postman_id: '8faaec24-9f2e-418e-9b29-479f4ef31cad',
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
                            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
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
                            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
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
        it('should be handled correctly in v1 -> v2.1.0 conversions', function (done) {
            var fixture = require('../fixtures/nested-entities'),
                options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.1.0',
                    retainIds: true
                },
                // eslint-disable-next-line max-len
                result = _.omit(_.cloneDeep(fixture.v21), ['item.0.item.0.event.0.id', 'item.0.item.0.event.1.id', 'item.0.item.0.event.0.script.id', 'item.0.item.0.event.1.script.id', 'item.1.event.0.id', 'item.1.event.1.id', 'item.1.event.0.script.id', 'item.1.event.1.script.id']);

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
                    outputVersion: '2.1.0',
                    retainIds: true
                },
                source = {
                    id: '34124d10-0acf-4ed2-afd4-be5de67b1e2a',
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
                    _postman_id: '34124d10-0acf-4ed2-afd4-be5de67b1e2a',
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
                    outputVersion: '2.1.0',
                    retainIds: true
                },
                source = {
                    id: 'e6c691ca-400d-449a-9116-095c19a98107',
                    events: [{
                        id: 'da8615db-85ca-457b-91e3-03d46c7a29b6',
                        listen: 'prerequest',
                        script: {
                            id: '6eb833a2-08e7-4db3-bd77-4da34bf60f61',
                            type: 'text/javascript',
                            exec: ['console.log("Alternative request level pre-request script");']
                        }
                    }, {
                        id: '7152f07e-60c3-432a-90f2-d5ac80746ae0',
                        listen: 'test',
                        script: {
                            id: '67fc3412-0b01-4bc8-8658-ec02491aa46a',
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
                    _postman_id: 'e6c691ca-400d-449a-9116-095c19a98107',
                    name: '',
                    event: [{
                        id: 'da8615db-85ca-457b-91e3-03d46c7a29b6',
                        listen: 'prerequest',
                        script: {
                            id: '6eb833a2-08e7-4db3-bd77-4da34bf60f61',
                            type: 'text/javascript',
                            exec: ['console.log("Alternative request level pre-request script");']
                        }
                    }, {
                        id: '7152f07e-60c3-432a-90f2-d5ac80746ae0',
                        listen: 'test',
                        script: {
                            id: '67fc3412-0b01-4bc8-8658-ec02491aa46a',
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
