/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var expect = require('chai').expect,
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

        it('should correctly handle currentHelper (normal) and auth (noauth)', function (done) {
            var source = { auth: { type: 'noauth' }, currentHelper: 'normal' };

            transformer.convertSingle(source, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                expect(JSON.parse(JSON.stringify(converted))).to.eql({
                    name: '',
                    request: {
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
                    var source = { auth: { type: 'noauth' } };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
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
                        currentHelper: 'normal',
                        helperAttributes: { id: 'normal', foo: 'bar' }
                    };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            name: '',
                            request: {
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
                            name: '',
                            request: {
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
                    var source = { auth: null };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            name: '',
                            request: {
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
                        currentHelper: null,
                        helperAttributes: { id: 'normal', foo: 'bar' }
                    };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            name: '',
                            request: {
                                body: { mode: 'raw', raw: '' },
                                header: []
                            },
                            response: []
                        });
                        done();
                    });
                });

                it('should correctly handle currentHelper and auth set to null', function (done) {
                    var source = { auth: null, currentHelper: null };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            name: '',
                            request: {
                                body: { mode: 'raw', raw: '' },
                                header: []
                            },
                            response: []
                        });
                        done();
                    });
                });

                it('should correctly handle currentHelper (null) and auth (noauth)', function (done) {
                    var source = { auth: { type: 'noauth' }, currentHelper: null };

                    transformer.convertSingle(source, options, function (err, converted) {
                        expect(err).to.not.be.ok;

                        // remove `undefined` properties for testing
                        expect(JSON.parse(JSON.stringify(converted))).to.eql({
                            name: '',
                            request: {
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
                            name: '',
                            request: {
                                body: { mode: 'raw', raw: '' },
                                header: []
                            },
                            response: []
                        });
                        done();
                    });
                });

                it('should discard auth if both: legacy is null and new attributes are missing', function (done) {
                    var source = {
                        id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        currentHelper: null
                    };

                    transformer.convertSingle(source, options, function (err, result) {
                        expect(err).to.not.be.ok;
                        expect(JSON.parse(JSON.stringify(result))).to.eql({
                            _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                            name: '',
                            request: {
                                header: [],
                                body: { mode: 'raw', raw: '' }
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
                            item: []
                        }]
                    });
                    done();
                });
            });
        });

        describe('with missing properties', function () {
            var options = {
                inputVersion: '1.0.0',
                outputVersion: '2.1.0',
                retainIds: true
            };

            it('should fall back to legacy properties if auth is missing', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                    currentHelper: 'basicAuth',
                    helperAttributes: {
                        id: 'basic',
                        username: 'postman',
                        password: 'secret'
                    }
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;

                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            header: [],
                            body: { mode: 'raw', raw: '' },
                            auth: {
                                type: 'basic',
                                basic: [
                                    { key: 'username', value: 'postman', type: 'string' },
                                    { key: 'password', value: 'secret', type: 'string' },
                                    { key: 'saveHelperData', type: 'any' },
                                    { key: 'showPassword', value: false, type: 'boolean' }
                                ]
                            }
                        },
                        response: []
                    });
                    done();
                });
            });

            it('should discard auth creation if both: legacy and new attributes are missing', function (done) {
                var source = { id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c' };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;
                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            header: [],
                            body: { mode: 'raw', raw: '' }
                        },
                        response: []
                    });
                    done();
                });
            });

            it('should discard auth if both: legacy is normal and new attributes are missing', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                    currentHelper: 'normal'
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;
                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            header: [],
                            body: { mode: 'raw', raw: '' }
                        },
                        response: []
                    });
                    done();
                });
            });

            it('should handle valid auth and missing legacy properties correctly', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                    auth: {
                        type: 'bearer',
                        bearer: [{ key: 'token', value: 'secret', type: 'string' }]
                    }
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;
                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            header: [],
                            body: { mode: 'raw', raw: '' },
                            auth: {
                                type: 'bearer',
                                bearer: [{ key: 'token', value: 'secret', type: 'string' }]
                            }
                        },
                        response: []
                    });
                    done();
                });
            });
        });

        describe('prioritizeV2: true', function () {
            var options = {
                inputVersion: '1.0.0',
                outputVersion: '2.1.0',
                prioritizeV2: true,
                retainIds: true
            };

            it('should correctly prioritize v2 auth whilst converting', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                    currentHelper: 'basicAuth',
                    helperAttributes: {
                        id: 'basic',
                        username: 'postman',
                        password: 'secret'
                    },
                    auth: {
                        type: 'bearer',
                        bearer: [{ key: 'token', value: 'secret', type: 'string' }]
                    }
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;

                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            header: [],
                            body: { mode: 'raw', raw: '' },
                            auth: {
                                type: 'bearer',
                                bearer: [{ key: 'token', value: 'secret', type: 'string' }]
                            }
                        },
                        response: []
                    });
                    done();
                });
            });

            it('should fall back to legacy properties if auth is falsy', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                    currentHelper: 'basicAuth',
                    helperAttributes: {
                        id: 'basic',
                        username: 'postman',
                        password: 'secret'
                    },
                    auth: null
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;

                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            header: [],
                            body: { mode: 'raw', raw: '' },
                            auth: {
                                type: 'basic',
                                basic: [
                                    { key: 'username', value: 'postman', type: 'string' },
                                    { key: 'password', value: 'secret', type: 'string' },
                                    { key: 'saveHelperData', type: 'any' },
                                    { key: 'showPassword', type: 'boolean', value: false }
                                ]
                            }
                        },
                        response: []
                    });
                    done();
                });
            });

            it('should retain type noauth if auth is noauth and currentHelper is null', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                    currentHelper: null,
                    auth: { type: 'noauth' }
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;

                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            header: [],
                            body: { mode: 'raw', raw: '' },
                            auth: { type: 'noauth' }
                        },
                        response: []
                    });
                    done();
                });
            });

            it('should discard auth creation if both: legacy and new attributes are falsy', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                    currentHelper: null,
                    helperAttributes: null,
                    auth: null
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;
                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            header: [],
                            body: { mode: 'raw', raw: '' }
                        },
                        response: []
                    });
                    done();
                });
            });

            it('should discard auth creation if both: legacy is normal and new attributes are falsy', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                    currentHelper: 'normal',
                    helperAttributes: null,
                    auth: null
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;
                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            header: [],
                            body: { mode: 'raw', raw: '' }
                        },
                        response: []
                    });
                    done();
                });
            });

            it('should discard auth creation if both: legacy is null and new attributes are falsy', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                    currentHelper: null,
                    helperAttributes: null,
                    auth: null
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;
                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            header: [],
                            body: { mode: 'raw', raw: '' }
                        },
                        response: []
                    });
                    done();
                });
            });

            describe('with missing properties', function () {
                it('should fall back to legacy properties if auth is missing', function (done) {
                    var source = {
                        id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        currentHelper: 'basicAuth',
                        helperAttributes: {
                            id: 'basic',
                            username: 'postman',
                            password: 'secret'
                        }
                    };

                    transformer.convertSingle(source, options, function (err, result) {
                        expect(err).to.not.be.ok;

                        expect(JSON.parse(JSON.stringify(result))).to.eql({
                            _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                            name: '',
                            request: {
                                header: [],
                                body: { mode: 'raw', raw: '' },
                                auth: {
                                    type: 'basic',
                                    basic: [
                                        { key: 'username', value: 'postman', type: 'string' },
                                        { key: 'password', value: 'secret', type: 'string' },
                                        { key: 'saveHelperData', type: 'any' },
                                        { key: 'showPassword', value: false, type: 'boolean' }
                                    ]
                                }
                            },
                            response: []
                        });
                        done();
                    });
                });

                it('should discard auth creation if both: legacy and new attributes are missing', function (done) {
                    var source = { id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c' };

                    transformer.convertSingle(source, options, function (err, result) {
                        expect(err).to.not.be.ok;
                        expect(JSON.parse(JSON.stringify(result))).to.eql({
                            _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                            name: '',
                            request: {
                                header: [],
                                body: { mode: 'raw', raw: '' }
                            },
                            response: []
                        });
                        done();
                    });
                });

                it('should discard auth if both: legacy is normal and new attributes are missing', function (done) {
                    var source = {
                        id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        currentHelper: 'normal'
                    };

                    transformer.convertSingle(source, options, function (err, result) {
                        expect(err).to.not.be.ok;
                        expect(JSON.parse(JSON.stringify(result))).to.eql({
                            _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                            name: '',
                            request: {
                                header: [],
                                body: { mode: 'raw', raw: '' }
                            },
                            response: []
                        });
                        done();
                    });
                });

                it('should handle valid auth and missing legacy properties correctly', function (done) {
                    var source = {
                        id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        auth: {
                            type: 'bearer',
                            bearer: [{ key: 'token', value: 'secret', type: 'string' }]
                        }
                    };

                    transformer.convertSingle(source, options, function (err, result) {
                        expect(err).to.not.be.ok;
                        expect(JSON.parse(JSON.stringify(result))).to.eql({
                            _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                            name: '',
                            request: {
                                header: [],
                                body: { mode: 'raw', raw: '' },
                                auth: {
                                    type: 'bearer',
                                    bearer: [{ key: 'token', value: 'secret', type: 'string' }]
                                }
                            },
                            response: []
                        });
                        done();
                    });
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

        describe('with missing properties', function () {
            var options = {
                inputVersion: '1.0.0',
                outputVersion: '2.1.0',
                retainIds: true
            };

            it('should handle missing events correctly', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                    preRequestScript: 'console.log("Pre-request script");',
                    tests: 'console.log("Test script");'
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;
                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        event: [{
                            listen: 'test',
                            script: {
                                type: 'text/javascript',
                                exec: ['console.log("Test script");']
                            }
                        }, {
                            listen: 'prerequest',
                            script: {
                                type: 'text/javascript',
                                exec: ['console.log("Pre-request script");']
                            }
                        }],
                        request: {
                            header: [],
                            body: { mode: 'raw', raw: '' }
                        },
                        response: []
                    });
                    done();
                });
            });

            it('should discard property creation if both are absent', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c'
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;
                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            header: [],
                            body: { mode: 'raw', raw: '' }
                        },
                        response: []
                    });
                    done();
                });
            });
        });

        describe('prioritizeV2: true', function () {
            var options = {
                inputVersion: '1.0.0',
                outputVersion: '2.1.0',
                prioritizeV2: true,
                retainIds: true
            };

            it('should correctly prioritize `events` over preRequestScript/tests', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                    preRequestScript: 'console.log("Legacy prerequest script");',
                    tests: 'console.log("Legacy test script");',
                    events: [{
                        listen: 'prerequest',
                        script: { exec: ['console.log("Actual prerequest script");'] }
                    }, {
                        listen: 'test',
                        script: { exec: ['console.log("Actual test script");'] }
                    }]
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;
                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            header: [],
                            body: { mode: 'raw', raw: '' }
                        },
                        response: [],
                        event: [{
                            listen: 'prerequest',
                            script: {
                                type: 'text/javascript',
                                exec: ['console.log("Actual prerequest script");']
                            }
                        }, {
                            listen: 'test',
                            script: {
                                type: 'text/javascript',
                                exec: ['console.log("Actual test script");']
                            }
                        }]
                    });
                    done();
                });
            });

            it('should correctly fall back to preRequestScript/tests if `events` is empty', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                    preRequestScript: 'console.log("Legacy prerequest script");',
                    tests: 'console.log("Legacy test script");',
                    events: []
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;
                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            header: [],
                            body: { mode: 'raw', raw: '' }
                        },
                        response: [],
                        event: [{
                            listen: 'test',
                            script: {
                                type: 'text/javascript',
                                exec: ['console.log("Legacy test script");']
                            }
                        }, {
                            listen: 'prerequest',
                            script: {
                                type: 'text/javascript',
                                exec: ['console.log("Legacy prerequest script");']
                            }
                        }]
                    });
                    done();
                });
            });

            it('should discard event from the result if both legacy and current attributes are empty', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                    preRequestScript: null,
                    tests: null,
                    events: []
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;
                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            body: { mode: 'raw', raw: '' },
                            header: []
                        },
                        response: []
                    });
                    done();
                });
            });

            it('should handle empty legacy script strings correctly', function (done) {
                var source = {
                    id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                    preRequestScript: '',
                    tests: '',
                    events: []
                };

                transformer.convertSingle(source, options, function (err, result) {
                    expect(err).to.not.be.ok;
                    expect(JSON.parse(JSON.stringify(result))).to.eql({
                        _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        name: '',
                        request: {
                            body: { mode: 'raw', raw: '' },
                            header: []
                        },
                        response: []
                    });
                    done();
                });
            });

            describe('with missing properties', function () {
                it('should handle missing preRequestScript and tests correctly', function (done) {
                    var source = {
                        id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        events: [{
                            listen: 'prerequest',
                            script: {
                                type: 'text/javascript',
                                exec: ['console.log("Pre-request script");']
                            }
                        }, {
                            listen: 'test',
                            script: {
                                type: 'text/javascript',
                                exec: ['console.log("Test script");']
                            }
                        }]
                    };

                    transformer.convertSingle(source, options, function (err, result) {
                        expect(err).to.not.be.ok;
                        expect(JSON.parse(JSON.stringify(result))).to.eql({
                            _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                            name: '',
                            event: [{
                                listen: 'prerequest',
                                script: {
                                    type: 'text/javascript',
                                    exec: ['console.log("Pre-request script");']
                                }
                            }, {
                                listen: 'test',
                                script: {
                                    type: 'text/javascript',
                                    exec: ['console.log("Test script");']
                                }
                            }],
                            request: {
                                header: [],
                                body: { mode: 'raw', raw: '' }
                            },
                            response: []
                        });
                        done();
                    });
                });

                it('should handle missing events correctly', function (done) {
                    var source = {
                        id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                        preRequestScript: 'console.log("Pre-request script");',
                        tests: 'console.log("Test script");'
                    };

                    transformer.convertSingle(source, options, function (err, result) {
                        expect(err).to.not.be.ok;
                        expect(JSON.parse(JSON.stringify(result))).to.eql({
                            _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                            name: '',
                            event: [{
                                listen: 'test',
                                script: {
                                    type: 'text/javascript',
                                    exec: ['console.log("Test script");']
                                }
                            }, {
                                listen: 'prerequest',
                                script: {
                                    type: 'text/javascript',
                                    exec: ['console.log("Pre-request script");']
                                }
                            }],
                            request: {
                                header: [],
                                body: { mode: 'raw', raw: '' }
                            },
                            response: []
                        });
                        done();
                    });
                });

                it('should discard property creation if both are absent', function (done) {
                    var source = {
                        id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c'
                    };

                    transformer.convertSingle(source, options, function (err, result) {
                        expect(err).to.not.be.ok;
                        expect(JSON.parse(JSON.stringify(result))).to.eql({
                            _postman_id: '27ad5d23-f158-41e2-900d-4f81e62c0a1c',
                            name: '',
                            request: {
                                header: [],
                                body: { mode: 'raw', raw: '' }
                            },
                            response: []
                        });
                        done();
                    });
                });
            });
        });
    });

    describe('malformed collections', function () {
        it('should be handled correctly', function (done) {
            transformer.convert({
                folders: [false, null, { id: 'F1' }, 0, NaN, '', undefined],
                folders_order: [false, null, 'F1', 0, NaN, '', undefined],
                requests: [false, null, {
                    id: 'R1'
                }, 0, NaN, '', undefined],
                order: [false, null, 'R1', 0, NaN, '', undefined]
            }, options, function (err, result) {
                expect(err).to.not.be.ok;
                expect(JSON.parse(JSON.stringify(result))).to.eql({
                    info: {
                        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                    },
                    item: [{
                        _postman_id: 'F1',
                        item: []
                    }, {
                        _postman_id: 'R1',
                        name: '',
                        request: {
                            body: {
                                mode: 'raw',
                                raw: ''
                            },
                            header: []
                        },
                        response: []
                    }]
                });
                done();
            });
        });
    });
});
