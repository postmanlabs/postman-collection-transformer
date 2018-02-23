/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var _ = require('lodash'),
    expect = require('chai').expect,
    util = require('../../lib/util');

/* global describe, it */
describe('util', function () {
    describe('auth mappers', function () {
        describe('legacy', function () {
            _.forEach(util.authMappersFromLegacy, function (func, auth) {
                it(`should handle falsy input correctly for ${auth}`, function () {
                    expect(func).to.not.throw();
                    expect(func()).to.equal(undefined);
                });
            });
        });

        describe('contemporary', function () {
            _.forEach(util.authMappersFromCurrent, function (func, auth) {
                it(`should handle falsy input correctly for ${auth}`, function () {
                    expect(func).to.not.throw();
                    expect(func()).to.equal(undefined);
                });
            });
        });
    });
});
