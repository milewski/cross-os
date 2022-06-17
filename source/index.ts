#!/usr/bin/env node

import { ChildProcess, exec, spawn } from 'child_process'
import * as path from 'path'

const { platform } = process

/**
 * Grab package.json
 */
const pipeline = new Promise<string>(resolve => {
    exec('npm prefix --no-workspaces').stdout.on('data', (root: Buffer) => {
        resolve(require(path.resolve(root.toString('utf8').trim(), 'package.json')))
    })
}).then<{ command: string, params: Array<string>, script: string }>(config => {

    /**
     * Check if the desired script exists
     */

    let script, property = 'scripts'
    let params = []

    if (process.argv.length > 3) {
        script = process.argv[ 2 ]
        params = process.argv.slice(3, process.argv.length)

        if (params.indexOf('--') === 0) {
            params.shift()
        }

    } else {
        script = process.argv.pop()
    }

    if (!config[ property ][ script ] || typeof config[ property ][ script ] !== 'object') {
        property = 'cross-os'
    }

    try {
        return Promise.resolve({ command: config[ property ][ script ][ platform ], params, script })
    } catch (e) {
        throw script
    }

}).then<ChildProcess>(({ command, params, script }) => {

    /**
     * Execute the script
     */
    if (command) {
        const proc = spawn(command, params, { stdio: 'inherit', shell: true })
        /**
         * Propagate child exit code
         */
        proc.on('exit', (code, signal) => process.exit(code))
        return proc
    }

    throw script

}).catch(error => {
    console.log('\x1b[33m', `script: '${error}' not found for the current platform: ${platform}\n`, '\x1b[39m')
})
