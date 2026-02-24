/**
 * @fileoverview This test suite runs tests on the V1 to V2 converter.
 */

var _ = require('lodash'),
    expect = require('chai').expect,
    util = require('../../lib/util');

describe('util', function () {
    describe('handleVars', function () {
        it('should correctly fall back to defaults where applicable', function () {
            expect(util.handleVars({}, {
                retainIds: true,
                fallback: { values: [{ value: {}, disabled: 1 }] }
            })[0]).to.deep.include({
                disabled: true
            });
        });

        it('should handle legacy `text` type', function () {
            expect(util.handleVars({}, {
                retainIds: true,
                fallback: { values: [{ value: 'foo', type: 'text' }] }
            })[0]).to.deep.include({
                type: 'string'
            });
        });

        it('should retain id, if present on entity, and retainId is true', function () {
            const entity = {
                    variables: [
                        {
                            id: '1'
                        }
                    ]
                },
                options = {
                    noDefaults: true,
                    retainIds: true
                },
                processed = util.handleVars(entity, options);

            expect(processed[0]).to.have.property('id', '1');
        });

        it('should generate new id, if retainIds is false, and noDefaults is false', function () {
            const entity = {
                    variables: [
                        {
                            id: '1'
                        }
                    ]
                },
                options = {
                    noDefaults: false,
                    retainIds: false
                },
                processed = util.handleVars(entity, options);

            expect(processed[0].id).to.not.eql('1');
        });

        it('should generate new id, if absent on entity, if retainIds is true, and noDefaults is false', function () {
            const entity = {
                    variables: [
                        {}
                    ]
                },
                options = {
                    noDefaults: false,
                    retainIds: true
                },
                processed = util.handleVars(entity, options);

            expect(processed[0]).to.have.property('id');
        });

        it('should preserve secret property when set to true', function () {
            const entity = {
                    variables: [
                        { key: 'password', value: 'secret123', secret: true }
                    ]
                },
                processed = util.handleVars(entity, { noDefaults: true });

            expect(processed[0]).to.have.property('secret', true);
        });

        it('should not include secret property when not present', function () {
            const entity = {
                    variables: [
                        { key: 'name', value: 'John' }
                    ]
                },
                processed = util.handleVars(entity, { noDefaults: true });

            expect(processed[0]).to.not.have.property('secret');
        });

        it('should preserve source property when present', function () {
            const source = {
                    provider: 'postman',
                    postman: {
                        type: 'local',
                        secretId: '123',
                        vaultId: '456'
                    }
                },
                entity = {
                    variables: [
                        { key: 'apiKey', value: '', secret: true, source: source }
                    ]
                },
                processed = util.handleVars(entity, { noDefaults: true });

            expect(processed[0]).to.have.property('secret', true);
            expect(processed[0]).to.have.property('source');
            expect(processed[0].source).to.deep.eql(source);
        });

        it('should not include source property when not present', function () {
            const entity = {
                    variables: [
                        { key: 'name', value: 'John' }
                    ]
                },
                processed = util.handleVars(entity, { noDefaults: true });

            expect(processed[0]).to.not.have.property('source');
        });
    });

    describe('sanitizeAuthArray', function () {
        it('should correctly fall back to custom types when applicable', function () {
            expect(util.sanitizeAuthArray({
                auth: {
                    type: 'custom',
                    custom: [{ key: 'foo', value: {} }]
                }
            })).to.eql({
                type: 'custom',
                custom: [{ key: 'foo', value: {}, type: 'any' }]
            });
        });
    });

    describe('notLegacy', function () {
        it('should bail out for falsy entities', function () {
            expect(util.notLegacy).not.to.throw();
            expect(util.notLegacy()).to.eql(undefined);
        });

        it('should should return true for unknown cases', function () {
            expect(util.notLegacy).not.to.throw();
            expect(util.notLegacy({}, 'random')).to.eql(true);
        });
    });

    describe('auth mappers', function () {
        describe('legacy', function () {
            _.forEach(util.authMappersFromLegacy, function (func, auth) {
                it(`should handle falsy input correctly for ${auth}`, function () {
                    expect(func).to.not.throw();
                    expect(func()).to.equal(undefined);
                    expect(func({})).to.be.ok;
                });
            });
        });

        describe('contemporary', function () {
            _.forEach(util.authMappersFromCurrent, function (func, auth) {
                it(`should handle falsy input correctly for ${auth}`, function () {
                    expect(func).to.not.throw();
                    expect(func()).to.equal(undefined);
                    expect(func({})).to.be.ok;
                });
            });
        });
    });

    describe('addProtocolProfileBehavior', function () {
        it('should add protocolProfileBehavior property to the destination object', function () {
            var source = {
                    foo: 'bar',
                    protocolProfileBehavior: {
                        disableBodyPruning: true
                    }
                },
                destination = {};

            expect(util.addProtocolProfileBehavior(source, destination)).to.be.true;
            expect(destination).to.eql({
                protocolProfileBehavior: {
                    disableBodyPruning: true
                }
            });
        });

        it('should not add protocolProfileBehavior property for invalid values', function () {
            var source = {
                    protocolProfileBehavior: 'random'
                },
                destination = {};

            expect(util.addProtocolProfileBehavior(source, destination)).to.be.false;
            expect(destination).to.eql({});
        });

        it('should handle missing destination object correctly', function () {
            expect(util.addProtocolProfileBehavior({
                protocolProfileBehavior: {
                    disableBodyPruning: true
                }
            })).to.be.true;

            expect(util.addProtocolProfileBehavior({
                protocolProfileBehavior: 'random'
            })).to.be.false;

            expect(util.addProtocolProfileBehavior({
                protocolProfileBehavior: null
            })).to.be.false;

            expect(util.addProtocolProfileBehavior({
                foo: 'bar'
            })).to.be.false;

            expect(util.addProtocolProfileBehavior('random')).to.be.false;

            expect(util.addProtocolProfileBehavior()).to.be.false;
        });
    });
});
