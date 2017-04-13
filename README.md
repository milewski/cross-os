# cross-os

[![Build Status](https://travis-ci.org/Milewski/cross-os.svg?branch=master)](https://travis-ci.org/Milewski/cross-os)
[![npm version](https://badge.fury.io/js/cross-os.svg)](https://badge.fury.io/js/cross-os)
[![npm downloads](https://img.shields.io/npm/dm/cross-os.svg)](https://www.npmjs.com/package/cross-os)
[![dependencies](https://david-dm.org/Milewski/cross-os.svg)](https://www.npmjs.com/package/cross-os)

OS Specific npm scripts!, ideally for tasks that differs across Operating System platforms

## Install

```bash
$ npm install cross-os --save
```

## Usage

Add scripts to your package.json like so:
- it supports `darwin`, `freebsd`, `linux`, `sunos` or `win32`

```json
"scripts": {
  "foo": "os-script fight",
  "fight": {
    "darwin": "echo 'i make the product that the artist chooses' && echo 'and the GUI that Melinda uses'",
    "win32": "echo 'fine, you wanna be like that, die then.'",
    "linux": "echo 'i stomp on a mac and a PC too, i\'m a Linux bitch, i thought you both GNU",
  }
}
```
And call it like:
```
npm run foo
```

## License 

[MIT](LICENSE)
