[![Build Status](https://travis-ci.org/postmanlabs/postman-collection-transformer.svg?branch=develop)](https://travis-ci.org/postmanlabs/postman-collection-transformer)
# postman-collection-transformer
Perform rapid conversion of JSON structure between Postman Collection Format v1 and v2.

The formats are documented at https://schema.getpostman.com

## Installation

For CLI usage:

    $ npm install -g postman-collection-transformer

As a library:

    $ npm install --save postman-collection-transformer

## Usage

#### Converting Entire Collections

The transformer provides a Command line API to convert collections.

Example:

    $ transform-collection convert \
        --input ./v1-collection.json \
        --input-version 2.0.0 \
        --output ./v2-collection.json \
        --output-version 1.0.0 \
        --pretty \
        --overwrite

All options:

    $ transform-collection convert -h

      Usage: convert [options]

      Convert Postman Collection from one format to another

      Options:

        -h, --help                      output usage information
        -i, --input <path>              path to the input postman collection file
        -j, --input-version [version]   the version of the input collection format standard (v1 or v2)
        -o, --output <path>             target file path where the converted collection will be written
        -p, --output-version [version]  required version to which the collection is needed to be converted to
        -P, --pretty                    Pretty print the output
        --retain-ids                    Retain the request and folder IDs during conversion (collection ID is always retained)
        -w, --overwrite                 Overwrite the output file if it exists

If you'd rather use the transformer as a library:

    var transformer = require('../index'),
        collection = require('../examples/v1/box.json'),
        inspect = require('util').inspect,

        options = {
            inputVersion: '1.0.0',
            outputVersion: '2.0.0',
            retainIds: true  // the transformer strips request-ids etc by default.
        };

    transformer.convert(collection, options, function (error, result) {
        if (error) {
            return console.error(error);
        }

        // result <== the converted collection as a raw Javascript object
        console.log(inspect(result, {colors: true, depth: 10000}));
    });
    
#### Converting Individual Requests

The transformer also allows you to convert individual requests (only supported when used as a library):

###### Example
```javascript

    var transformer = require('postman-collection-transformer'),
    
        objectToConvert = { /* A valid collection v1 Request or a collection v2 Item */ },

        options = {
            inputVersion: '1.0.0',
            outputVersion: '2.0.0',
            retainIds: true  // the transformer strips request-ids etc by default.
        };

    transformer.convertSingle(objectToConvert, options, function (err, converted) {
        console.log(converted);
    });
```

#### Converting Individual Responses

You can convert individual responses too if needed:

###### Example
```javascript

    var transformer = require('postman-collection-transformer'),
    
        objectToConvert = { /* A v1 Response or a v2 Response */ },

        options = {
            inputVersion: '1.0.0',
            outputVersion: '2.0.0',
            retainIds: true  // the transformer strips request-ids etc by default.
        };

    transformer.convertResponse(objectToConvert, options, function (err, converted) {
        console.log(converted);
    });
```
