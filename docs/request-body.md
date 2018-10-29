# Transforming Request Body (v1 -> v2.x)

### Request Body Mode

> v1 property: requests.dataMode
> v2 property: request.body.mode

#### `mode` is set based on the following conversion table
| v1         | v2         |
|------------|------------|
| raw        | raw        |
| binary     | file       |
| params     | formdata   |
| urlencoded | urlencoded |

#### If `dataMode` is not set or invalid then `mode` is inferred from `rawModeData` or `data`

**isRawModeData**:
    - `rawModeData` is not null `AND`
    - `rawModeData` is of type string `OR`
    - `rawModeData` is an array of length 1 and the element is of type string

- `raw`: if `isRawModeData` is true
- `formdata`: if `isRawModeData` is false OR `data` is an array
- `raw`: otherwise

### Request Body Data

> v1 property: requests.data or requests.rawModeData
> v2 property: request.body[request.body.mode]

#### Mode: raw
```javascript
    if (isRawModeData) {
        body.raw = Array.isArray(v1.rawModeData) ? v1.rawModeData[0] : v1.rawModeData;
    }
    else if (typeof v1.data === 'string') {
        body.raw = v1.data;
    }
```

#### Mode: file
```javascript
    body.file = { src: v1.rawModeData }
```

#### Mode: formdata
```javascript
    // TODO: make sure param is an object having property: `key`
    body.formdata = _.map(v1.data || v1.rawModeData, function (param) {
        if (param.type === 'file' && _.has(param, 'value')) {
            param.src = _.isString(param.value) ? param.value : null;
            delete param.value;
        }
        if (param.enabled === false) {
            param.disabled = true;
        }

        delete param.enabled;

        return param;
    });
```

#### Mode: urlencoded
```javascript
    // TODO: make sure param is an object having property: `key`
    body.urlencoded = _.map(v1.data || v1.rawModeData, function (param) {
        if (param.type === 'file' && _.has(param, 'value')) {
            param.src = _.isString(param.value) ? param.value : null;
            delete param.value;
        }
        if (param.enabled === false) {
            param.disabled = true;
        }

        delete param.enabled;

        return param;
    });
```