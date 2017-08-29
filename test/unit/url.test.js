/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var expect = require('chai').expect,
    url = require('../../lib/url');

/* global describe, it */
describe('url', function () {
    describe('parsing', function () {
        it('should handle `@` character', function (done) {
            var fixture = 'postman-echo.com/get?user_email=fred@gmail.com',
                parsed;

            parsed = JSON.parse(JSON.stringify(url.parse(fixture)));

            expect(parsed).to.eql({
                raw: 'postman-echo.com/get?user_email=fred@gmail.com',
                host: ['postman-echo', 'com'],
                path: ['get'],
                query: [{
                    key: 'user_email',
                    value: 'fred@gmail.com'
                }]
            });
            done();
        });
    });

    describe('unparsing', function () {
        it('should handle the `@` character', function (done) {
            var fixture = {
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
            };

            expect(url.unparse(fixture)).to.eql('postman-echo.com/get?user_email=fred@gmail.com');
            done();
        });
    });
});
