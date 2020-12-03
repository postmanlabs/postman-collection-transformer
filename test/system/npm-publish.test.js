const expect = require('chai').expect,
    // eslint-disable-next-line security/detect-child-process
    { execSync: exec } = require('child_process');

describe('npm publish', function () {
    // @note npm pack won't refresh the .cache because of prepublishOnly
    // but we make sure it's refreshed before running tests using pretest script
    const packageInfo = JSON.parse(exec('npm pack --dry-run --json'))[0],
        packagedFiles = packageInfo.files.map(({ path }) => { return path; });

    it('should have a valid package name', function () {
        expect(packageInfo.name).to.equal('postman-collection-transformer');
    });

    it('should not publish unnecessary files', function () {
        const allowedFiles = ['index.js', 'package.json', 'LICENSE.md', 'README.md', 'CHANGELOG.yaml'];

        packagedFiles.map((path) => {
            expect(allowedFiles.includes(path) ||
                path.startsWith('lib/') ||
                path.startsWith('bin/')).to.be.true;
        });
    });
});
