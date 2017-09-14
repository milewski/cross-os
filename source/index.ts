#!/usr/bin/env node

import * as path from 'path';
import { exec, spawn, ChildProcess } from 'child_process';

const { platform } = process;

/**
 * Grab package.json
 */
const pipeline = new Promise<string>(resolve => {
    exec('npm prefix').stdout.on('data', (root: Buffer) => {
        resolve(require(path.resolve(root.toString('utf8').trim(), 'package.json')))
    });
}).then<{ command: string, script: string }>(config => {

    /**
     * Check if the desired script exists
     */
    let script = process.argv.pop(),
        property = 'scripts';

    if (!config[property][script] || typeof config[property][script] !== 'object') {
        property = 'cross-os'
    }

    try {
        return Promise.resolve({ command: config[property][script][platform], script })
    } catch (e) {
        throw script
    }

}).then<ChildProcess>(({ command, script }) => {

    /**
     * Execute the script
     */
    if (command) {
        const proc = spawn(command, [], { stdio: 'inherit', shell: true })
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
