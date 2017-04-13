import { spawn, spawnSync } from "child_process";
import * as path from "path";
import * as expect from "expect.js";

process.chdir(__dirname);

let cross = path.resolve(__dirname, '../source/index.js');

describe('Loader', () => {

    it('should fail if it\'s invoked with an invalid script', () => {

        const { stdout } = spawnSync(cross, ['invalid'])
        expect(stdout.toString()).to.match(/script: 'invalid' not found\./)

    })

    it('should run the correct script on the right OS', () => {

        const { stdout } = spawnSync(cross, ['first'])
        expect(stdout.toString()).to.match(new RegExp(`hello from ${process.platform}`))

    })

    it('should fail silently if script for an specific OS is not found', () => {

        const { stdout } = spawnSync(cross, ['second'])
        expect(stdout.toString()).to.be.empty();

    })

    it('should work with npm scripts directly', done => {

        const child = spawn('npm', ['run', 'third', '--silent'])

        let output = '';

        child.stdout.on('data', (buffer: Buffer) => {
            output += buffer.toString('utf-8')
        })

        child.on('exit', code => {
            expect(output).to.match(/^it is working just fine\n$/)
            expect(code).to.be(0)
            done()
        })

    })

    it('should work with npm script + cross-os directly', done => {

        const child = spawn('npm', ['run', 'fourth', '--silent'])

        let output = '';

        child.stdout.on('data', (buffer: Buffer) => {
            output += buffer.toString('utf-8')
        })

        child.on('exit', code => {
            expect(output).to.match(new RegExp(`^hello from ${process.platform}\n$`))
            expect(code).to.be(0)
            done()
        })

    })

})
