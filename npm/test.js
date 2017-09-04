#!/usr/bin/env node
require('colors');

var exit = require('shelljs').exit,
    prettyms = require('pretty-ms'),
    startedAt = Date.now(),
    name = require('../package.json').name;

require('async').series([
    require('./test-lint'),
    require('./test-system'),
    require('./test-unit'),
    require('./test-schema'),
    require('./test-browser')
    // require('./test-integration'),
    // require('./test-cli'),
    // require('./test-library')
], function (code) {
    console.info(`\n${name}: duration ${prettyms(Date.now() - startedAt)}\n${name}: ${code ? 'not ok' : 'ok'}!`[code ?
        'red' : 'green']);
    exit(code && (typeof code === 'number' ? code : 1) || 0);
});
