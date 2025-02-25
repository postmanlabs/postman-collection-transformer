var expect = require('chai').expect,
    transformer = require('../../index');

// Refer: https://github.com/postmanlabs/postman-app-support/issues/2906
describe('v1.0.0 to v2.1.0 conversion', function () {
    it('should not include entity IDs when retainIds is not set', function (done) {
        transformer.convert({
            id: 'C1',
            name: 'collection',
            requests: [{
                id: 'R1',
                name: 'request one',
                pathVariableData: [{
                    id: 'PV1',
                    key: 'foo',
                    value: 'bar'
                }],
                responses: [{
                    id: 'RR1'
                }],
                events: [{
                    id: 'RE1',
                    listen: 'prerequest',
                    script: {
                        id: 'RS1',
                        type: 'text/javascript',
                        exec: ['console.log("prerequest");']
                    }
                }, {
                    id: 'RE2',
                    listen: 'test',
                    script: {
                        id: 'RS2',
                        type: 'text/javascript',
                        exec: ['console.log("test");']
                    }
                }]
            }],
            folders: [{
                id: 'F1',
                order: ['R1'],
                name: 'folder one'
            }],
            folders_order: ['F1'],
            events: [{
                id: 'E1',
                listen: 'prerequest',
                script: {
                    id: 'S1',
                    type: 'text/javascript',
                    exec: ['console.log("prerequest");']
                }
            }, {
                id: 'E2',
                listen: 'test',
                script: {
                    id: 'S2',
                    type: 'text/javascript',
                    exec: ['console.log("test");']
                }
            }],
            variables: [{
                id: 'V1',
                key: 'foo',
                value: 'bar'
            }]
        }, {
            inputVersion: '1.0.0',
            outputVersion: '2.1.0'
        }, function (err, converted) {
            expect(err).to.not.be.ok;

            // remove `undefined` properties for testing
            expect(JSON.parse(JSON.stringify(converted))).to.eql({
                info: {
                    _postman_id: 'C1',
                    name: 'collection',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                },
                item: [{
                    name: 'folder one',
                    item: [{
                        name: 'request one',
                        request: {
                            header: [],
                            url: {
                                raw: '',
                                variable: [{
                                    key: 'foo',
                                    value: 'bar'
                                }]
                            }
                        },
                        response: [{
                            name: 'response',
                            cookie: []
                        }],
                        event: [{
                            listen: 'prerequest',
                            script: {
                                type: 'text/javascript',
                                exec: ['console.log("prerequest");']
                            }
                        },
                        {
                            listen: 'test',
                            script: {
                                type: 'text/javascript',
                                exec: ['console.log("test");']
                            }
                        }]
                    }]
                }],
                event: [{
                    listen: 'prerequest',
                    script: {
                        type: 'text/javascript',
                        exec: ['console.log("prerequest");']
                    }
                },
                {
                    listen: 'test',
                    script: {
                        type: 'text/javascript',
                        exec: ['console.log("test");']
                    }
                }],
                variable: [{
                    key: 'foo',
                    value: 'bar'
                }]
            });
            done();
        });
    });

    it('should include entity IDs when retainIds is set', function (done) {
        transformer.convert({
            id: 'C1',
            name: 'collection',
            requests: [{
                id: 'R1',
                name: 'request one',
                pathVariableData: [{
                    id: 'PV1',
                    key: 'foo',
                    value: 'bar'
                }],
                responses: [{
                    id: 'RR1'
                }],
                events: [{
                    id: 'RE1',
                    listen: 'prerequest',
                    script: {
                        id: 'RS1',
                        type: 'text/javascript',
                        exec: ['console.log("prerequest");']
                    }
                }, {
                    id: 'RE2',
                    listen: 'test',
                    script: {
                        id: 'RS2',
                        type: 'text/javascript',
                        exec: ['console.log("test");']
                    }
                }]
            }],
            folders: [{
                id: 'F1',
                order: ['R1'],
                name: 'folder one'
            }],
            folders_order: ['F1'],
            events: [{
                id: 'E1',
                listen: 'prerequest',
                script: {
                    id: 'S1',
                    type: 'text/javascript',
                    exec: ['console.log("prerequest");']
                }
            }, {
                id: 'E2',
                listen: 'test',
                script: {
                    id: 'S2',
                    type: 'text/javascript',
                    exec: ['console.log("test");']
                }
            }],
            variables: [{
                id: 'V1',
                key: 'foo',
                value: 'bar'
            }]
        }, {
            inputVersion: '1.0.0',
            outputVersion: '2.1.0',
            retainIds: true
        }, function (err, converted) {
            expect(err).to.not.be.ok;

            // remove `undefined` properties for testing
            expect(JSON.parse(JSON.stringify(converted))).to.eql({
                info: {
                    _postman_id: 'C1',
                    name: 'collection',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
                },
                item: [{
                    id: 'F1',
                    name: 'folder one',
                    item: [{
                        id: 'R1',
                        name: 'request one',
                        request: {
                            header: [],
                            url: {
                                raw: '',
                                variable: [{
                                    id: 'PV1',
                                    key: 'foo',
                                    value: 'bar'
                                }]
                            }
                        },
                        response: [{
                            id: 'RR1',
                            name: 'response',
                            cookie: []
                        }],
                        event: [{
                            id: 'RE1',
                            listen: 'prerequest',
                            script: {
                                id: 'RS1',
                                type: 'text/javascript',
                                exec: ['console.log("prerequest");']
                            }
                        },
                        {
                            id: 'RE2',
                            listen: 'test',
                            script: {
                                id: 'RS2',
                                type: 'text/javascript',
                                exec: ['console.log("test");']
                            }
                        }]
                    }]
                }],
                event: [{
                    id: 'E1',
                    listen: 'prerequest',
                    script: {
                        id: 'S1',
                        type: 'text/javascript',
                        exec: ['console.log("prerequest");']
                    }
                },
                {
                    id: 'E2',
                    listen: 'test',
                    script: {
                        id: 'S2',
                        type: 'text/javascript',
                        exec: ['console.log("test");']
                    }
                }],
                variable: [{
                    id: 'V1',
                    key: 'foo',
                    value: 'bar'
                }]
            });
            done();
        });
    });
});
