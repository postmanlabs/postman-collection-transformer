/**
 * @fileOverview This test specs runs tests on the package.json file of repository. It has a set of strict tests on the
 * content of the file as well. Any change to package.json must be accompanied by valid test case in this spec-sheet.
 */
var _ = require('lodash'),
    fs = require('fs'),
    yml = require('js-yaml'),
    expect = require('chai').expect,
    parseIgnore = require('parse-gitignore');

/* global describe, it */
describe('project repository', function () {
    describe('package.json', function () {
        var content,
            json;

        try {
            content = fs.readFileSync('./package.json').toString();
            json = JSON.parse(content);
        }
        catch (e) {
            console.error(e);
            content = '';
            json = {};
        }

        it('must have readable JSON content', function () {
            expect(content).to.be.ok;
            expect(json).to.not.eql({});
        });

        describe('package.json JSON data', function () {
            it('must have valid name, description and author', function () {
                expect(json).to.have.property('name', 'postman-collection-transformer');
                // eslint-disable-next-line max-len
                expect(json).to.have.property('description', 'Perform rapid conversation and validation of JSON structure between Postman Collection Format v1 and v2');
                expect(json).to.have.property('author', 'Postman Labs <help@getpostman.com>');
                expect(json).to.have.property('license', 'Apache-2.0');
                // eslint-disable-next-line max-len
                expect(json).to.have.property('homepage', 'https://github.com/postmanlabs/postman-collection-transformer#readme');
                // eslint-disable-next-line max-len
                expect(json.bugs).to.eql({ url: 'https://github.com/postmanlabs/postman-collection-transformer/issues' });

                expect(json).to.have.property('repository');
                expect(json.repository).to.eql({
                    type: 'git',
                    url: 'git+https://github.com/postmanlabs/postman-collection-transformer.git'
                });

                expect(json).to.have.property('keywords');
                expect(json.keywords).to.eql(['postman', 'collection', 'json', 'format', 'converter', 'transformer']);

                expect(json).to.have.property('engines');
                expect(json.engines).to.eql({ node: '>=6' });
            });

            it('must have a valid version string in form of <major>.<minor>.<revision>', function () {
                // eslint-disable-next-line max-len
                expect(json.version).to.match(/^((\d+)\.(\d+)\.(\d+))(?:-([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?(?:\+([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?$/);
            });
        });

        describe('script definitions', function () {
            it('files must exist', function () {
                var scriptRegex = /^node\snpm\/.+\.js$/;

                expect(json.scripts).to.be.ok;
                json.scripts && Object.keys(json.scripts).forEach(function (scriptName) {
                    expect(scriptRegex.test(json.scripts[scriptName])).to.be.ok;
                    expect(fs.statSync('npm/' + scriptName + '.js')).to.be.ok;
                });
            });

            it('must have the hashbang defined', function () {
                json.scripts && Object.keys(json.scripts).forEach(function (scriptName) {
                    var fileContent = fs.readFileSync('npm/' + scriptName + '.js').toString();

                    expect((/^#!\/(bin\/bash|usr\/bin\/env\snode)[\r\n][\W\w]*$/g).test(fileContent)).to.be.ok;
                });
            });
        });

        describe('dependencies', function () {
            it('must exist', function () {
                expect(json.dependencies).to.be.a('object');
            });

            it('must point to a valid and precise (no * or ^) semver', function () {
                json.dependencies && Object.keys(json.dependencies).forEach(function (item) {
                    expect(json.dependencies[item]).to.match(new RegExp('^((\\d+)\\.(\\d+)\\.(\\d+))(?:-' +
                        '([\\dA-Za-z\\-]+(?:\\.[\\dA-Za-z\\-]+)*))?(?:\\+([\\dA-Za-z\\-]+(?:\\.[\\dA-Za-z\\-]+)*))?$'));
                });
            });
        });

        describe('devDependencies', function () {
            it('must exist', function () {
                expect(json.devDependencies).to.be.a('object');
            });

            it('must point to a valid and precise (no * or ^) semver', function () {
                json.devDependencies && Object.keys(json.devDependencies).forEach(function (item) {
                    expect(json.devDependencies[item]).to.match(new RegExp('^((\\d+)\\.(\\d+)\\.(\\d+))(?:-' +
                        '([\\dA-Za-z\\-]+(?:\\.[\\dA-Za-z\\-]+)*))?(?:\\+([\\dA-Za-z\\-]+(?:\\.[\\dA-Za-z\\-]+)*))?$'));
                });
            });

            it('should not overlap devDependencies', function () {
                var clean = [];

                json.devDependencies && Object.keys(json.devDependencies).forEach(function (item) {
                    !json.dependencies[item] && clean.push(item);
                });

                expect(Object.keys(json.devDependencies)).to.eql(clean);
            });
        });

        describe('main entry script', function () {
            it('must point to a valid file', function (done) {
                expect(json.main).to.equal('index.js');
                fs.stat(json.main, done);
            });
        });
    });

    describe('README.md', function () {
        it('must exist', function (done) {
            fs.stat('./README.md', done);
        });

        it('must have readable content', function () {
            expect(fs.readFileSync('./README.md').toString()).to.be.ok;
        });
    });

    describe('LICENSE.md', function () {
        it('must exist', function (done) {
            fs.stat('./LICENSE.md', done);
        });

        it('must have readable content', function () {
            expect(fs.readFileSync('./LICENSE.md').toString()).to.be.ok;
        });
    });

    describe('CHANGELOG.yaml', function () {
        it('should exist', function (done) {
            fs.stat('./CHANGELOG.yaml', done);
        });

        it('should have readable content', function () {
            expect(yml.safeLoad(fs.readFileSync('./CHANGELOG.yaml')), 'not a valid yaml').to.be.ok;
        });
    });

    describe('.ignore files', function () {
        var gitignorePath = '.gitignore',
            npmignorePath = '.npmignore',
            npmignore = parseIgnore(fs.readFileSync(npmignorePath)),
            gitignore = parseIgnore(fs.readFileSync(gitignorePath));

        describe(gitignorePath, function () {
            it('must exist', function (done) {
                fs.stat(gitignorePath, done);
            });

            it('must have valid content', function () {
                expect(_.isEmpty(gitignore)).to.not.be.ok;
            });
        });

        describe(npmignorePath, function () {
            it('must exist', function (done) {
                fs.stat(npmignorePath, done);
            });

            it('must have valid content', function () {
                expect(_.isEmpty(npmignore)).to.not.be.ok;
            });
        });

        it('.gitignore coverage must be a subset of .npmignore coverage', function () {
            expect(_.intersection(gitignore, npmignore)).to.eql(gitignore);
        });
    });

    describe('.eslintrc', function () {
        it('must exist', function (done) {
            fs.stat('./.eslintrc', done);
        });

        it('must have readable content', function () {
            expect(fs.readFileSync('./.eslintrc').toString()).to.be.ok;
        });
    });

    describe('.gitattributes', function () {
        it('should exist', function (done) {
            fs.stat('./.gitattributes', done);
        });

        it('should have readable content', function () {
            expect(fs.readFileSync('./.gitattributes').toString()).to.be.ok;
        });
    });
});
