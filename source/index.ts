#!/usr/bin/env node

import { spawn } from 'child_process'
import { readFileSync } from 'fs'
import { resolve } from 'path'

type PlatformScripts = Partial<Record<NodeJS.Platform, string>>
type PackageScript = string | PlatformScripts

interface PackageConfig {
    scripts?: Record<string, PackageScript>
    'cross-os'?: Record<string, PackageScript>
}

interface ScriptRequest {
    args: string[]
    name: string
}

const { platform } = process

function readPackageConfig(cwd = process.cwd()): PackageConfig {
    const packagePath = resolve(cwd, 'package.json')
    return JSON.parse(readFileSync(packagePath, 'utf8')) as PackageConfig
}

function parseScriptRequest(argv = process.argv): ScriptRequest {
    const [ name = '', ...rawArgs ] = argv.slice(2)
    const args = rawArgs[0] === '--' ? rawArgs.slice(1) : rawArgs

    return { args, name }
}

function resolvePlatformCommand(config: PackageConfig, scriptName: string): string | undefined {
    const scriptEntry = config.scripts?.[scriptName]

    if (isPlatformScripts(scriptEntry)) {
        return scriptEntry[platform]
    }

    const crossOsEntry = config['cross-os']?.[scriptName]

    if (isPlatformScripts(crossOsEntry)) {
        return crossOsEntry[platform]
    }

    return undefined
}

function isPlatformScripts(value: PackageScript | undefined): value is PlatformScripts {
    return typeof value === 'object' && value !== null
}

function printMissingScript(scriptName: string): void {
    console.error(`script: '${scriptName}' not found for the current platform: ${platform}`)
}

function run(): void {
    const { args, name } = parseScriptRequest()
    const command = resolvePlatformCommand(readPackageConfig(), name)

    if (!command) {
        printMissingScript(name)
        process.exitCode = 1
        return
    }

    const child = spawn(command, args, { shell: true, stdio: 'inherit' })

    child.on('exit', (code, signal) => {
        if (signal) {
            process.kill(process.pid, signal)
            return
        }

        process.exit(code ?? 1)
    })

    child.on('error', error => {
        console.error(error.message)
        process.exit(1)
    })
}

run()
