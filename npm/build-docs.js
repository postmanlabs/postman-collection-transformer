#!/usr/bin/env node
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to generate documentation for this module
// ---------------------------------------------------------------------------------------------------------------------

require('shelljs/global');
require('colors');

// stop on encountering the first error
set('-e');
console.log('Generating documentation...'.yellow.bold);

test('-d', './out/docs') && rm('-rf', './out/docs');

exec('jsdoc -c .jsdoc-config.json -u lib/*;');
echo(' - documentation can be found at ./out/docs'.green.bold);
