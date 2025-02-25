/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var _ = require('lodash'),
    expect = require('chai').expect,
    transformer = require('../../..'),
    nestedEntitiesCollection = require('../fixtures/multi-level.v21.json');

describe('v2.1.0 to v1.0.0', function () {
    var options = {
        inputVersion: '2.1.0',
        outputVersion: '1.0.0',
        retainIds: true
    };

    describe('api', function () {
        it('should have a .convertSingle() function', function () {
            expect(transformer.convertSingle).to.be.a('function').with.length(3);
        });

        it('should have a .convert() function', function () {
            expect(transformer.convert).to.be.a('function').with.length(3);
        });

        it('should have a .convertResponse() function', function () {
            expect(transformer.convertResponse).to.be.a('function').with.length(3);
        });
    });

    describe('transformer', function () {
        describe('.convertSingle()', function () {
            it('should work as intended', function (done) {
                var fixture = require('../fixtures/single-request');

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

            it('should work correctly without a callback', function () {
                expect(JSON.parse(JSON.stringify(transformer.convertSingle({
                    _postman_id: '9a5c1db2-beb3-42a5-bdff-689321f6dca8'
                }, options)))).to.eql({
                    id: '9a5c1db2-beb3-42a5-bdff-689321f6dca8',
                    headerData: [],
                    url: '',
                    responses_order: []
                });
            });
        });

        describe('.convertResponse', function () {
            it('should work as intended', function (done) {
                var fixture = require('../fixtures/single-response');

                transformer.convertResponse(fixture.v21, options, function (err, converted) {
                    expect(err).not.to.be.ok;

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

            it('should work correctly without a callback', function () {
                expect(JSON.parse(JSON.stringify(transformer.convertResponse({
                    _postman_id: 'ec9fcac1-1e12-4e23-9580-2f5049cbb83e'
                }, options)))).to.eql({
                    id: 'ec9fcac1-1e12-4e23-9580-2f5049cbb83e',
                    cookies: [],
                    language: 'Text',
                    previewType: 'html',
                    rawDataType: 'text',
                    responseCode: { detail: '' }
                });
            });
        });

        describe('.convert', function () {
            it('should work correctly without a callback', function () {
                var result;

                expect(function () {
                    result = JSON.parse(JSON.stringify(transformer.convert({
                        info: { id: 'ec9fcac1-1e12-4e23-9580-2f5049cbb83e' }
                    }, options)));
                }).not.to.throw();

                expect(result).to.eql({
                    id: 'ec9fcac1-1e12-4e23-9580-2f5049cbb83e',
                    folders: [],
                    folders_order: [],
                    order: [],
                    requests: []
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
            var fixture = require('../fixtures/sample-description');

            transformer.convert(fixture.v21, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v1);
                done();
            });
        });

        it('should convert descriptions object back to string', function () {
            transformer.convert({
                info: {
                    _postman_id: '9ac7325c-cc3f-4c20-b0f8-a435766cb74c',
                    description: { content: 'collection description' },
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                },
                item: [{
                    _postman_id: 'f3285fa0-e361-43ba-ba15-618c7a911e84',
                    item: [{
                        _postman_id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                        request: {
                            description: { content: 'request description' },
                            body: {
                                disabled: false,
                                mode: 'formdata',
                                formdata: [{
                                    description: { content: 'data description' }, key: 'body_foo', value: 'body_bar'
                                }]
                            },
                            header: [{
                                description: { content: 'header description' }, key: 'header_foo', value: 'header_bar'
                            }],
                            url: {
                                query: [{
                                    description: { content: 'query description' }, key: 'query_foo', value: 'query_bar'
                                }],
                                variable: [{
                                    description: { content: 'variable description' }, key: 'pv_foo', value: 'pv_bar'
                                }]
                            }
                        }
                    }],
                    description: { content: 'folder description' }
                }]
            }, options, function (err, result) {
                expect(err).not.to.be.ok;
                expect(JSON.parse(JSON.stringify(result))).to.eql({
                    id: '9ac7325c-cc3f-4c20-b0f8-a435766cb74c',
                    description: 'collection description',
                    order: [],
                    folders_order: ['f3285fa0-e361-43ba-ba15-618c7a911e84'],
                    folders: [{
                        id: 'f3285fa0-e361-43ba-ba15-618c7a911e84',
                        order: ['9d123ce5-314a-40cd-9852-6a8569513f4e'],
                        folders_order: [],
                        description: 'folder description'
                    }],
                    requests: [{
                        id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                        collectionId: '9ac7325c-cc3f-4c20-b0f8-a435766cb74c',
                        description: 'request description',
                        headers: 'header_foo: header_bar',
                        dataMode: 'params',
                        data: [{
                            description: 'data description', key: 'body_foo', value: 'body_bar'
                        }],
                        pathVariables: { pv_foo: 'pv_bar' },
                        url: '?query_foo=query_bar',
                        pathVariableData: [{
                            description: 'variable description', key: 'pv_foo', value: 'pv_bar'
                        }],
                        queryParams: [{
                            description: 'query description', key: 'query_foo', value: 'query_bar'
                        }],
                        headerData: [{
                            description: 'header description', key: 'header_foo', value: 'header_bar'
                        }],
                        responses_order: []
                    }]
                });
            });
        });

        it('should correctly handle falsy descriptions whilst converting from v2.1.0 to v1', function (done) {
            transformer.convert({
                info: {
                    _postman_id: 'C1',
                    name: 'collection',
                    description: null
                },
                item: [{
                    _postman_id: 'F1',
                    name: 'folder one',
                    description: undefined,
                    item: [{
                        _postman_id: 'R1',
                        name: 'request one',
                        description: ''
                    }]
                }]
            }, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                expect(JSON.parse(JSON.stringify(converted))).to.eql({
                    id: 'C1',
                    name: 'collection',
                    requests: [{
                        id: 'R1',
                        url: '',
                        headerData: [],
                        collectionId: 'C1',
                        name: 'request one',
                        responses_order: []
                    }],
                    folders: [{
                        id: 'F1',
                        order: ['R1'],
                        folders_order: [],
                        name: 'folder one'
                    }],
                    order: [],
                    folders_order: ['F1']
                });
                done();
            });
        });
    });

    describe('request file body', function () {
        it('should correctly handle request file bodies whilst converting from v2.1.0 to v1', function (done) {
            var fixture = require('../fixtures/request-body-file');

            transformer.convert(fixture.v21, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v1);
                done();
            });
        });

        it('should correctly handle non-string and non-array bodies whilst converting from v2 to v1', function (done) {
            transformer.convert({
                info: {
                    name: 'body-src-check',
                    _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                },
                item: [
                    {
                        _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        request: {
                            url: {
                                raw: 'https://postman-echo.com/post',
                                protocol: 'https',
                                host: ['postman-echo', 'com'],
                                path: ['post']
                            },
                            method: 'POST',
                            body: {
                                mode: 'formdata',
                                formdata: [
                                    { key: 'alpha', src: 1, type: 'file' },
                                    { key: 'beta', src: {}, type: 'file' },
                                    { key: 'gamma', src: true, type: 'file' }
                                ]
                            }
                        }
                    }
                ]
            }, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql({
                    id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'body-src-check',
                    order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                    folders: [],
                    folders_order: [],
                    requests: [{
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        url: 'https://postman-echo.com/post',
                        method: 'POST',
                        dataMode: 'params',
                        data: [
                            { key: 'alpha', value: null, type: 'file' },
                            { key: 'beta', value: null, type: 'file' },
                            { key: 'gamma', value: null, type: 'file' }
                        ],
                        headers: '',
                        headerData: [],
                        queryParams: [],
                        pathVariableData: [],
                        responses_order: []
                    }]
                });
                done();
            });
        });

        it('should correctly handle non-string and non-array bodies whilst converting requests from v2 to v1',
            function (done) {
                transformer.convertSingle({
                    _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                    request: {
                        url: {
                            raw: 'https://postman-echo.com/post',
                            protocol: 'https',
                            host: ['postman-echo', 'com'],
                            path: ['post']
                        },
                        method: 'POST',
                        body: {
                            mode: 'formdata',
                            formdata: [
                                { key: 'alpha', type: 'file', src: 1 },
                                { key: 'beta', type: 'file', src: {} },
                                { key: 'gamma', type: 'file', src: true }
                            ]
                        }
                    }
                }, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        url: 'https://postman-echo.com/post',
                        method: 'POST',
                        dataMode: 'params',
                        data: [
                            { key: 'alpha', type: 'file', value: null },
                            { key: 'beta', type: 'file', value: null },
                            { key: 'gamma', type: 'file', value: null }
                        ],
                        headers: '',
                        headerData: [],
                        queryParams: [],
                        pathVariableData: [],
                        responses_order: []
                    });
                    done();
                });
            });
    });

    describe('disabled request body', function () {
        it('should handle disabled request body correctly', function (done) {
            transformer.convert({
                info: {
                    _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'disabled-body',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                },
                item: [{
                    _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                    name: '',
                    request: {
                        body: {
                            disabled: true,
                            mode: 'raw',
                            raw: 'foo=bar'
                        },
                        header: [],
                        method: 'POST',
                        url: {
                            host: ['postman-echo', 'com'],
                            path: ['post'],
                            protocol: 'https',
                            raw: 'https://postman-echo.com/post'
                        }
                    },
                    response: []
                }]
            }, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql({
                    id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'disabled-body',
                    order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                    folders_order: [],
                    folders: [],
                    requests: [{
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        method: 'POST',
                        headers: '',
                        dataMode: 'raw',
                        dataDisabled: true,
                        rawModeData: 'foo=bar',
                        url: 'https://postman-echo.com/post',
                        responses: [],
                        pathVariableData: [],
                        queryParams: [],
                        headerData: [],
                        responses_order: []
                    }]
                });
                done();
            });
        });

        it('should not include disabled property unless its true', function (done) {
            transformer.convert({
                info: {
                    _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'disabled-body',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                },
                item: [{
                    _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                    name: '',
                    request: {
                        body: {
                            disabled: false,
                            mode: 'raw',
                            raw: 'foo=bar'
                        },
                        header: [],
                        method: 'POST',
                        url: {
                            host: ['postman-echo', 'com'],
                            path: ['post'],
                            protocol: 'https',
                            raw: 'https://postman-echo.com/post'
                        }
                    },
                    response: []
                }]
            }, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql({
                    id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'disabled-body',
                    order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                    folders_order: [],
                    folders: [],
                    requests: [{
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        method: 'POST',
                        headers: '',
                        dataMode: 'raw',
                        rawModeData: 'foo=bar',
                        url: 'https://postman-echo.com/post',
                        responses: [],
                        pathVariableData: [],
                        queryParams: [],
                        headerData: [],
                        responses_order: []
                    }]
                });
                done();
            });
        });
    });

    describe('request body', function () {
        it('should handle request without body correctly', function (done) {
            transformer.convert({
                info: {
                    _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'null-request-body',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                },
                item: [{
                    _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                    name: '',
                    request: {
                        header: [],
                        method: 'POST',
                        url: {
                            host: ['postman-echo', 'com'],
                            path: ['post'],
                            protocol: 'https',
                            raw: 'https://postman-echo.com/post'
                        }
                    },
                    response: []
                }]
            }, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql({
                    id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'null-request-body',
                    order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                    folders_order: [],
                    folders: [],
                    requests: [{
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        method: 'POST',
                        headers: '',
                        url: 'https://postman-echo.com/post',
                        responses: [],
                        pathVariableData: [],
                        queryParams: [],
                        headerData: [],
                        responses_order: []
                    }]
                });
                done();
            });
        });

        it('should set body mode (raw) even if data is not set', function (done) {
            transformer.convert({
                info: {
                    _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'disabled-body',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                },
                item: [{
                    _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                    name: '',
                    request: {
                        body: {
                            mode: 'raw'
                        },
                        header: [],
                        method: 'POST',
                        url: {
                            host: ['postman-echo', 'com'],
                            path: ['post'],
                            protocol: 'https',
                            raw: 'https://postman-echo.com/post'
                        }
                    },
                    response: []
                }]
            }, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql({
                    id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'disabled-body',
                    order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                    folders_order: [],
                    folders: [],
                    requests: [{
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        method: 'POST',
                        headers: '',
                        dataMode: 'raw',
                        url: 'https://postman-echo.com/post',
                        responses: [],
                        pathVariableData: [],
                        queryParams: [],
                        headerData: [],
                        responses_order: []
                    }]
                });
                done();
            });
        });

        it('should set body mode (params) even if data is not set', function (done) {
            transformer.convert({
                info: {
                    _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'disabled-body',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                },
                item: [{
                    _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                    name: '',
                    request: {
                        body: {
                            mode: 'formdata'
                        },
                        header: [],
                        method: 'POST',
                        url: {
                            host: ['postman-echo', 'com'],
                            path: ['post'],
                            protocol: 'https',
                            raw: 'https://postman-echo.com/post'
                        }
                    },
                    response: []
                }]
            }, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql({
                    id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'disabled-body',
                    order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                    folders_order: [],
                    folders: [],
                    requests: [{
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        method: 'POST',
                        headers: '',
                        data: [],
                        dataMode: 'params',
                        url: 'https://postman-echo.com/post',
                        responses: [],
                        pathVariableData: [],
                        queryParams: [],
                        headerData: [],
                        responses_order: []
                    }]
                });
                done();
            });
        });

        it('should set body mode (binary) even if data is not set', function (done) {
            transformer.convert({
                info: {
                    _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'disabled-body',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                },
                item: [{
                    _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                    name: '',
                    request: {
                        body: {
                            mode: 'file'
                        },
                        header: [],
                        method: 'POST',
                        url: {
                            host: ['postman-echo', 'com'],
                            path: ['post'],
                            protocol: 'https',
                            raw: 'https://postman-echo.com/post'
                        }
                    },
                    response: []
                }]
            }, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql({
                    id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'disabled-body',
                    order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                    folders_order: [],
                    folders: [],
                    requests: [{
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        method: 'POST',
                        headers: '',
                        dataMode: 'binary',
                        url: 'https://postman-echo.com/post',
                        responses: [],
                        pathVariableData: [],
                        queryParams: [],
                        headerData: [],
                        responses_order: []
                    }]
                });
                done();
            });
        });

        it('should set body mode (urlencoded) even if data is not set', function (done) {
            transformer.convert({
                info: {
                    _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'disabled-body',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                },
                item: [{
                    _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                    name: '',
                    request: {
                        body: {
                            mode: 'urlencoded'
                        },
                        header: [],
                        method: 'POST',
                        url: {
                            host: ['postman-echo', 'com'],
                            path: ['post'],
                            protocol: 'https',
                            raw: 'https://postman-echo.com/post'
                        }
                    },
                    response: []
                }]
            }, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql({
                    id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'disabled-body',
                    order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                    folders_order: [],
                    folders: [],
                    requests: [{
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        method: 'POST',
                        headers: '',
                        data: [],
                        dataMode: 'urlencoded',
                        url: 'https://postman-echo.com/post',
                        responses: [],
                        pathVariableData: [],
                        queryParams: [],
                        headerData: [],
                        responses_order: []
                    }]
                });
                done();
            });
        });

        it('should set body mode (graphql) even if data is not set', function (done) {
            transformer.convert({
                info: {
                    _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'disabled-body',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                },
                item: [{
                    _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                    name: '',
                    request: {
                        body: {
                            mode: 'graphql'
                        },
                        header: [],
                        method: 'POST',
                        url: {
                            host: ['postman-echo', 'com'],
                            path: ['post'],
                            protocol: 'https',
                            raw: 'https://postman-echo.com/post'
                        }
                    },
                    response: []
                }]
            }, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql({
                    id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                    name: 'disabled-body',
                    order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                    folders_order: [],
                    folders: [],
                    requests: [{
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        method: 'POST',
                        headers: '',
                        dataMode: 'graphql',
                        url: 'https://postman-echo.com/post',
                        responses: [],
                        pathVariableData: [],
                        queryParams: [],
                        headerData: [],
                        responses_order: []
                    }]
                });
                done();
            });
        });
    });

    describe('request body options', function () {
        describe('with convert', function () {
            it('should transform body options', function (done) {
                transformer.convert({
                    info: {
                        _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        name: 'null-request-body',
                        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                    },
                    item: [{
                        _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        request: {
                            header: [],
                            method: 'POST',
                            url: {
                                host: ['postman-echo', 'com'],
                                path: ['post'],
                                protocol: 'https',
                                raw: 'https://postman-echo.com/post'
                            },
                            body: {
                                mode: 'raw',
                                raw: '[{ key: \'foo\', value: \'bar\', disabled: true }]',
                                options: {
                                    urlencoded: {
                                        contentType: 'application/x-www-form-urlencoded'
                                    },
                                    raw: {
                                        contentType: 'application/json'
                                    },
                                    formdata: {
                                        contentType: 'multipart/form-data'
                                    },
                                    file: {
                                        contentType: 'application/json'
                                    }
                                }
                            }
                        },
                        response: []
                    }]
                }, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        name: 'null-request-body',
                        order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                        folders_order: [],
                        folders: [],
                        requests: [{
                            id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                            name: '',
                            collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                            method: 'POST',
                            headers: '',
                            url: 'https://postman-echo.com/post',
                            responses: [],
                            pathVariableData: [],
                            queryParams: [],
                            headerData: [],
                            dataMode: 'raw',
                            rawModeData: '[{ key: \'foo\', value: \'bar\', disabled: true }]',
                            dataOptions: {
                                urlencoded: {
                                    contentType: 'application/x-www-form-urlencoded'
                                },
                                raw: {
                                    contentType: 'application/json'
                                },
                                params: {
                                    contentType: 'multipart/form-data'
                                },
                                binary: {
                                    contentType: 'application/json'
                                }
                            },
                            responses_order: []
                        }]
                    });
                    done();
                });
            });

            it('should transform when options are not present', function (done) {
                transformer.convert({
                    info: {
                        _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        name: 'null-request-body',
                        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                    },
                    item: [{
                        _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        request: {
                            header: [],
                            method: 'POST',
                            url: {
                                host: ['postman-echo', 'com'],
                                path: ['post'],
                                protocol: 'https',
                                raw: 'https://postman-echo.com/post'
                            },
                            body: {
                                mode: 'raw',
                                raw: '[{ key: \'foo\', value: \'bar\', disabled: true }]'
                            }
                        },
                        response: []
                    }]
                }, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        name: 'null-request-body',
                        order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                        folders_order: [],
                        folders: [],
                        requests: [{
                            id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                            name: '',
                            collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                            method: 'POST',
                            headers: '',
                            url: 'https://postman-echo.com/post',
                            responses: [],
                            pathVariableData: [],
                            queryParams: [],
                            headerData: [],
                            dataMode: 'raw',
                            rawModeData: '[{ key: \'foo\', value: \'bar\', disabled: true }]',
                            responses_order: []
                        }]
                    });
                    done();
                });
            });

            it('should strip body options if invalid option is provided', function (done) {
                transformer.convert({
                    info: {
                        _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        name: 'null-request-body',
                        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                    },
                    item: [{
                        _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        request: {
                            header: [],
                            method: 'POST',
                            url: {
                                host: ['postman-echo', 'com'],
                                path: ['post'],
                                protocol: 'https',
                                raw: 'https://postman-echo.com/post'
                            },
                            body: {
                                mode: 'formdata',
                                formdata: [{
                                    key: 'foo',
                                    value: 'bar'
                                }],
                                options: 'INVALID_OPTIONS'
                            }
                        },
                        response: []
                    }]
                }, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        name: 'null-request-body',
                        order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                        folders_order: [],
                        folders: [],
                        requests: [{
                            id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                            name: '',
                            collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                            method: 'POST',
                            headers: '',
                            url: 'https://postman-echo.com/post',
                            responses: [],
                            pathVariableData: [],
                            queryParams: [],
                            headerData: [],
                            dataMode: 'params',
                            data: [{
                                key: 'foo',
                                value: 'bar'
                            }],
                            responses_order: []
                        }]
                    });
                    done();
                });
            });
        });

        describe('with convertSingle', function () {
            it('should transform body options', function (done) {
                transformer.convertSingle({
                    _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                    name: '',
                    request: {
                        body: {
                            mode: 'raw',
                            raw: 'foo=bar',
                            options: {
                                urlencoded: {
                                    contentType: 'application/x-www-form-urlencoded'
                                },
                                raw: {
                                    contentType: 'application/json'
                                },
                                formdata: {
                                    contentType: 'multipart/form-data'
                                },
                                file: {
                                    contentType: 'application/json'
                                }
                            }
                        },
                        method: 'GET',
                        url: 'https://postman-echo.com/get'
                    }
                }, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        method: 'GET',
                        headers: '',
                        dataMode: 'raw',
                        rawModeData: 'foo=bar',
                        dataOptions: {
                            urlencoded: {
                                contentType: 'application/x-www-form-urlencoded'
                            },
                            raw: {
                                contentType: 'application/json'
                            },
                            params: {
                                contentType: 'multipart/form-data'
                            },
                            binary: {
                                contentType: 'application/json'
                            }
                        },
                        url: 'https://postman-echo.com/get',
                        pathVariableData: [],
                        queryParams: [],
                        headerData: [],
                        responses_order: []
                    });
                    done();
                });
            });

            it('should transform when options are not present', function (done) {
                transformer.convertSingle({
                    _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                    name: '',
                    request: {
                        body: {
                            mode: 'raw',
                            raw: 'foo=bar'
                        },
                        method: 'GET',
                        url: 'https://postman-echo.com/get'
                    }
                }, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        method: 'GET',
                        headers: '',
                        dataMode: 'raw',
                        rawModeData: 'foo=bar',
                        url: 'https://postman-echo.com/get',
                        pathVariableData: [],
                        queryParams: [],
                        headerData: [],
                        responses_order: []
                    });
                    done();
                });
            });

            it('should strip body options if empty option is provided', function (done) {
                transformer.convertSingle({
                    _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                    name: '',
                    request: {
                        body: {
                            mode: 'raw',
                            raw: 'foo=bar',
                            options: { raw: {} }
                        },
                        method: 'GET',
                        url: 'https://postman-echo.com/get'
                    }
                }, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        method: 'GET',
                        headers: '',
                        dataMode: 'raw',
                        rawModeData: 'foo=bar',
                        url: 'https://postman-echo.com/get',
                        pathVariableData: [],
                        queryParams: [],
                        headerData: [],
                        responses_order: []
                    });
                    done();
                });
            });
        });
    });

    describe('protocolProfileBehavior', function () {
        describe('with convert', function () {
            it('should be converted at request level', function (done) {
                transformer.convert({
                    info: {
                        _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        name: 'get-with-body',
                        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                    },
                    item: [{
                        _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        request: {
                            body: {
                                mode: 'raw',
                                raw: 'foo=bar'
                            },
                            header: [],
                            method: 'GET',
                            url: {
                                host: ['postman-echo', 'com'],
                                path: ['get'],
                                protocol: 'https',
                                raw: 'https://postman-echo.com/get'
                            }
                        },
                        response: [],
                        protocolProfileBehavior: {
                            disableBodyPruning: true
                        }
                    }]
                }, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        name: 'get-with-body',
                        order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                        folders_order: [],
                        folders: [],
                        requests: [{
                            id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                            name: '',
                            collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                            method: 'GET',
                            headers: '',
                            dataMode: 'raw',
                            protocolProfileBehavior: {
                                disableBodyPruning: true
                            },
                            rawModeData: 'foo=bar',
                            url: 'https://postman-echo.com/get',
                            responses: [],
                            pathVariableData: [],
                            queryParams: [],
                            headerData: [],
                            responses_order: []
                        }]
                    });
                    done();
                });
            });

            it('should be converted at collection level', function (done) {
                transformer.convert({
                    info: {
                        _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        name: 'get-with-body',
                        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                    },
                    item: [{
                        _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        request: {
                            body: {
                                mode: 'raw',
                                raw: 'foo=bar'
                            },
                            header: [],
                            method: 'GET',
                            url: {
                                host: ['postman-echo', 'com'],
                                path: ['get'],
                                protocol: 'https',
                                raw: 'https://postman-echo.com/get'
                            }
                        },
                        response: []
                    }],
                    protocolProfileBehavior: {
                        disableBodyPruning: true
                    }
                }, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        name: 'get-with-body',
                        order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                        folders_order: [],
                        folders: [],
                        requests: [{
                            id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                            name: '',
                            collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                            method: 'GET',
                            headers: '',
                            dataMode: 'raw',
                            rawModeData: 'foo=bar',
                            url: 'https://postman-echo.com/get',
                            responses: [],
                            pathVariableData: [],
                            queryParams: [],
                            headerData: [],
                            responses_order: []
                        }],
                        protocolProfileBehavior: {
                            disableBodyPruning: true
                        }
                    });
                    done();
                });
            });

            it('should be converted at folder level', function (done) {
                transformer.convert({
                    info: {
                        _postman_id: '969e90b1-0742-41b5-8602-e137d25274ac'
                    },
                    auth: { type: 'noauth' },
                    item: [{
                        _postman_id: 'a9832f4d-657c-4cd2-a5a4-7ddd6bc4948e',
                        auth: { type: 'noauth' },
                        item: [],
                        protocolProfileBehavior: {
                            disableBodyPruning: true
                        }
                    }]
                }, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '969e90b1-0742-41b5-8602-e137d25274ac',
                        folders: [{
                            id: 'a9832f4d-657c-4cd2-a5a4-7ddd6bc4948e',
                            auth: { type: 'noauth' },
                            folders_order: [],
                            order: [],
                            protocolProfileBehavior: {
                                disableBodyPruning: true
                            }
                        }],
                        order: [],
                        requests: [],
                        folders_order: ['a9832f4d-657c-4cd2-a5a4-7ddd6bc4948e']
                    });
                    done();
                });
            });

            it('should not include the property for invalid values', function (done) {
                transformer.convert({
                    info: {
                        _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        name: 'get-with-body',
                        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                    },
                    item: [{
                        _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        name: '',
                        request: {
                            body: {
                                mode: 'raw',
                                raw: 'foo=bar'
                            },
                            header: [],
                            method: 'GET',
                            url: {
                                host: ['postman-echo', 'com'],
                                path: ['get'],
                                protocol: 'https',
                                raw: 'https://postman-echo.com/get'
                            }
                        },
                        response: [],
                        protocolProfileBehavior: 'random'
                    }]
                }, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                        name: 'get-with-body',
                        order: ['4f65e265-dd38-0a67-71a5-d9dd50fa37a1'],
                        folders_order: [],
                        folders: [],
                        requests: [{
                            id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                            name: '',
                            collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                            method: 'GET',
                            headers: '',
                            dataMode: 'raw',
                            rawModeData: 'foo=bar',
                            url: 'https://postman-echo.com/get',
                            responses: [],
                            pathVariableData: [],
                            queryParams: [],
                            headerData: [],
                            responses_order: []
                        }]
                    });
                    done();
                });
            });

            it('should not include an empty object', function (done) {
                transformer.convert({
                    info: {
                        _postman_id: '969e90b1-0742-41b5-8602-e137d25274ac'
                    },
                    auth: { type: 'noauth' },
                    item: [{
                        _postman_id: 'a9832f4d-657c-4cd2-a5a4-7ddd6bc4948e',
                        auth: { type: 'noauth' },
                        item: [{ id: '123', protocolProfileBehavior: {} }],
                        protocolProfileBehavior: {}
                    }],
                    protocolProfileBehavior: {}
                }, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '969e90b1-0742-41b5-8602-e137d25274ac',
                        folders: [{
                            id: 'a9832f4d-657c-4cd2-a5a4-7ddd6bc4948e',
                            auth: { type: 'noauth' },
                            folders_order: [],
                            order: ['123']
                        }],
                        order: [],
                        requests: [{
                            collectionId: '969e90b1-0742-41b5-8602-e137d25274ac',
                            headerData: [],
                            id: '123',
                            url: '',
                            responses_order: []
                        }],
                        folders_order: ['a9832f4d-657c-4cd2-a5a4-7ddd6bc4948e']
                    });
                    done();
                });
            });
        });

        describe('with convertSingle', function () {
            it('should be handled correctly', function (done) {
                transformer.convertSingle({
                    _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                    request: {
                        body: {
                            mode: 'raw',
                            raw: 'foo=bar'
                        },
                        method: 'GET',
                        url: {
                            host: ['postman-echo', 'com'],
                            path: ['get'],
                            protocol: 'https',
                            raw: 'https://postman-echo.com/get'
                        }
                    },
                    protocolProfileBehavior: {
                        disableBodyPruning: true
                    }
                }, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        method: 'GET',
                        headers: '',
                        dataMode: 'raw',
                        protocolProfileBehavior: {
                            disableBodyPruning: true
                        },
                        rawModeData: 'foo=bar',
                        url: 'https://postman-echo.com/get',
                        pathVariableData: [],
                        queryParams: [],
                        headerData: [],
                        responses_order: []
                    });
                    done();
                });
            });

            it('should not include the property for invalid values', function (done) {
                transformer.convertSingle({
                    _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                    request: {
                        body: {
                            mode: 'raw',
                            raw: 'foo=bar'
                        },
                        method: 'GET',
                        url: {
                            host: ['postman-echo', 'com'],
                            path: ['get'],
                            protocol: 'https',
                            raw: 'https://postman-echo.com/get'
                        }
                    },
                    protocolProfileBehavior: 'random'
                }, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                        method: 'GET',
                        headers: '',
                        dataMode: 'raw',
                        rawModeData: 'foo=bar',
                        url: 'https://postman-echo.com/get',
                        pathVariableData: [],
                        queryParams: [],
                        headerData: [],
                        responses_order: []
                    });
                    done();
                });
            });
        });
    });

    describe('auth', function () {
        it('should be handled correctly in v2.1.0 -> v1 conversions', function (done) {
            var fixture = require('../fixtures/sample-auth');

            transformer.convert(fixture.v21, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v1);
                done();
            });
        });

        describe('with requests', function () {
            it('should correctly infer a noauth type from the auth object for requests with noauth', function (done) {
                var source = {
                    _postman_id: '969e90b1-0742-41b5-8602-e137d25274ac',
                    request: {
                        auth: {
                            type: 'noauth'
                        }
                    }
                };

                transformer.convertSingle(source, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '969e90b1-0742-41b5-8602-e137d25274ac',
                        currentHelper: null,
                        helperAttributes: null,
                        auth: { type: 'noauth' },
                        headers: '',
                        url: '',
                        headerData: [],
                        responses_order: []
                    });
                    done();
                });
            });

            it('should correctly infer a noauth type from the auth object for requests with null', function (done) {
                var source = {
                    _postman_id: '969e90b1-0742-41b5-8602-e137d25274ac',
                    request: {
                        auth: null
                    }
                };

                transformer.convertSingle(source, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '969e90b1-0742-41b5-8602-e137d25274ac',
                        currentHelper: null,
                        helperAttributes: null,
                        auth: null,
                        headers: '',
                        url: '',
                        headerData: [],
                        responses_order: []
                    });
                    done();
                });
            });
        });

        describe('with collections', function () {
            it('should correctly infer a noauth type from the auth object for requests', function (done) {
                var source = {
                    info: {
                        _postman_id: '969e90b1-0742-41b5-8602-e137d25274ac'
                    },
                    auth: { type: 'noauth' },
                    item: [{
                        _postman_id: 'a9832f4d-657c-4cd2-a5a4-7ddd6bc4948e',
                        auth: { type: 'noauth' },
                        item: []
                    }]
                };

                transformer.convert(source, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '969e90b1-0742-41b5-8602-e137d25274ac',
                        folders: [{
                            id: 'a9832f4d-657c-4cd2-a5a4-7ddd6bc4948e',
                            auth: { type: 'noauth' },
                            folders_order: [],
                            order: []
                        }],
                        order: [],
                        requests: [],
                        folders_order: ['a9832f4d-657c-4cd2-a5a4-7ddd6bc4948e']
                    });
                    done();
                });
            });

            it('should correctly infer a noauth type from the null auth object for requests', function (done) {
                var source = {
                    info: {
                        _postman_id: '969e90b1-0742-41b5-8602-e137d25274ac'
                    },
                    auth: null,
                    item: [{
                        _postman_id: 'a9832f4d-657c-4cd2-a5a4-7ddd6bc4948e',
                        auth: null,
                        item: []
                    }]
                };

                transformer.convert(source, options, function (err, converted) {
                    expect(err).to.not.be.ok;

                    // remove `undefined` properties for testing
                    converted = JSON.parse(JSON.stringify(converted));

                    expect(converted).to.eql({
                        id: '969e90b1-0742-41b5-8602-e137d25274ac',
                        folders: [{
                            id: 'a9832f4d-657c-4cd2-a5a4-7ddd6bc4948e',
                            auth: null,
                            folders_order: [],
                            order: []
                        }],
                        order: [],
                        requests: [],
                        folders_order: ['a9832f4d-657c-4cd2-a5a4-7ddd6bc4948e']
                    });
                    done();
                });
            });
        });
    });

    describe('URL', function () {
        it('should handle query params in string URL properly', function () {
            transformer.convertSingle({
                _postman_id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                request: {
                    url: 'http://postman-echo.com/path?foo=bar&baz&alpha=&=&&beta'
                },
                response: []
            }, options, function (err, result) {
                expect(err).not.to.be.ok;
                expect(JSON.parse(JSON.stringify(result))).to.eql({
                    id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                    pathVariableData: [],
                    responses: [],
                    headerData: [],
                    headers: '',
                    url: 'http://postman-echo.com/path?foo=bar&baz&alpha=&=&&beta',
                    queryParams: [
                        { key: 'foo', value: 'bar' },
                        { key: 'baz', value: null },
                        { key: 'alpha', value: '' },
                        { key: '', value: '' },
                        { key: null, value: null },
                        { key: 'beta', value: null }
                    ],
                    responses_order: []
                });
            });
        });

        it('should handle query params in URL object properly', function () {
            transformer.convertSingle({
                _postman_id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                request: {
                    url: {
                        protocol: 'http',
                        host: ['postman-echo', 'com'],
                        path: ['path'],
                        query: [
                            { key: 'foo', value: 'bar' },
                            { key: 'baz', value: null },
                            { key: 'alpha', value: '' },
                            { key: '', value: '' },
                            { key: null, value: null },
                            { key: 'beta', value: null }
                        ]
                    }
                },
                response: []
            }, options, function (err, result) {
                expect(err).not.to.be.ok;
                expect(JSON.parse(JSON.stringify(result))).to.eql({
                    id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                    pathVariableData: [],
                    responses: [],
                    headerData: [],
                    headers: '',
                    url: 'http://postman-echo.com/path?foo=bar&baz&alpha=&=&&beta',
                    queryParams: [
                        { key: 'foo', value: 'bar' },
                        { key: 'baz', value: null },
                        { key: 'alpha', value: '' },
                        { key: '', value: '' },
                        { key: null, value: null },
                        { key: 'beta', value: null }
                    ],
                    responses_order: []
                });
            });
        });
    });

    describe('nested entities', function () {
        it('should be handled correctly in v2.1 -> v1 conversions', function (done) {
            var fixture = require('../fixtures/nested-entities');

            transformer.convert(fixture.v21, options, function (err, converted) {
                expect(err).to.not.be.ok;

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted).to.eql(fixture.v1);
                done();
            });
        });
    });

    describe('malformed collections', function () {
        it('should be handled correctly', function (done) {
            transformer.convert({
                info: { _postman_id: '2509a94e-eca1-43ca-a8aa-0e200636764f' },
                item: [false, null, {
                    _postman_id: 'F1',
                    item: [false, null, { _postman_id: 'R1' }, 0, NaN, '', undefined]
                }, 0, NaN, '', undefined]
            }, options, function (err, result) {
                expect(err).to.not.be.ok;
                expect(JSON.parse(JSON.stringify(result))).to.eql({
                    id: '2509a94e-eca1-43ca-a8aa-0e200636764f',
                    folders: [{ id: 'F1', folders_order: [], order: ['R1'] }],
                    folders_order: ['F1'],
                    order: [],
                    requests: [{
                        collectionId: '2509a94e-eca1-43ca-a8aa-0e200636764f',
                        headerData: [],
                        id: 'R1',
                        url: '',
                        responses_order: []
                    }]
                });
                done();
            });
        });

        it('should correctly convert text to string', function (done) {
            transformer.convert({
                info: {
                    _postman_id: '2509a94e-eca1-43ca-a8aa-0e200636764f'
                },
                auth: {
                    type: 'bearer',
                    bearer: [{ key: 'token', value: 'bar', type: 'text' }]
                },
                variable: [{
                    id: 'f42cc664-4823-4012-b7dd-9e9f965b736a', key: 'foo', value: 'bar', type: 'text'
                }]
            }, options, function (err, result) {
                expect(err).to.not.be.ok;
                expect(JSON.parse(JSON.stringify(result))).to.eql({
                    id: '2509a94e-eca1-43ca-a8aa-0e200636764f',
                    auth: {
                        type: 'bearer',
                        bearer: [{ key: 'token', value: 'bar', type: 'string' }]
                    },
                    folders: [],
                    folders_order: [],
                    order: [],
                    requests: [],
                    variables: [{
                        id: 'f42cc664-4823-4012-b7dd-9e9f965b736a', key: 'foo', value: 'bar', type: 'string'
                    }]
                });
                done();
            });
        });
    });

    describe('retainIds', function () {
        var responses = [{ id: null }, { id: NaN }, { id: undefined }, { id: false }, { id: '' }, { id: 0 }],
            items = [
                { _postman_id: null, response: responses },
                { _postman_id: NaN, response: responses },
                { _postman_id: undefined, response: responses },
                { _postman_id: false, response: responses },
                { _postman_id: '', response: responses },
                { _postman_id: 0, response: responses }
            ];

        it('should handle IDs correctly when set to true', function () {
            transformer.convert({
                info: { _postman_id: '2509a94e-eca1-43ca-a8aa-0e200636764f' },
                item: [
                    { _postman_id: null, item: items },
                    { _postman_id: NaN, item: items },
                    { _postman_id: undefined, item: items },
                    { _postman_id: false, item: items },
                    { _postman_id: '', item: items },
                    { _postman_id: 0, item: items }
                ]
            }, options, function (err, result) {
                expect(err).to.not.be.ok;

                expect(result).to.have.property('id', '2509a94e-eca1-43ca-a8aa-0e200636764f');
                expect(result.requests).to.have.length(36);

                _.forEach(result.folders, function (folder) {
                    expect(folder.id).to.match(/[a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8}/);
                });
                _.forEach(result.requests, function (request) {
                    expect(request.id).to.match(/[a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8}/);
                    _.forEach(request.responses, function (response) {
                        expect(response.id).to.match(/[a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8}/);
                    });
                });
            });
        });

        it('should handle IDs correctly when set to false', function () {
            transformer.convert({
                info: { _postman_id: 'R1' },
                item: [
                    { _postman_id: null, item: items },
                    { _postman_id: NaN, item: items },
                    { _postman_id: undefined, item: items },
                    { _postman_id: false, item: items },
                    { _postman_id: '', item: items },
                    { _postman_id: 0, item: items }
                ]
            }, _.defaults({ retainIds: false }, options), function (err, result) {
                expect(err).to.not.be.ok;

                expect(result.id).to.match(/[a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8}/);
                expect(result.requests).to.have.length(36);


                _.forEach(result.folders, function (folder) {
                    expect(folder.id).to.match(/[a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8}/);
                });
                _.forEach(result.requests, function (request) {
                    expect(request.id).to.match(/[a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8}/);
                    _.forEach(request.responses, function (response) {
                        expect(response.id).to.match(/[a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8}/);
                    });
                });
            });
        });

        it('should handle IDs correctly when missing', function () {
            transformer.convert({
                info: { _postman_id: 'R1' },
                item: [
                    { _postman_id: null, item: items },
                    { _postman_id: NaN, item: items },
                    { _postman_id: undefined, item: items },
                    { _postman_id: false, item: items },
                    { _postman_id: '', item: items },
                    { _postman_id: 0, item: items }
                ]
            }, _.omit(options, ['retainIds']), function (err, result) {
                expect(err).to.not.be.ok;

                expect(result.id).to.match(/[a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8}/);
                expect(result.requests).to.have.length(36);

                _.forEach(result.folders, function (folder) {
                    expect(folder.id).to.match(/[a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8}/);
                });
                _.forEach(result.requests, function (request) {
                    expect(request.id).to.match(/[a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8}/);
                    _.forEach(request.responses, function (response) {
                        expect(response.id).to.match(/[a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8}/);
                    });
                });
            });
        });

        it('should convert IDs and order references everywhere', function () {
            transformer.convert(nestedEntitiesCollection, _.omit(options, ['retainIds']), function (err, result) {
                var folderIds = [],
                    folderOrderIds = [],
                    requestIds = [],
                    requestOrderIds = [];

                expect(err).to.not.be.ok;

                folderOrderIds = folderOrderIds.concat(result.folders_order);

                _.forEach(result.folders, function (folder) {
                    folderOrderIds = folderOrderIds.concat(folder.folders_order);
                    requestOrderIds = requestOrderIds.concat(folder.order);
                });

                requestIds = _.map(result.requests, 'id');
                folderIds = _.map(result.folders, 'id');

                expect(folderIds).to.not.be.empty;
                expect(requestIds).to.not.be.empty;

                // validate the format of request and folder ids
                _.forEach(folderIds, function (folderId) {
                    expect(folderId).to.match(/[a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8}/);
                });
                _.forEach(requestIds, function (requestId) {
                    expect(requestId).to.match(/[a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8}/);
                });

                // validate the folder ids are the same as their references from parent via `folders_order`
                expect(folderIds.length).to.equal(folderOrderIds.length);
                expect(folderIds).to.have.members(folderOrderIds);

                // validate the request ids are the same as their references from parent via `order`
                expect(requestIds.length).to.equal(requestOrderIds.length);
                expect(requestIds).to.have.members(requestOrderIds);
            });
        });
    });

    describe('retainEmptyValues', function () {
        var options = {
            inputVersion: '2.1.0',
            outputVersion: '1.0.0',
            retainIds: true,
            retainEmptyValues: true
        };

        it('should nullify empty descriptions and retain disabled states in collections when set to true', function () {
            transformer.convert({
                info: {
                    _postman_id: '9ac7325c-cc3f-4c20-b0f8-a435766cb74c',
                    description: 0,
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                },
                item: [{
                    _postman_id: 'f3285fa0-e361-43ba-ba15-618c7a911e84',
                    item: [{
                        _postman_id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                        name: '',
                        request: {
                            auth: { type: 'bearer', bearer: [{ key: 'token', value: 'random', type: 'string' }] },
                            description: '',
                            body: {
                                disabled: false,
                                mode: 'formdata',
                                formdata: [{ description: undefined, key: 'body_foo', value: 'body_bar' }]
                            },
                            header: [{ description: NaN, key: 'header_foo', value: 'header_bar' }],
                            url: {
                                query: [{ description: false, key: 'query_foo', value: 'query_bar' }],
                                raw: '',
                                variable: [{ description: '', key: 'pv_foo', value: 'pv_bar' }]
                            }
                        },
                        response: []
                    }],
                    description: undefined
                }]
            }, options, function (err, result) {
                expect(err).not.to.be.ok;
                expect(JSON.parse(JSON.stringify(result))).to.eql({
                    id: '9ac7325c-cc3f-4c20-b0f8-a435766cb74c',
                    description: null, // this represents the case where descriptions are removed
                    order: [],
                    folders_order: ['f3285fa0-e361-43ba-ba15-618c7a911e84'],
                    folders: [{
                        id: 'f3285fa0-e361-43ba-ba15-618c7a911e84',
                        description: null,
                        folders_order: [],
                        order: ['9d123ce5-314a-40cd-9852-6a8569513f4e']
                    }],
                    requests: [{
                        id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                        collectionId: '9ac7325c-cc3f-4c20-b0f8-a435766cb74c',
                        description: null,
                        dataMode: 'params',
                        dataDisabled: false,
                        name: '',
                        pathVariables: { pv_foo: 'pv_bar' },
                        pathVariableData: [{ description: null, key: 'pv_foo', value: 'pv_bar' }],
                        rawModeData: null,
                        graphqlModeData: null,
                        responses: [],
                        url: '?query_foo=query_bar',
                        data: [{ description: null, key: 'body_foo', value: 'body_bar' }],
                        headers: 'header_foo: header_bar',
                        currentHelper: 'bearerAuth',
                        helperAttributes: { id: 'bearer', token: 'random' },
                        auth: { type: 'bearer', bearer: [{ key: 'token', value: 'random', type: 'string' }] },
                        headerData: [{ key: 'header_foo', value: 'header_bar', description: null }],
                        queryParams: [{ key: 'query_foo', value: 'query_bar', description: null }],
                        responses_order: []
                    }]
                });
            });
        });

        it('should nullify empty descriptions and retain disabled states in requests when set to true', function () {
            transformer.convertSingle({
                _postman_id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                request: {
                    auth: { type: 'bearer', bearer: [{ key: 'token', value: 'random', type: 'string' }] },
                    description: null,
                    body: {
                        disabled: false,
                        mode: 'formdata',
                        formdata: [{ description: undefined, key: 'body_foo', value: 'body_bar' }]
                    },
                    header: [{ description: NaN, key: 'header_foo', value: 'header_bar' }],
                    url: {
                        query: [{ description: undefined, key: 'query_foo', value: 'query_bar' }],
                        raw: '',
                        variable: [{ description: '', key: 'pv_foo', value: 'pv_bar' }]
                    }
                },
                response: []
            }, options, function (err, result) {
                expect(err).not.to.be.ok;

                expect(JSON.parse(JSON.stringify(result))).to.eql({
                    id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                    description: null,
                    dataMode: 'params',
                    dataDisabled: false,
                    data: [{ description: null, key: 'body_foo', value: 'body_bar' }],
                    pathVariables: { pv_foo: 'pv_bar' },
                    pathVariableData: [{ description: null, key: 'pv_foo', value: 'pv_bar' }],
                    responses: [],
                    currentHelper: 'bearerAuth',
                    helperAttributes: { id: 'bearer', token: 'random' },
                    auth: { type: 'bearer', bearer: [{ key: 'token', value: 'random', type: 'string' }] },
                    headers: 'header_foo: header_bar',
                    url: '?query_foo=query_bar',
                    rawModeData: null,
                    graphqlModeData: null,
                    headerData: [{ key: 'header_foo', value: 'header_bar', description: null }],
                    queryParams: [{ key: 'query_foo', value: 'query_bar', description: null }],
                    responses_order: []
                });
            });
        });

        it('should handle null request body correctly', function () {
            transformer.convertSingle({
                _postman_id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                request: {
                    body: null,
                    url: {
                        query: [{ description: undefined, key: 'query_foo', value: 'query_bar' }],
                        raw: ''
                    }
                },
                response: []
            }, options, function (err, result) {
                expect(err).not.to.be.ok;

                expect(JSON.parse(JSON.stringify(result))).to.eql({
                    id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                    description: null,
                    data: null,
                    pathVariableData: [],
                    responses: [],
                    headerData: [],
                    headers: '',
                    url: '?query_foo=query_bar',
                    rawModeData: null,
                    graphqlModeData: null,
                    queryParams: [{ key: 'query_foo', value: 'query_bar', description: null }],
                    responses_order: []
                });
            });
        });

        it('should work correctly for urlencoded bodies as well', function () {
            transformer.convertSingle({
                _postman_id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                request: {
                    auth: { type: 'bearer', bearer: [{ key: 'token', value: 'random', type: 'string' }] },
                    description: null,
                    body: {
                        disabled: false,
                        mode: 'urlencoded',
                        urlencoded: [{ description: undefined, key: 'body_foo', value: 'body_bar' }]
                    },
                    header: [{ description: NaN, key: 'header_foo', value: 'header_bar' }],
                    url: {
                        query: [{ description: undefined, key: 'query_foo', value: 'query_bar' }],
                        raw: '',
                        variable: [{ description: '', key: 'pv_foo', value: 'pv_bar' }]
                    }
                },
                response: []
            }, options, function (err, result) {
                expect(err).not.to.be.ok;

                expect(JSON.parse(JSON.stringify(result))).to.eql({
                    id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                    description: null,
                    dataMode: 'urlencoded',
                    dataDisabled: false,
                    data: [{ description: null, key: 'body_foo', value: 'body_bar' }],
                    pathVariables: { pv_foo: 'pv_bar' },
                    pathVariableData: [{ description: null, key: 'pv_foo', value: 'pv_bar' }],
                    responses: [],
                    currentHelper: 'bearerAuth',
                    helperAttributes: { id: 'bearer', token: 'random' },
                    auth: { type: 'bearer', bearer: [{ key: 'token', value: 'random', type: 'string' }] },
                    headers: 'header_foo: header_bar',
                    url: '?query_foo=query_bar',
                    rawModeData: null,
                    graphqlModeData: null,
                    headerData: [{ key: 'header_foo', value: 'header_bar', description: null }],
                    queryParams: [{ key: 'query_foo', value: 'query_bar', description: null }],
                    responses_order: []
                });
            });
        });

        it('should work correctly for raw bodies', function () {
            transformer.convertSingle({
                _postman_id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                request: {
                    body: {
                        disabled: false,
                        mode: 'raw',
                        raw: 'foobar'
                    },
                    url: 'https://postman-echo.com/get'
                }
            }, options, function (err, result) {
                expect(err).not.to.be.ok;

                expect(JSON.parse(JSON.stringify(result))).to.eql({
                    id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                    dataMode: 'raw',
                    data: null,
                    description: null,
                    pathVariableData: [],
                    headers: '',
                    headerData: [],
                    queryParams: [],
                    rawModeData: 'foobar',
                    graphqlModeData: null,
                    dataDisabled: false,
                    url: 'https://postman-echo.com/get',
                    responses_order: []
                });
            });
        });

        it('should work correctly for graphql bodies', function () {
            transformer.convertSingle({
                _postman_id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                request: {
                    body: {
                        disabled: false,
                        mode: 'graphql',
                        graphql: {
                            query: 'query Test { hello }',
                            operationName: 'Test',
                            variables: '{"foo":"bar"}'
                        }
                    },
                    url: 'https://postman-echo.com/get'
                }
            }, options, function (err, result) {
                expect(err).not.to.be.ok;

                expect(JSON.parse(JSON.stringify(result))).to.eql({
                    id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                    dataMode: 'graphql',
                    data: null,
                    description: null,
                    pathVariableData: [],
                    headers: '',
                    headerData: [],
                    queryParams: [],
                    rawModeData: null,
                    graphqlModeData: {
                        query: 'query Test { hello }',
                        operationName: 'Test',
                        variables: '{"foo":"bar"}'
                    },
                    dataDisabled: false,
                    url: 'https://postman-echo.com/get',
                    responses_order: []
                });
            });
        });
    });
});
