module.exports = {
    v1: {
        id: '371e9fa3-97d3-ca11-07c0-836a72a325c2',
        name: 'nested-entities',
        description: 'A simple collection to elucidate nested auth helpers, variables, and scripts',
        order: [
            'f619a417-7ab7-d28b-e75e-f110b5862eb6'
        ],
        folders: [
            {
                name: 'F1',
                order: [
                    'a742022f-ff24-18c5-6e8b-0c4e7d7aee08'
                ],
                preRequestScript: 'console.log("Folder level pre request script");',
                tests: 'console.log("Folder level test script");',
                currentHelper: 'digestAuth',
                helperAttributes: {
                    id: 'digest',
                    algorithm: 'MD5',
                    username: 'postman',
                    realm: '{{echo_digest_realm}}',
                    password: 'password',
                    nonce: '{{echo_digest_nonce}}',
                    nonceCount: '',
                    clientNonce: '',
                    opaque: '',
                    qop: ''
                },
                folders_order: [],
                id: '5be148b3-0081-5a59-5273-9014161b0292'
            }
        ],
        folders_order: [
            '5be148b3-0081-5a59-5273-9014161b0292'
        ],
        preRequestScript: 'console.log("Collection level pre request script");',
        tests: 'console.log("Collection level test script");',
        currentHelper: 'awsSigV4',
        helperAttributes: {
            id: 'awsSigV4',
            accessKey: '{{id}}',
            secretKey: '{{key}}',
            region: 'us-east-1',
            service: 'iam',
            sessionToken: ''
        },
        requests: [
            {
                id: 'a742022f-ff24-18c5-6e8b-0c4e7d7aee08',
                headers: '',
                headerData: [],
                url: 'https://postman-echo.com/get',
                queryParams: [],
                preRequestScript: 'console.log("Request level pre request script");',
                pathVariableData: [],
                rawModeData: '',
                method: 'GET',
                data: [],
                dataMode: 'raw',
                tests: 'console.log("Request level test script");',
                currentHelper: 'basicAuth',
                helperAttributes: {
                    id: 'basic',
                    username: '{{username}}',
                    password: '{{token}}'
                },
                name: 'Basic',
                collectionId: '371e9fa3-97d3-ca11-07c0-836a72a325c2',
                responses: []
            },
            {
                id: 'f619a417-7ab7-d28b-e75e-f110b5862eb6',
                headers: '',
                headerData: [],
                url: 'https://postman-echo.com/get',
                queryParams: [],
                preRequestScript: 'console.log("Request level pre request script");',
                pathVariableData: [],
                method: 'GET',
                data: [],
                dataMode: 'raw',
                rawModeData: '',
                tests: 'console.log("Request level test script");',
                currentHelper: 'oAuth1',
                helperAttributes: {
                    id: 'oAuth1',
                    consumerKey: 'RKCGzna7bv9YD57c',
                    consumerSecret: 'D+EdQ-gs$-%@2Nu7',
                    token: '',
                    tokenSecret: '',
                    signatureMethod: 'HMAC-SHA1',
                    timestamp: '1500452534',
                    nonce: 'S0kXloMHurS',
                    version: '1.0',
                    realm: ''
                },
                name: 'OAuth1',
                collectionId: '371e9fa3-97d3-ca11-07c0-836a72a325c2',
                responses: []
            }
        ]
    },
    v2: {
        variables: [],
        info: {
            name: 'nested-entities',
            _postman_id: '371e9fa3-97d3-ca11-07c0-836a72a325c2',
            description: 'A simple collection to elucidate nested auth helpers, variables, and scripts',
            schema: 'https://schema.getpostman.com/json/collection/v2.0.0/collection.json'
        },
        auth: {
            type: 'awsv4',
            awsv4: {
                accessKey: '{{id}}',
                id: 'awsSigV4',
                region: 'us-east-1',
                secretKey: '{{key}}',
                service: 'iam',
                sessionToken: ''
            }
        },
        event: [
            {
                listen: 'test',
                script: {
                    type: 'text/javascript',
                    exec: [
                        'console.log("Collection level test script");'
                    ]
                }
            },
            {
                listen: 'prerequest',
                script: {
                    type: 'text/javascript',
                    exec: [
                        'console.log("Collection level pre request script");'
                    ]
                }
            }
        ],
        item: [
            {
                _postman_id: '5be148b3-0081-5a59-5273-9014161b0292',
                name: 'F1',
                auth: {
                    type: 'digest',
                    digest: {
                        algorithm: 'MD5',
                        username: 'postman',
                        realm: '{{echo_digest_realm}}',
                        password: 'password',
                        nonce: '{{echo_digest_nonce}}',
                        nonceCount: '',
                        clientNonce: '',
                        opaque: '',
                        qop: ''
                    }
                },
                event: [
                    {
                        listen: 'test',
                        script: {
                            type: 'text/javascript',
                            exec: [
                                'console.log("Folder level test script");'
                            ]
                        }
                    },
                    {
                        listen: 'prerequest',
                        script: {
                            type: 'text/javascript',
                            exec: [
                                'console.log("Folder level pre request script");'
                            ]
                        }
                    }
                ],
                item: [
                    {
                        _postman_id: 'a742022f-ff24-18c5-6e8b-0c4e7d7aee08',
                        name: 'Basic',
                        event: [
                            {
                                listen: 'test',
                                script: {
                                    type: 'text/javascript',
                                    exec: [
                                        'console.log("Request level test script");'
                                    ]
                                }
                            },
                            {
                                listen: 'prerequest',
                                script: {
                                    type: 'text/javascript',
                                    exec: [
                                        'console.log("Request level pre request script");'
                                    ]
                                }
                            }
                        ],
                        request: {
                            auth: {
                                type: 'basic',
                                basic: {
                                    username: '{{username}}',
                                    showPassword: false,
                                    password: '{{token}}'
                                }
                            },
                            method: 'GET',
                            header: [],
                            body: {
                                mode: 'raw',
                                raw: ''
                            },
                            url: 'https://postman-echo.com/get'
                        },
                        response: []
                    }
                ]
            },
            {
                _postman_id: 'f619a417-7ab7-d28b-e75e-f110b5862eb6',
                name: 'OAuth1',
                event: [
                    {
                        listen: 'test',
                        script: {
                            type: 'text/javascript',
                            exec: [
                                'console.log("Request level test script");'
                            ]
                        }
                    },
                    {
                        listen: 'prerequest',
                        script: {
                            type: 'text/javascript',
                            exec: [
                                'console.log("Request level pre request script");'
                            ]
                        }
                    }
                ],
                request: {
                    auth: {
                        type: 'oauth1',
                        oauth1: {
                            consumerKey: 'RKCGzna7bv9YD57c',
                            consumerSecret: 'D+EdQ-gs$-%@2Nu7',
                            token: '',
                            tokenSecret: '',
                            signatureMethod: 'HMAC-SHA1',
                            timestamp: '1500452534',
                            nonce: 'S0kXloMHurS',
                            version: '1.0',
                            realm: ''
                        }
                    },
                    method: 'GET',
                    header: [],
                    body: {
                        mode: 'raw',
                        raw: ''
                    },
                    url: 'https://postman-echo.com/get'
                },
                response: []
            }
        ]
    },
    v21: {
        info: {
            name: 'nested-entities',
            _postman_id: '371e9fa3-97d3-ca11-07c0-836a72a325c2',
            description: 'A simple collection to elucidate nested auth helpers, variables, and scripts',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        auth: {
            type: 'awsv4',
            awsv4: [
                {
                    key: 'id',
                    value: 'awsSigV4',
                    type: 'string'
                },
                {
                    key: 'accessKey',
                    value: '{{id}}',
                    type: 'string'
                },
                {
                    key: 'secretKey',
                    value: '{{key}}',
                    type: 'string'
                },
                {
                    key: 'region',
                    value: 'us-east-1',
                    type: 'string'
                },
                {
                    key: 'service',
                    value: 'iam',
                    type: 'string'
                },
                {
                    key: 'sessionToken',
                    value: '',
                    type: 'string'
                }
            ]
        },
        event: [
            {
                listen: 'test',
                script: {
                    type: 'text/javascript',
                    exec: [
                        'console.log("Collection level test script");'
                    ]
                }
            },
            {
                listen: 'prerequest',
                script: {
                    type: 'text/javascript',
                    exec: [
                        'console.log("Collection level pre request script");'
                    ]
                }
            }
        ],
        item: [
            {
                _postman_id: '5be148b3-0081-5a59-5273-9014161b0292',
                name: 'F1',
                auth: {
                    type: 'digest',
                    digest: [
                        {
                            key: 'algorithm',
                            value: 'MD5',
                            type: 'string'
                        },
                        {
                            key: 'username',
                            value: 'postman',
                            type: 'string'
                        },
                        {
                            key: 'realm',
                            value: '{{echo_digest_realm}}',
                            type: 'string'
                        },
                        {
                            key: 'password',
                            value: 'password',
                            type: 'string'
                        },
                        {
                            key: 'nonce',
                            value: '{{echo_digest_nonce}}',
                            type: 'string'
                        },
                        {
                            key: 'nonceCount',
                            value: '',
                            type: 'string'
                        },
                        {
                            key: 'clientNonce',
                            value: '',
                            type: 'string'
                        },
                        {
                            key: 'opaque',
                            value: '',
                            type: 'string'
                        },
                        {
                            key: 'qop',
                            value: '',
                            type: 'string'
                        },
                        {
                            key: 'disableRetryRequest',
                            type: 'any'
                        }
                    ]
                },
                event: [
                    {
                        listen: 'test',
                        script: {
                            type: 'text/javascript',
                            exec: [
                                'console.log("Folder level test script");'
                            ]
                        }
                    },
                    {
                        listen: 'prerequest',
                        script: {
                            type: 'text/javascript',
                            exec: [
                                'console.log("Folder level pre request script");'
                            ]
                        }
                    }
                ],
                item: [
                    {
                        _postman_id: 'a742022f-ff24-18c5-6e8b-0c4e7d7aee08',
                        name: 'Basic',
                        event: [
                            {
                                listen: 'test',
                                script: {
                                    type: 'text/javascript',
                                    exec: [
                                        'console.log("Request level test script");'
                                    ]
                                }
                            },
                            {
                                listen: 'prerequest',
                                script: {
                                    type: 'text/javascript',
                                    exec: [
                                        'console.log("Request level pre request script");'
                                    ]
                                }
                            }
                        ],
                        request: {
                            auth: {
                                type: 'basic',
                                basic: [
                                    {
                                        key: 'username',
                                        value: '{{username}}',
                                        type: 'string'
                                    },
                                    {
                                        key: 'password',
                                        value: '{{token}}',
                                        type: 'string'
                                    },
                                    {
                                        key: 'saveHelperData',
                                        type: 'any'
                                    },
                                    {
                                        key: 'showPassword',
                                        type: 'boolean',
                                        value: false
                                    }
                                ]
                            },
                            method: 'GET',
                            header: [],
                            body: {
                                mode: 'raw',
                                raw: ''
                            },
                            url: {
                                raw: 'https://postman-echo.com/get',
                                protocol: 'https',
                                host: ['postman-echo', 'com'],
                                path: ['get']
                            }
                        },
                        response: []
                    }
                ]
            },
            {
                _postman_id: 'f619a417-7ab7-d28b-e75e-f110b5862eb6',
                name: 'OAuth1',
                event: [
                    {
                        listen: 'test',
                        script: {
                            type: 'text/javascript',
                            exec: [
                                'console.log("Request level test script");'
                            ]
                        }
                    },
                    {
                        listen: 'prerequest',
                        script: {
                            type: 'text/javascript',
                            exec: [
                                'console.log("Request level pre request script");'
                            ]
                        }
                    }
                ],
                request: {
                    auth: {
                        type: 'oauth1',
                        oauth1: [
                            {
                                key: 'consumerKey',
                                value: 'RKCGzna7bv9YD57c',
                                type: 'string'
                            },
                            {
                                key: 'consumerSecret',
                                value: 'D+EdQ-gs$-%@2Nu7',
                                type: 'string'
                            },
                            {
                                key: 'token',
                                value: '',
                                type: 'string'
                            },
                            {
                                key: 'tokenSecret',
                                value: '',
                                type: 'string'
                            },
                            {
                                key: 'signatureMethod',
                                value: 'HMAC-SHA1',
                                type: 'string'
                            },
                            {
                                key: 'timestamp',
                                value: '1500452534',
                                type: 'string'
                            },
                            {
                                key: 'nonce',
                                value: 'S0kXloMHurS',
                                type: 'string'
                            },
                            {
                                key: 'version',
                                value: '1.0',
                                type: 'string'
                            },
                            {
                                key: 'realm',
                                value: '',
                                type: 'string'
                            },
                            {
                                key: 'addParamsToHeader',
                                type: 'any'
                            },
                            {
                                key: 'autoAddParam',
                                type: 'any'
                            },
                            {
                                key: 'addEmptyParamsToSign',
                                type: 'any'
                            }
                        ]
                    },
                    method: 'GET',
                    header: [],
                    body: {
                        mode: 'raw',
                        raw: ''
                    },
                    url: {
                        raw: 'https://postman-echo.com/get',
                        protocol: 'https',
                        host: ['postman-echo', 'com'],
                        path: ['get']
                    }
                },
                response: []
            }
        ]
    }
};
