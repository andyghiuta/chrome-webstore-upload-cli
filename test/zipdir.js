const test = require('ava');
const pify = require('pify');
const zipdir = require('../zipdir');
const { ZipFile } = require('yazl');
const { readable } = require('is-stream');
const recursiveDir = require('recursive-readdir');

function stubAddFile(stub) {
    const old = ZipFile.prototype.addFile;
    ZipFile.prototype.addFile = stub;

    return () => ZipFile.prototype.addFile = old;
}

function getExtensionFixtureFiles(name) {
    return pify(recursiveDir)(`./test/fixtures/${name}`);
}

test('Rejects when provided invalid dir', async t => {
    try {
        await zipdir('foo');
        t.fail('Did not reject');
    } catch(e) {
        t.pass('Rejected');
    }
});

test('Resolves to a readable stream', async t => {
    const shouldBeStream = await zipdir('./test/fixtures/without-junk');
    t.true(readable(shouldBeStream));
});

test.serial('Adds each file in dir', async t => {
    const files = await getExtensionFixtureFiles('without-junk');
    t.plan(files.length);

    const resetStub = stubAddFile(() => t.pass());

    await zipdir('./test/fixtures/without-junk');
    resetStub();
});

test.serial('Ignores OS junk files', async t => {
    const junkFiles = [
        '.DS_STORE',
        'Thumbs.db'
    ];
    const files = await getExtensionFixtureFiles('with-junk');
    t.plan(files.length - junkFiles.length);

    const resetStub = stubAddFile(() => t.pass());

    await zipdir('./test/fixtures/with-junk');
    resetStub();
});

test.todo('Removes user-supplied root from path in zip');
