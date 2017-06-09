/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var expect = require('expect.js'),
    transformer = require('../../index');

/* global describe, it */
describe('url param handling', function () {
    describe('v1.0.0 to v2.0.0', function () {
        it('should work as intended', function (done) {
            var fixture = {
                    id: 'c95c8ffd-1fc0-7c46-0522-979e99b08ba0',
                    headers: '',
                    headerData: [],
                    url: 'postman-echo.com/get?user_email=fred@gmail.com',
                    queryParams: [
                        {
                            key: 'user_email',
                            value: 'fred@gmail.com',
                            equals: true,
                            description: '',
                            enabled: true
                        }
                    ],
                    pathVariables: {},
                    pathVariableData: [],
                    preRequestScript: null,
                    method: 'GET',
                    collectionId: 'b332cead-12f6-ca88-b706-2fdd3377f88d',
                    data: null,
                    dataMode: 'params',
                    name: 'postman-echo.com/get?user_email=fred@gmail.com',
                    description: '',
                    descriptionFormat: 'html',
                    time: 1496989401291,
                    version: 2,
                    responses: [],
                    tests: '',
                    currentHelper: 'normal',
                    helperAttributes: {}
                },
                options = {
                    inputVersion: '1.0.0',
                    outputVersion: '2.0.0',
                    retainIds: true
                };

            transformer.convertSingle(fixture, options, function (err, converted) {
                expect(err).to.not.be.ok();

                // remove `undefined` properties for testing
                converted = JSON.parse(JSON.stringify(converted));

                expect(converted.request.url).to.eql({
                    raw: 'postman-echo.com/get?user_email=fred@gmail.com',
                    host: ['postman-echo', 'com'],
                    path: ['get'],
                    query: [{
                        key: 'user_email',
                        value: 'fred@gmail.com',
                        equals: true,
                        description: ''
                    }],
                    variable: []
                });
                done();
            });
        });
    });
});
