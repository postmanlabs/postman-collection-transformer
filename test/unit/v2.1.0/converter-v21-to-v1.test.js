/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var _ = require('lodash'),
    expect = require('chai').expect,
    transformer = require('../../../index');

/* global describe, it */
describe('v2.1.0 to v1.0.0', function () {
    var options = {
        inputVersion: '2.1.0',
        outputVersion: '1.0.0',
        retainIds: true
    };

    describe('api', function () {
        it('should have a .convertSingle() function', function () {
            expect(transformer.convertSingle).to.be.a('function');
            expect(transformer.convertSingle.length).to.equal(3);
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
                        data: [],
                        headerData: [],
                        rawModeData: '',
                        collectionId: 'C1',
                        name: 'request one'
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
                        data: [],
                        rawModeData: '',
                        url: '',
                        headerData: []
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
                        data: [],
                        rawModeData: '',
                        url: '',
                        headerData: []
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
                        data: [],
                        headerData: [],
                        id: 'R1',
                        rawModeData: '',
                        url: ''
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
    });

    describe('retainEmptyValues', function () {
        var options = {
            inputVersion: '2.1.0',
            outputVersion: '1.0.0',
            retainIds: true,
            retainEmptyValues: true
        };

        it('should nullify empty descriptions in when set to true', function () {
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
                        name: '',
                        pathVariables: { pv_foo: 'pv_bar' },
                        pathVariableData: [{ description: null, key: 'pv_foo', value: 'pv_bar' }],
                        rawModeData: '',
                        responses: [],
                        url: '?query_foo=query_bar',
                        data: [{ description: null, key: 'body_foo', value: 'body_bar' }],
                        headers: 'header_foo: header_bar',
                        currentHelper: 'bearerAuth',
                        helperAttributes: { id: 'bearer', token: 'random' },
                        auth: { type: 'bearer', bearer: [{ key: 'token', value: 'random', type: 'string' }] },
                        headerData: [{ key: 'header_foo', value: 'header_bar', description: null }],
                        queryParams: [{ key: 'query_foo', value: 'query_bar', description: null }]
                    }]
                });
            });
        });

        it('should nullify empty descriptions in requests when set to true', function () {
            transformer.convertSingle({
                _postman_id: '9d123ce5-314a-40cd-9852-6a8569513f4e',
                request: {
                    auth: { type: 'bearer', bearer: [{ key: 'token', value: 'random', type: 'string' }] },
                    description: null,
                    body: {
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
                    data: [{ description: null, key: 'body_foo', value: 'body_bar' }],
                    pathVariables: { pv_foo: 'pv_bar' },
                    pathVariableData: [{ description: null, key: 'pv_foo', value: 'pv_bar' }],
                    responses: [],
                    currentHelper: 'bearerAuth',
                    helperAttributes: { id: 'bearer', token: 'random' },
                    auth: { type: 'bearer', bearer: [{ key: 'token', value: 'random', type: 'string' }] },
                    headers: 'header_foo: header_bar',
                    url: '?query_foo=query_bar',
                    rawModeData: '',
                    headerData: [{ key: 'header_foo', value: 'header_bar', description: null }],
                    queryParams: [{ key: 'query_foo', value: 'query_bar', description: null }]
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
                    data: [{ description: null, key: 'body_foo', value: 'body_bar' }],
                    pathVariables: { pv_foo: 'pv_bar' },
                    pathVariableData: [{ description: null, key: 'pv_foo', value: 'pv_bar' }],
                    responses: [],
                    currentHelper: 'bearerAuth',
                    helperAttributes: { id: 'bearer', token: 'random' },
                    auth: { type: 'bearer', bearer: [{ key: 'token', value: 'random', type: 'string' }] },
                    headers: 'header_foo: header_bar',
                    url: '?query_foo=query_bar',
                    rawModeData: '',
                    headerData: [{ key: 'header_foo', value: 'header_bar', description: null }],
                    queryParams: [{ key: 'query_foo', value: 'query_bar', description: null }]
                });
            });
        });
    });
});
