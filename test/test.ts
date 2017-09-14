import { exec, execSync } from 'child_process';
import * as path from 'path';
import * as expect from 'expect.js';

process.chdir(__dirname);

const cross = path.resolve(__dirname, '../source/index.js');
const { platform } = process

describe('Loader', () => {

    it('should fail if it\'s invoked with an invalid script', () => {

        const stdout = execSync(`node ${cross} invalid`)
        expect(stdout.toString()).to.match(new RegExp(`script: 'invalid' not found for the current platform: ${platform}`))

    })

    it('should run the correct script on the right OS', () => {

        const stdout = execSync(`node ${cross} first`)
        expect(stdout.toString()).to.match(new RegExp(`hello from ${platform}`))

    })

    it('should fail silently if script for an specific OS is not found', () => {

        const stdout = execSync(`node ${cross} second`)
        expect(stdout.toString().trim()).to.match(new RegExp(`script: 'second' not found for the current platform: ${platform}`));

    })

    it('should work with npm scripts directly', done => {

        const child = exec('npm run third --silent')

        let output = '';

        child.stdout.on('data', (buffer: Buffer) => {
            output += buffer.toString('utf-8')
        })

        child.on('exit', code => {
            expect(output.trim()).to.match(/it is working just fine/)
            expect(code).to.be(0)
            done()
        })

    })

    it('should work with npm script + cross-os directly', done => {

        const child = exec('npm run fourth --silent')

        let output = '';

        child.stdout.on('data', (buffer: Buffer) => {
            output += buffer.toString('utf-8')
        })

        child.on('exit', code => {
            expect(output.trim()).to.match(new RegExp(`hello from ${platform}`))
            expect(code).to.be(0)
            done()
        })

    })

    it('should run scripts defined in cross-os attributes', () => {

        const stdout = execSync(`node ${cross} fifth`)
        expect(stdout.toString()).to.match(new RegExp(`hello from cross-os ${platform}`))

    })

    it('should run scripts defined in cross-os attributes (called from npm scripts)', done => {

        const child = exec('npm run seventh --silent')

        let output = '';

        child.stdout.on('data', (buffer: Buffer) => {
            output += buffer.toString('utf-8')
        })

        child.on('exit', code => {
            expect(output.trim()).to.match(new RegExp(`hello from cross-os ${platform}`))
            expect(code).to.be(0)
            done()
        })

    })

    it('scripts should have precedence over cross-os attribute', done => {

        const child = exec('npm run sixth --silent')

        let output = '';

        child.stdout.on('data', (buffer: Buffer) => {
            output += buffer.toString('utf-8')
        })

        child.on('exit', code => {
            expect(output.trim()).to.match(new RegExp(`hello from ${platform}`))
            expect(code).to.be(0)
            done()
        })

    })

    it('should not conflict with script containing the same name as its callee', done => {

        const child = exec('npm run foo --silent')

        let output = '';

        child.stdout.on('data', (buffer: Buffer) => {
            output += buffer.toString('utf-8')
        })

        child.on('exit', code => {
            expect(output.trim()).to.match(/bar/)
            expect(code).to.be(0)
            done()
        })

    })

    it('should fail if child fails', done => {
        const child = exec(`node ${cross} fail`)
        child.on('exit', code => {
            expect(code).to.be(1)
            done()
        })
    })
})
