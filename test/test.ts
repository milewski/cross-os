import { execFile, execFileSync, spawnSync } from 'child_process'
import { strict as assert } from 'assert'
import { promisify } from 'util'
import { resolve } from 'path'

process.chdir(__dirname)

const execFileAsync = promisify(execFile)
const cross = resolve(__dirname, '../source/index.js')
const { platform } = process
const test: (name: string, fn: () => void | Promise<void>) => void = require('node:test')

function runCross(script: string, args: string[] = []) {
    return spawnSync(process.execPath, [cross, script, ...args], {
        cwd: __dirname,
        encoding: 'utf8',
    })
}

function assertOutputIncludes(output: string, expected: string): void {
    assert.match(output.trim(), new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
}

async function runNpmScript(script: string, args: string[] = []) {
    return execFileAsync('npm', ['run', script, '--silent', ...args], {
        cwd: __dirname,
    })
}

test('fails with a clear error when invoked with an invalid script', () => {
    const result = runCross('invalid')

    assert.equal(result.status, 1)
    assertOutputIncludes(result.stderr, `script: 'invalid' not found for the current platform: ${platform}`)
})

test('fails with a clear error when an invalid script receives parameters', () => {
    const result = runCross('invalid', ['--', 'First', 'Second', 'Third'])

    assert.equal(result.status, 1)
    assertOutputIncludes(result.stderr, `script: 'invalid' not found for the current platform: ${platform}`)
})

test('runs the platform-specific package script', () => {
    const result = runCross('first')

    assert.equal(result.status, 0)
    assertOutputIncludes(result.stdout, `hello from ${platform}`)
})

test('passes parameters to platform-specific package scripts', () => {
    const result = runCross('first-with-params', ['--', 'First', 'Second', 'Third'])

    assert.equal(result.status, 0)
    assertOutputIncludes(result.stdout, `hello from ${platform}, I have arguments: First Second Third`)
})

test('preserves a parameter containing spaces', () => {
    const result = runCross('first-with-params', ['--', 'First Second', 'Third'])

    assert.equal(result.status, 0)
    assertOutputIncludes(result.stdout, `hello from ${platform}, I have arguments: First Second Third`)
})

test('fails when a script has no command for the current platform', () => {
    const result = runCross('second')

    assert.equal(result.status, 1)
    assertOutputIncludes(result.stderr, `script: 'second' not found for the current platform: ${platform}`)
})

test('fails when a platformless script receives parameters', () => {
    const result = runCross('second', ['--', 'First', 'Second', 'Third'])

    assert.equal(result.status, 1)
    assertOutputIncludes(result.stderr, `script: 'second' not found for the current platform: ${platform}`)
})

test('leaves regular npm scripts untouched', async () => {
    const { stdout } = await runNpmScript('third')

    assertOutputIncludes(stdout, 'it is working just fine')
})

test('leaves regular npm scripts untouched when they receive parameters', async () => {
    const { stdout } = await runNpmScript('third-with-params', ['--', 'First', 'Second', 'Third'])

    assertOutputIncludes(stdout, 'it is working just fine with arguments: First Second Third')
})

test('runs platform scripts through an npm script', async () => {
    const { stdout } = await runNpmScript('fourth')

    assertOutputIncludes(stdout, `hello from ${platform}`)
})

test('passes parameters through an npm script to a platform script', async () => {
    const { stdout } = await runNpmScript('fourth-with-params', ['--', 'First', 'Second', 'Third'])

    assertOutputIncludes(stdout, `hello from ${platform}, I have arguments: First Second Third`)
})

test('runs scripts defined in the cross-os package attribute', () => {
    const result = runCross('fifth')

    assert.equal(result.status, 0)
    assertOutputIncludes(result.stdout, `hello from cross-os ${platform}`)
})

test('passes parameters to scripts defined in the cross-os package attribute', () => {
    const result = runCross('fifth-with-params', ['--', 'First', 'Second', 'Third'])

    assert.equal(result.status, 0)
    assertOutputIncludes(result.stdout, `hello from cross-os ${platform}, I have arguments: First Second Third`)
})

test('runs cross-os attribute scripts through npm scripts', async () => {
    const { stdout } = await runNpmScript('seventh')

    assertOutputIncludes(stdout, `hello from cross-os ${platform}`)
})

test('passes parameters to cross-os attribute scripts through npm scripts', async () => {
    const { stdout } = await runNpmScript('seventh-with-params', ['--', 'First', 'Second', 'Third'])

    assertOutputIncludes(stdout, `hello from cross-os ${platform}, I have arguments: First Second Third`)
})

test('prefers scripts entries over cross-os entries with the same name', async () => {
    const { stdout } = await runNpmScript('sixth')

    assertOutputIncludes(stdout, `hello from ${platform}`)
})

test('prefers scripts entries over cross-os entries when passing parameters', async () => {
    const { stdout } = await runNpmScript('sixth-with-params', ['--', 'First', 'Second', 'Third'])

    assertOutputIncludes(stdout, `hello from ${platform}, I have arguments: First Second Third`)
})

test('does not conflict with a script containing the same name as its callee', async () => {
    const { stdout } = await runNpmScript('foo')

    assertOutputIncludes(stdout, 'bar')
})

test('does not conflict with a same-name callee when passing parameters', async () => {
    const { stdout } = await runNpmScript('foo-with-params', ['--', 'First', 'Second', 'Third'])

    assertOutputIncludes(stdout, `bar from ${platform}, I have arguments: First Second Third`)
})

test('propagates child process failures', () => {
    const result = runCross('fail')

    assert.equal(result.status, 1)
})

test('propagates child process failures when passing parameters', () => {
    const result = runCross('fail-with-params', ['--', 'First', 'Second', 'Third'])

    assert.equal(result.status, 1)
})

test('can be executed directly by node after compilation', () => {
    const stdout = execFileSync(process.execPath, [cross, 'first'], {
        cwd: __dirname,
        encoding: 'utf8',
    })

    assertOutputIncludes(stdout, `hello from ${platform}`)
})
