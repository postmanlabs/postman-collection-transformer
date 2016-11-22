#!/usr/bin/env node
/* eslint-env node, es6 */
require('shelljs/global');
require('colors');

var async = require('async');

console.log('   ___     _ _        _   _            _____                  __               POSTMAN  '.green.bold);
console.log('  / __|___| | |___ __| |_(_)___ _ _   |_   _| _ __ _ _ _  ___/ _|___ _ _ _ __  ___ _ _  '.green.bold);
console.log(' | (__/ _ \\ | / -_) _|  _| / _ \\ \' \\    | || \'_/ _\\` | \' \\(_-<  _/ _ \\ \'_| \'  \\/ -_) \'_|'.green.bold); // eslint-disable-line max-len
console.log('  \\___\\___/_|_\\___\\__|\\__|_\\___/_||_|   |_||_| \\__,_|_||_/__/_| \\___/_| |_|_|_\\___|_|   '.green.bold); // eslint-disable-line max-len

async.series([
    require('./test-lint'),
    require('./test-system'),
    require('./test-unit'),
    require('./test-integration')
], function (code) {
    !code && console.log('\npostman-collection-transformer tests: all ok!'.green.bold);
    exit(code);
});
