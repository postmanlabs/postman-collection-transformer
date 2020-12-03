#!/usr/bin/env node
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all schema tests.
// ---------------------------------------------------------------------------------------------------------------------

const path = require('path'),

    chalk = require('chalk'),
    Mocha = require('mocha'),
    recursive = require('recursive-readdir'),

    SPEC_SOURCE_DIR = path.join('test', 'schema');

module.exports = function (exit) {
    // banner line
    console.info(chalk.yellow.bold('Running schema tests using mocha on node...'));

    // add all spec files to mocha
    recursive(SPEC_SOURCE_DIR, (err, files) => {
        if (err) {
            console.error(err);

            return exit(1);
        }

        var mocha = new Mocha({ timeout: 1000 * 60 });

        files.filter((file) => { // extract all test files
            return (file.substr(-8) === '.test.js');
        }).forEach(mocha.addFile.bind(mocha));

        return mocha.run((runError) => {
            runError && console.error(runError.stack || runError);

            exit(runError ? 1 : 0);
        });
    });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(process.exit);
