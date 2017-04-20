#!/usr/bin/env node

import * as path from 'path';
import { exec, spawn } from 'child_process';

const { platform } = process;

/**
 * Grab package.json
 */
const pipeline = new Promise(resolve => {
    exec('npm prefix').stdout.on('data', (root: Buffer) => {
        resolve(require(path.resolve(root.toString('utf8').trim(), 'package.json')))
    });
}).then(config => {

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

}).then(({ command, script }) => {

    /**
     * Execute the script
     */
    if (command)
        return spawn(command, [], { stdio: 'inherit', shell: true })

    throw script

}).catch(error => {
    console.log('\x1b[33m', `script: '${error}' not found for the current platform: ${platform}\n`, '\x1b[39m')
})
