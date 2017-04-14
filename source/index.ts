#!/usr/bin/env node

import * as path from 'path';
import { exec, spawn } from 'child_process';

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
    let script = process.argv.pop();

    try {
        return Promise.resolve(config['scripts'][script][process.platform]);
    } catch (e) {
        throw script
    }

}).then((command: string) => {

    /**
     * Execute the script
     */
    if (command)
        spawn(command, [], { stdio: 'inherit', shell: true })

}).catch(error => {
    console.log(`script: '${error}' not found.\n`)
})
