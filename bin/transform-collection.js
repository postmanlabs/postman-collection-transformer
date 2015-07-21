#!/usr/bin/env node
var program = require('commander'),
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
    .option('-o, --output <path>', 'target file path where the converted collection will be written')
    .option('-p, --output-version [version]', 'required version to which the collection is needed to be converted to')
    .option('-P, --pretty', 'Pretty print the output')
    .option('-w, --overwrite', 'Overwrite the output file if it exists')
    .action(function (options) {
        transformer.convert(options, function (error, result) {
            if (error) {
                console.error(error.message);
                return;
            }
            transformer.util.writeJSON(options.output, result, options.pretty, options.overwrite, function (error) {
                if (error) {
                    if (error.code === 'EEXIST') {
                        console.error('Output file %s already exists', error.path);
                    }
                    else {
                        console.error(error.message || error);
                    }
                }
            });
        });
    });

// Describe the options and usage instructions for the `validate` command
program
    .command('validate')
    .description('Verify whether a postman collection adheres to version specifications')
    .option('-i, --input <path>', 'path to the input postman collection file')
    .option('-s, --schema [version]', 'the version of the input collection format standard')
    .action(function (options) {
        console.log('yet to be implemented', options, transformer);
        // @todo implement with as little and concise code as possible with least external dependencies
    });

program
    .command('*', 'Display usage text', {isDefault: true})
    .action(function () {
        program.outputHelp();
    });

program.parse(process.argv);
