module.exports = {
    v1: {
        id: 'd497d10e-e280-8c83-709a-a4d4ea12ad14',
        name: 'AuthTest',
        description: 'Sample auth tests',
        order: [
            '951fc3e8-c6b6-5c19-9f69-4e7499b3127f',
            '951fc3e8-c6b6-5c19-9f69-4e7499b3127g'
        ],
        folders: [],
        folders_order: [],
        requests: [
            {
                id: '951fc3e8-c6b6-5c19-9f69-4e7499b3127f',
                headers: 'Authorization: Bearer wkjehbxoqnunc2k3',
                url: 'http://echo.getpostman.com/auth/bearer',
                preRequestScript: '',
                method: 'GET',
                data: [],
                queryParams: [],
                rawModeData: '',
                headerData: [{
                    key: 'Authorization',
                    value: 'Bearer wkjehbxoqnunc2k3'
                }],
                dataMode: 'raw',
                pathVariableData: [],
                // eslint-disable-next-line max-len
                tests: 'var response = JSON.parse(responseBody); tests["Bearer auth should pass"] = response.status === "pass";',
                currentHelper: 'bearerAuth',
                helperAttributes: {
                    id: 'bearer',
                    token: 'wkjehbxoqnunc2k3'
                },
                name: 'test bearer auth success',
                collectionId: 'd497d10e-e280-8c83-709a-a4d4ea12ad14',
                responses: []
            },
            {
                id: '951fc3e8-c6b6-5c19-9f69-4e7499b3127g',
                // eslint-disable-next-line max-len
                headers: 'Authorization: NTLM TlRMTVNTUAADAAAAGAAYAFYAAAAYABgAbgAAAAAAAABIAAAADgAOAEgAAAAAAAAAVgAAAAAAAACGAAAABYKIogUBKAoAAAAPcABvAHMAdABtAGEAbgCDJfCgEQC+3wAAAAAAAAAAAAAAAAAAAAB6O2T1blvWpb/pqHtSdqcZ/A34nPBZe20=',
                url: 'http://echo.getpostman.com/auth/ntlm',
                preRequestScript: '',
                method: 'GET',
                data: [],
                queryParams: [],
                rawModeData: '',
                headerData: [{
                    key: 'Authorization',
                    // eslint-disable-next-line max-len
                    value: 'NTLM TlRMTVNTUAADAAAAGAAYAFYAAAAYABgAbgAAAAAAAABIAAAADgAOAEgAAAAAAAAAVgAAAAAAAACGAAAABYKIogUBKAoAAAAPcABvAHMAdABtAGEAbgCDJfCgEQC+3wAAAAAAAAAAAAAAAAAAAAB6O2T1blvWpb/pqHtSdqcZ/A34nPBZe20='
                }],
                dataMode: 'raw',
                pathVariableData: [],
                // eslint-disable-next-line max-len
                tests: 'var response = JSON.parse(responseBody); tests["NTLM auth should pass"] = response.status === "pass";',
                currentHelper: 'ntlmAuth',
                helperAttributes: {
                    id: 'ntlm',
                    username: 'foo',
                    password: 'password',
                    domain: 'domain',
                    workstation: 'workstation',
                    disableRetryRequest: false
                },
                name: 'test ntlm auth success',
                collectionId: 'd497d10e-e280-8c83-709a-a4d4ea12ad14',
                responses: []
            }
        ]
    },
    v2: {
        variables: [],
        info: {
            name: 'AuthTest',
            _postman_id: 'd497d10e-e280-8c83-709a-a4d4ea12ad14',
            description: 'Sample auth tests',
            schema: 'https://schema.getpostman.com/json/collection/v2.0.0/collection.json'
        },
        item: [
            {
                _postman_id: '951fc3e8-c6b6-5c19-9f69-4e7499b3127f',
                name: 'test bearer auth success',
                event: [
                    {
                        listen: 'test',
                        script: {
                            type: 'text/javascript',
                            exec: [
                                // eslint-disable-next-line max-len
                                'var response = JSON.parse(responseBody); tests["Bearer auth should pass"] = response.status === "pass";'
                            ]
                        }
                    }
                ],
                request: {
                    auth: {
                        type: 'bearer',
                        bearer: {
                            token: 'wkjehbxoqnunc2k3'
                        }
                    },
                    url: 'http://echo.getpostman.com/auth/bearer',
                    method: 'GET',
                    header: [
                        {
                            key: 'Authorization',
                            value: 'Bearer wkjehbxoqnunc2k3'
                        }
                    ],
                    body: {
                        mode: 'raw',
                        raw: ''
                    }
                },
                response: []
            },
            {
                _postman_id: '951fc3e8-c6b6-5c19-9f69-4e7499b3127g',
                name: 'test ntlm auth success',
                event: [
                    {
                        listen: 'test',
                        script: {
                            type: 'text/javascript',
                            exec: [
                                // eslint-disable-next-line max-len
                                'var response = JSON.parse(responseBody); tests["NTLM auth should pass"] = response.status === "pass";'
                            ]
                        }
                    }
                ],
                request: {
                    auth: {
                        type: 'ntlm',
                        ntlm: {
                            username: 'foo',
                            password: 'password',
                            domain: 'domain',
                            workstation: 'workstation',
                            disableRetryRequest: false
                        }
                    },
                    url: 'http://echo.getpostman.com/auth/ntlm',
                    method: 'GET',
                    header: [
                        {
                            key: 'Authorization',
                            // eslint-disable-next-line max-len
                            value: 'NTLM TlRMTVNTUAADAAAAGAAYAFYAAAAYABgAbgAAAAAAAABIAAAADgAOAEgAAAAAAAAAVgAAAAAAAACGAAAABYKIogUBKAoAAAAPcABvAHMAdABtAGEAbgCDJfCgEQC+3wAAAAAAAAAAAAAAAAAAAAB6O2T1blvWpb/pqHtSdqcZ/A34nPBZe20='
                        }
                    ],
                    body: {
                        mode: 'raw',
                        raw: ''
                    }
                },
                response: []
            }
        ]
    },
    v21: {
        info: {
            name: 'AuthTest',
            _postman_id: 'd497d10e-e280-8c83-709a-a4d4ea12ad14',
            description: 'Sample auth tests',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: [
            {
                _postman_id: '951fc3e8-c6b6-5c19-9f69-4e7499b3127f',
                name: 'test bearer auth success',
                event: [
                    {
                        listen: 'test',
                        script: {
                            type: 'text/javascript',
                            exec: [
                                // eslint-disable-next-line max-len
                                'var response = JSON.parse(responseBody); tests["Bearer auth should pass"] = response.status === "pass";'
                            ]
                        }
                    }
                ],
                request: {
                    auth: {
                        type: 'bearer',
                        bearer: [
                            {
                                key: 'token',
                                value: 'wkjehbxoqnunc2k3',
                                type: 'string'
                            }
                        ]
                    },
                    url: {
                        raw: 'http://echo.getpostman.com/auth/bearer',
                        protocol: 'http',
                        host: ['echo', 'getpostman', 'com'],
                        path: ['auth', 'bearer']
                    },
                    method: 'GET',
                    header: [
                        {
                            key: 'Authorization',
                            value: 'Bearer wkjehbxoqnunc2k3'
                        }
                    ],
                    body: {
                        mode: 'raw',
                        raw: ''
                    }
                },
                response: []
            },
            {
                _postman_id: '951fc3e8-c6b6-5c19-9f69-4e7499b3127g',
                name: 'test ntlm auth success',
                event: [
                    {
                        listen: 'test',
                        script: {
                            type: 'text/javascript',
                            exec: [
                                // eslint-disable-next-line max-len
                                'var response = JSON.parse(responseBody); tests["NTLM auth should pass"] = response.status === "pass";'
                            ]
                        }
                    }
                ],
                request: {
                    auth: {
                        type: 'ntlm',
                        ntlm: [
                            {
                                key: 'username',
                                value: 'foo',
                                type: 'string'
                            },
                            {
                                key: 'password',
                                value: 'password',
                                type: 'string'
                            },
                            {
                                key: 'domain',
                                value: 'domain',
                                type: 'string'
                            },
                            {
                                key: 'workstation',
                                value: 'workstation',
                                type: 'string'
                            },
                            {
                                key: 'disableRetryRequest',
                                value: false,
                                type: 'boolean'
                            }
                        ]
                    },
                    url: {
                        raw: 'http://echo.getpostman.com/auth/ntlm',
                        protocol: 'http',
                        host: ['echo', 'getpostman', 'com'],
                        path: ['auth', 'ntlm']
                    },
                    method: 'GET',
                    header: [
                        {
                            key: 'Authorization',
                            // eslint-disable-next-line max-len
                            value: 'NTLM TlRMTVNTUAADAAAAGAAYAFYAAAAYABgAbgAAAAAAAABIAAAADgAOAEgAAAAAAAAAVgAAAAAAAACGAAAABYKIogUBKAoAAAAPcABvAHMAdABtAGEAbgCDJfCgEQC+3wAAAAAAAAAAAAAAAAAAAAB6O2T1blvWpb/pqHtSdqcZ/A34nPBZe20='
                        }
                    ],
                    body: {
                        mode: 'raw',
                        raw: ''
                    }
                },
                response: []
            }
        ]
    }
};
