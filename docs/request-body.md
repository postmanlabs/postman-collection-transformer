# Transforming Request Body (v1 -> v2.x)

### Request Body Mode

> v1 property: requests.dataMode  
v2 property: request.body.mode


**`mode` is set based on the following conversion table:**

| v1         | v2         |
|------------|------------|
| raw        | raw        |
| binary     | file       |
| params     | formdata   |
| urlencoded | urlencoded |

**If `dataMode` is not set or invalid then `mode` is inferred from `rawModeData` or `data`**

- `formdata`: if `isRawModeData` is false AND `data` is an array
- `raw`: otherwise

```
isRawModeData:
- `rawModeData` is not null `AND`
- `rawModeData` is of type string `OR`
- `rawModeData` is an array of length 1 and the element is of type string
```

---

### Request Body Data

> v1 property: requests.data or requests.rawModeData  
v2 property: request.body[request.body.mode]

**Mode: raw**
```javascript
if (isRawModeData) {
    body.raw = Array.isArray(v1.rawModeData) ? v1.rawModeData[0] : v1.rawModeData;
}
else if (typeof v1.data === 'string') {
    body.raw = v1.data;
}
```

**Mode: file**
```javascript
body.file = { src: v1.rawModeData }
```

**Mode: formdata**
```javascript
body.formdata = parseFormData (v1.data || v1.rawModeData, retainEmpty);
```

**Mode: urlencoded**
```javascript
body.urlencoded = parseFormData (v1.data || v1.rawModeData, retainEmpty);
```

**parseFormData**: [source](../lib/converters/v1.0.0/converter-v1-to-v2.js#L30)