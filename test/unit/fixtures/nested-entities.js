module.exports = {
    v1: {
        id: '371e9fa3-97d3-ca11-07c0-836a72a325c2',
        name: 'nested-entities',
        description: 'A simple collection to elucidate nested auth helpers, variables, and scripts',
        order: [
            'f619a417-7ab7-d28b-e75e-f110b5862eb6'
        ],
        variables: [{
            id: 'collection',
            key: 'collection',
            value: 'variable',
            type: 'string',
            description: 'This is a collection level variable'
        }],
        folders: [
            {
                name: 'F1',
                order: [
                    'a742022f-ff24-18c5-6e8b-0c4e7d7aee08'
                ],
                variables: [{
                    id: 'folder',
                    key: 'folder',
                    value: 'variable',
                    type: 'string',
                    description: 'This is a folder level variable'
                }],
                events: [{
                    id: '76da1ffd-ed85-4219-a01c-cc014b4c69be',
                    listen: 'prerequest',
                    script: {
                        id: '2201375d-5c94-4328-a546-fa0870fc491f',
                        type: 'text/javascript',
                        exec: ['console.log("Folder level pre request script");']
                    }
                }, {
                    id: 'd3652aab-b884-47cb-877b-2165f722ecdc',
                    listen: 'test',
                    script: {
                        id: '4706619b-0fea-4d61-8257-6a54e35b2852',
                        type: 'text/javascript',
                        exec: ['console.log("Folder level test script");']
                    }
                }],
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
                        }
                    ]
                },
                folders_order: [],
                id: '5be148b3-0081-5a59-5273-9014161b0292'
            }
        ],
        folders_order: [
            '5be148b3-0081-5a59-5273-9014161b0292'
        ],
        events: [
            {
                id: 'da38471e-5f93-4e94-90d2-e912bcd131cb',
                listen: 'prerequest',
                script: {
                    id: 'da5d1694-6dbf-4f0f-a2ab-6dbbe84b325b',
                    type: 'text/javascript',
                    exec: [
                        'console.log("Collection level pre request script");'
                    ]
                }
            },
            {
                id: '768ce224-699f-46cf-86e8-2c864a5ca19e',
                listen: 'test',
                script: {
                    id: 'c90c18e9-7c8c-40f7-b396-08046545e346',
                    type: 'text/javascript',
                    exec: [
                        'console.log("Collection level test script");'
                    ]
                }
            }
        ],
        auth: {
            type: 'awsv4',
            awsv4: [
                {
                    key: 'accessKey',
                    value: '{{id}}',
                    type: 'string'
                },
                {
                    key: 'id',
                    value: 'awsSigV4',
                    type: 'string'
                },
                {
                    key: 'region',
                    value: 'us-east-1',
                    type: 'string'
                },
                {
                    key: 'secretKey',
                    value: '{{key}}',
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
        requests: [
            {
                id: 'a742022f-ff24-18c5-6e8b-0c4e7d7aee08',
                variables: [{
                    id: 'request',
                    key: 'request',
                    value: 'variable',
                    type: 'string',
                    description: 'This is a request level variable'
                }],
                headers: '',
                headerData: [],
                url: 'https://postman-echo.com/get',
                queryParams: [],
                events: [
                    {
                        id: 'adeb27f6-724d-4e54-9d99-6a8b282032d8',
                        listen: 'prerequest',
                        script: {
                            id: '076be57a-6f25-4058-865f-57b059c203ca',
                            type: 'text/javascript',
                            exec: [
                                'console.log("Request level pre request script");'
                            ]
                        }
                    },
                    {
                        id: 'b0acd08b-a88e-4570-8085-49edaf885fe1',
                        listen: 'test',
                        script: {
                            id: '8f25e55f-ee00-4453-87e2-4ed3297d9388',
                            type: 'text/javascript',
                            exec: [
                                'console.log("Request level test script");'
                            ]
                        }
                    }
                ],
                preRequestScript: 'console.log("Request level pre request script");',
                pathVariableData: [],
                rawModeData: '',
                method: 'GET',
                data: [],
                dataMode: 'raw',
                tests: 'console.log("Request level test script");',
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
                            value: true,
                            type: 'boolean'
                        },
                        {
                            key: 'showPassword',
                            value: false,
                            type: 'boolean'
                        }
                    ]
                },
                currentHelper: 'basicAuth',
                helperAttributes: {
                    id: 'basic',
                    username: '{{username}}',
                    saveToRequest: true,
                    password: '{{token}}'
                },
                name: 'Basic',
                collectionId: '371e9fa3-97d3-ca11-07c0-836a72a325c2',
                responses: []
            },
            {
                id: 'f619a417-7ab7-d28b-e75e-f110b5862eb6',
                variables: [{
                    id: 'request',
                    key: 'request',
                    value: 'variable',
                    type: 'string',
                    description: 'This is a request level variable'
                }],
                headers: '',
                headerData: [],
                url: 'https://postman-echo.com/get',
                queryParams: [],
                events: [
                    {
                        id: '0b080d65-32f5-4ebe-bc5f-311c595dbffa',
                        listen: 'prerequest',
                        script: {
                            id: '611d6b24-8a54-4f3d-a813-553d3d98434b',
                            type: 'text/javascript',
                            exec: [
                                'console.log("Request level pre request script");'
                            ]
                        }
                    },
                    {
                        id: '02e6143d-cbb4-492e-bf84-e3943d2c5ac8',
                        listen: 'test',
                        script: {
                            id: '6efbceeb-e9e9-439b-8bc3-3a76152ce714',
                            type: 'text/javascript',
                            exec: [
                                'console.log("Request level test script");'
                            ]
                        }
                    }
                ],
                preRequestScript: 'console.log("Request level pre request script");',
                pathVariableData: [],
                method: 'GET',
                data: [],
                dataMode: 'raw',
                rawModeData: '',
                tests: 'console.log("Request level test script");',
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
                            value: true,
                            type: 'boolean'
                        },
                        {
                            key: 'autoAddParam',
                            value: true,
                            type: 'boolean'
                        },
                        {
                            key: 'addEmptyParamsToSign',
                            value: false,
                            type: 'boolean'
                        }
                    ]
                },
                currentHelper: 'oAuth1',
                helperAttributes: {
                    id: 'oAuth1',
                    auto: true,
                    includeEmpty: false,
                    consumerKey: 'RKCGzna7bv9YD57c',
                    consumerSecret: 'D+EdQ-gs$-%@2Nu7',
                    header: true,
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
        info: {
            name: 'nested-entities',
            _postman_id: '371e9fa3-97d3-ca11-07c0-836a72a325c2',
            description: 'A simple collection to elucidate nested auth helpers, variables, and scripts',
            schema: 'https://schema.getpostman.com/json/collection/v2.0.0/collection.json'
        },
        variable: [{
            id: 'collection',
            key: 'collection',
            value: 'variable',
            type: 'string',
            description: 'This is a collection level variable'
        }],
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
                id: 'da38471e-5f93-4e94-90d2-e912bcd131cb',
                listen: 'prerequest',
                script: {
                    id: 'da5d1694-6dbf-4f0f-a2ab-6dbbe84b325b',
                    type: 'text/javascript',
                    exec: [
                        'console.log("Collection level pre request script");'
                    ]
                }
            },
            {
                id: '768ce224-699f-46cf-86e8-2c864a5ca19e',
                listen: 'test',
                script: {
                    id: 'c90c18e9-7c8c-40f7-b396-08046545e346',
                    type: 'text/javascript',
                    exec: [
                        'console.log("Collection level test script");'
                    ]
                }
            }
        ],
        item: [
            {
                _postman_id: '5be148b3-0081-5a59-5273-9014161b0292',
                name: 'F1',
                variable: [{
                    id: 'folder',
                    key: 'folder',
                    value: 'variable',
                    type: 'string',
                    description: 'This is a folder level variable'
                }],
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
                        id: '76da1ffd-ed85-4219-a01c-cc014b4c69be',
                        listen: 'prerequest',
                        script: {
                            id: '2201375d-5c94-4328-a546-fa0870fc491f',
                            type: 'text/javascript',
                            exec: [
                                'console.log("Folder level pre request script");'
                            ]
                        }
                    },
                    {
                        id: 'd3652aab-b884-47cb-877b-2165f722ecdc',
                        listen: 'test',
                        script: {
                            id: '4706619b-0fea-4d61-8257-6a54e35b2852',
                            type: 'text/javascript',
                            exec: [
                                'console.log("Folder level test script");'
                            ]
                        }
                    }
                ],
                item: [
                    {
                        _postman_id: 'a742022f-ff24-18c5-6e8b-0c4e7d7aee08',
                        name: 'Basic',
                        variable: [{
                            id: 'request',
                            key: 'request',
                            value: 'variable',
                            type: 'string',
                            description: 'This is a request level variable'
                        }],
                        event: [
                            {
                                id: 'adeb27f6-724d-4e54-9d99-6a8b282032d8',
                                listen: 'prerequest',
                                script: {
                                    id: '076be57a-6f25-4058-865f-57b059c203ca',
                                    type: 'text/javascript',
                                    exec: [
                                        'console.log("Request level pre request script");'
                                    ]
                                }
                            },
                            {
                                id: 'b0acd08b-a88e-4570-8085-49edaf885fe1',
                                listen: 'test',
                                script: {
                                    id: '8f25e55f-ee00-4453-87e2-4ed3297d9388',
                                    type: 'text/javascript',
                                    exec: [
                                        'console.log("Request level test script");'
                                    ]
                                }
                            }
                        ],
                        request: {
                            auth: {
                                type: 'basic',
                                basic: {
                                    username: '{{username}}',
                                    password: '{{token}}',
                                    saveHelperData: true,
                                    showPassword: false
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
                variable: [{
                    id: 'request',
                    key: 'request',
                    value: 'variable',
                    type: 'string',
                    description: 'This is a request level variable'
                }],
                event: [
                    {
                        id: '0b080d65-32f5-4ebe-bc5f-311c595dbffa',
                        listen: 'prerequest',
                        script: {
                            id: '611d6b24-8a54-4f3d-a813-553d3d98434b',
                            type: 'text/javascript',
                            exec: [
                                'console.log("Request level pre request script");'
                            ]
                        }
                    },
                    {
                        id: '02e6143d-cbb4-492e-bf84-e3943d2c5ac8',
                        listen: 'test',
                        script: {
                            id: '6efbceeb-e9e9-439b-8bc3-3a76152ce714',
                            type: 'text/javascript',
                            exec: [
                                'console.log("Request level test script");'
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
                            realm: '',
                            addParamsToHeader: true,
                            autoAddParam: true,
                            addEmptyParamsToSign: false
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
        variable: [{
            id: 'collection',
            key: 'collection',
            value: 'variable',
            type: 'string',
            description: 'This is a collection level variable'
        }],
        auth: {
            type: 'awsv4',
            awsv4: [
                {
                    key: 'accessKey',
                    value: '{{id}}',
                    type: 'string'
                },
                {
                    key: 'id',
                    value: 'awsSigV4',
                    type: 'string'
                },
                {
                    key: 'region',
                    value: 'us-east-1',
                    type: 'string'
                },
                {
                    key: 'secretKey',
                    value: '{{key}}',
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
                id: 'da38471e-5f93-4e94-90d2-e912bcd131cb',
                listen: 'prerequest',
                script: {
                    id: 'da5d1694-6dbf-4f0f-a2ab-6dbbe84b325b',
                    type: 'text/javascript',
                    exec: [
                        'console.log("Collection level pre request script");'
                    ]
                }
            },
            {
                id: '768ce224-699f-46cf-86e8-2c864a5ca19e',
                listen: 'test',
                script: {
                    id: 'c90c18e9-7c8c-40f7-b396-08046545e346',
                    type: 'text/javascript',
                    exec: [
                        'console.log("Collection level test script");'
                    ]
                }
            }
        ],
        item: [
            {
                _postman_id: '5be148b3-0081-5a59-5273-9014161b0292',
                name: 'F1',
                variable: [{
                    id: 'folder',
                    key: 'folder',
                    value: 'variable',
                    type: 'string',
                    description: 'This is a folder level variable'
                }],
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
                        }
                    ]
                },
                event: [
                    {
                        id: '76da1ffd-ed85-4219-a01c-cc014b4c69be',
                        listen: 'prerequest',
                        script: {
                            id: '2201375d-5c94-4328-a546-fa0870fc491f',
                            type: 'text/javascript',
                            exec: [
                                'console.log("Folder level pre request script");'
                            ]
                        }
                    },
                    {
                        id: 'd3652aab-b884-47cb-877b-2165f722ecdc',
                        listen: 'test',
                        script: {
                            id: '4706619b-0fea-4d61-8257-6a54e35b2852',
                            type: 'text/javascript',
                            exec: [
                                'console.log("Folder level test script");'
                            ]
                        }
                    }
                ],
                item: [
                    {
                        _postman_id: 'a742022f-ff24-18c5-6e8b-0c4e7d7aee08',
                        variable: [{
                            id: 'request',
                            key: 'request',
                            value: 'variable',
                            type: 'string',
                            description: 'This is a request level variable'
                        }],
                        name: 'Basic',
                        event: [
                            {
                                id: 'adeb27f6-724d-4e54-9d99-6a8b282032d8',
                                listen: 'prerequest',
                                script: {
                                    id: '076be57a-6f25-4058-865f-57b059c203ca',
                                    type: 'text/javascript',
                                    exec: [
                                        'console.log("Request level pre request script");'
                                    ]
                                }
                            },
                            {
                                id: 'b0acd08b-a88e-4570-8085-49edaf885fe1',
                                listen: 'test',
                                script: {
                                    id: '8f25e55f-ee00-4453-87e2-4ed3297d9388',
                                    type: 'text/javascript',
                                    exec: [
                                        'console.log("Request level test script");'
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
                                        value: true,
                                        type: 'boolean'
                                    },
                                    {
                                        key: 'showPassword',
                                        value: false,
                                        type: 'boolean'
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
                variable: [{
                    id: 'request',
                    key: 'request',
                    value: 'variable',
                    type: 'string',
                    description: 'This is a request level variable'
                }],
                name: 'OAuth1',
                event: [
                    {
                        id: '0b080d65-32f5-4ebe-bc5f-311c595dbffa',
                        listen: 'prerequest',
                        script: {
                            id: '611d6b24-8a54-4f3d-a813-553d3d98434b',
                            type: 'text/javascript',
                            exec: [
                                'console.log("Request level pre request script");'
                            ]
                        }
                    },
                    {
                        id: '02e6143d-cbb4-492e-bf84-e3943d2c5ac8',
                        listen: 'test',
                        script: {
                            id: '6efbceeb-e9e9-439b-8bc3-3a76152ce714',
                            type: 'text/javascript',
                            exec: [
                                'console.log("Request level test script");'
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
                                value: true,
                                type: 'boolean'
                            },
                            {
                                key: 'autoAddParam',
                                value: true,
                                type: 'boolean'
                            },
                            {
                                key: 'addEmptyParamsToSign',
                                value: false,
                                type: 'boolean'
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
