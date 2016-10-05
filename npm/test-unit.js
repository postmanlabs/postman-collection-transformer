#!/usr/bin/env node
/* eslint-env node, es6 */
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all unit tests.
// ---------------------------------------------------------------------------------------------------------------------

require('shelljs/global');
require('colors');

// set directories and files for test and coverage report
var path = require('path'),

    COV_REPORT_PATH = '.coverage',
    SPEC_SOURCES = path.join('test', 'unit'),
    IS_WINDOWS = (/^win/).test(process.platform),
    REPORT_PATH = path.join('.tmp', 'report.xml');

module.exports = function (exit) {
    var istanbulReport = '',
        mochaReporter = 'spec',
        specPattern = (process.argv[2] || '.*');

    // for CI, we use simple xunit reporter
    if (process.env.CI) {
        mochaReporter = 'xunit';
        istanbulReport = '--report cobertura';
    }

    // banner line
    console.info('Running unit tests using mocha...'.yellow.bold);

    mkdir('-p', '.tmp');
    test('-d', COV_REPORT_PATH) && rm('-rf', COV_REPORT_PATH) && mkdir('-p', COV_REPORT_PATH);

    // windows istanbul and mocha commands need some special attention.
    if (IS_WINDOWS) {
        // sample command in case you're confused
        // node_modules\.bin\istanbul.cmd cover  --dir .coverage --color --print both
        //      node_modules\mocha\bin\_mocha -- --reporter spec --reporter-options output=
        //      .tmp\report.xml test\unit --recursive --prof --colors --grep=.*
        exec(`node_modules\\.bin\\istanbul.cmd cover ${istanbulReport} --dir ${COV_REPORT_PATH} --colors ` +
            `--print both node_modules\\mocha\\bin\\_mocha -- ${SPEC_SOURCES} --reporter ${mochaReporter} ` +
            `--reporter-options output=${REPORT_PATH} --recursive --prof --colors --grep=${specPattern}`, exit);
    }
    else {
        exec(`./node_modules/.bin/istanbul cover ${istanbulReport} --dir ${COV_REPORT_PATH} --colors ` +
            `--print both node_modules/mocha/bin/_mocha -- ${SPEC_SOURCES} --reporter ${mochaReporter} ` +
            `--reporter-options output=${REPORT_PATH} --recursive --prof --colors --grep=${specPattern}`, exit);
    }
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
