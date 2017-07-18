module.exports = {
    v1: {
        id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
        name: 'body-src-check',
        order: [
            '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
            '3d2c6dbc-cefa-0951-2796-3f0142ff85c3'
        ],
        folders: [],
        folders_order: [],
        requests: [
            {
                id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                headers: '',
                headerData: [],
                url: 'https://postman-echo.com/post',
                queryParams: [],
                pathVariableData: [],
                method: 'POST',
                rawModeData: '',
                data: [
                    {
                        key: 'file',
                        value: 't.csv',
                        description: 'Enabled CSV file',
                        type: 'file'
                    }
                ],
                dataMode: 'params',
                name: 'Formdata POST',
                collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                responses: []
            },
            {
                id: '3d2c6dbc-cefa-0951-2796-3f0142ff85c3',
                headers: '',
                headerData: [],
                url: 'https://postman-echo.com/post',
                queryParams: [],
                pathVariableData: [],
                method: 'POST',
                data: [],
                dataMode: 'binary',
                name: 'Binary POST',
                collectionId: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
                responses: [],
                rawModeData: 't.csv'
            }
        ]
    },
    v2: {
        variables: [],
        info: {
            name: 'body-src-check',
            _postman_id: '84b2b626-d3a6-0f31-c7a0-47733c01d0c2',
            schema: 'https://schema.getpostman.com/json/collection/v2.0.0/collection.json'
        },
        item: [
            {
                _postman_id: '4f65e265-dd38-0a67-71a5-d9dd50fa37a1',
                name: 'Formdata POST',
                request: {
                    url: 'https://postman-echo.com/post',
                    method: 'POST',
                    header: [],
                    body: {
                        mode: 'formdata',
                        formdata: [
                            {
                                key: 'file',
                                description: 'Enabled CSV file',
                                type: 'file',
                                src: 't.csv'
                            }
                        ]
                    }
                },
                response: []
            },
            {
                _postman_id: '3d2c6dbc-cefa-0951-2796-3f0142ff85c3',
                name: 'Binary POST',
                request: {
                    url: 'https://postman-echo.com/post',
                    method: 'POST',
                    header: [],
                    body: {
                        mode: 'file',
                        file: {
                            src: 't.csv'
                        }
                    }
                },
                response: []
            }
        ]
    }
};
