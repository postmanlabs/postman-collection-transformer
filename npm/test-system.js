#!/usr/bin/env node
require('shelljs/global');

var chalk = require('chalk'),
    async = require('async'),
    _ = require('lodash'),
    path = require('path'),
    packity = require('packity'),
    Mocha = require('mocha'),
    recursive = require('recursive-readdir'),

    /**
     * The source directory for system test specs.
     *
     * @type {String}
     */
    SPEC_SOURCE_DIR = './test/system',

    /**
     * Load a JSON from file synchronously, used as an alternative to dynamic requires.
     *
     * @param {String} file - The path to the JSON file to load from.
     * @returns {Object} - The parsed JSON object contained in the file at the provided path.
     * @throws {SyntaxError} - Throws an error if the provided JSON file is invalid.
     */
    loadJSON = function (file) {
        return JSON.parse(require('fs').readFileSync(path.join(__dirname, file)).toString());
    };

module.exports = function (exit) {
    // banner line
    console.info(chalk.yellow.bold('\nRunning system tests...\n'));

    async.series([

        /**
         * Enforces sanity checks on installed packages via packity.
         *
         * @param {Function} next - The callback function invoked when the package sanity check has concluded.
         * @returns {*}
         */
        function (next) {
            console.info('checking installed packages...\n');
            packity({ path: '.' }, packity.cliReporter({}, next));
        },

        /**
         * Runs system tests on SPEC_SOURCE_DIR using Mocha.
         *
         * @param {Function} next - The callback invoked to mark the completion of the test run.
         * @returns {*}
         */
        function (next) {
            console.info('\nrunning system specs using mocha...');

            var mocha = new Mocha();

            recursive(SPEC_SOURCE_DIR, function (err, files) {
                if (err) {
                    console.error(err);

                    return exit(1);
                }

                files.filter(function (file) {
                    return (file.substr(-8) === '.test.js');
                }).forEach(function (file) {
                    mocha.addFile(file);
                });

                // start the mocha run
                return mocha.run(next);
            });
        }
    ], exit);
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
