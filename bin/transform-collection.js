#!/usr/bin/env node
var program = require('commander'),
    logger = require('winston'),
    transformer = require('../index');

program
    .usage('[command] [options]')
    .version(require('../package.json').version);

// Describe the options and usage instruction for the `convert` command
program
    .command('convert')
    .description('Convert Postman Collection from one format to another')
    .option('-e, --env <path>', 'optional path to the associated postman environment file to be used')
    .option('-i, --input <path>', 'path to the input postman collection file')
    .option('-j, --input-version [version]', 'the version of the input collection format standard (v1 or v2)')
    .option('-o, --output <path>', 'target file patn where the converted collection will be written')
    .option('-p, --output-version [version]', 'required version to which the collection is needed to be converted to')
    .action(function (options) {
        logger.info('yet to be implemented', options, transformer);

        transformer.convert(options, function (/* error, result */) {
            // write to file
        }); // @todo pass params
        // @todo implement with as little and concise code as possible with least external dependencies
    });

// Describe the options and usage instructions for the `validate` command
program
    .command('validate')
    .description('Verify whether a postman collection adheres to version specifications')
    .option('-i, --input <path>', 'path to the input postman collection file')
    .option('-s, --schema [version]', 'the version of the input collection format standard')
    .action(function (options) {
        logger.info('yet to be implemented', options, transformer);
        // @todo implement with as little and concise code as possible with least external dependencies
    });

program.parse(process.argv);
