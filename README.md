# cross-os

[![npm version](https://badge.fury.io/js/cross-os.svg)](https://badge.fury.io/js/cross-os)
[![npm downloads](https://img.shields.io/npm/dm/cross-os.svg)](https://www.npmjs.com/package/cross-os)
[![dependencies](https://david-dm.org/milewski/cross-os.svg)](https://www.npmjs.com/package/cross-os)

OS Specific npm scripts! Ideal for tasks that differs across Operating System Platforms

## Install

```bash
$ npm install cross-os --save-dev
```

## Usage

Add scripts to your package.json like so:
- it supports `darwin`, `freebsd`, `linux`, `sunos` or `win32`

```json
"scripts": {
  "foo": "cross-os bar",
  "bar": {
    "darwin": "echo 'i will only run on Mac'",
    "win32": "echo 'i will only run on Windows'",
    "linux": "echo 'i will only run on Linux'"
  }
}
```
And call it like:
```
npm run foo
```

Alternatively you can also specify scripts on its own section in your `package.json`

```json
"scripts": {
  "foo": "cross-os bar"
}
"cross-os": {
  "bar": {
    "darwin": "echo 'i will only run on Mac'",
    "win32": "echo 'i will only run on Windows'",
    "linux": "echo 'i will only run on Linux'"
  }
}
```

You also can pass args to the underlying script like this:

```json
"scripts": {
  "foo": "cross-os bar -- arg1 arg2"
}
"cross-os": {
  "bar": {
    "darwin": "echo received arg: ",
    "win32": "echo received arg: ",
    "linux": "echo received arg: "
  }
}
```

or directly from the npm run script like this:

```bash
npm run foo -- arg1 arg2
```


## License 

[MIT](LICENSE) © [Rafael Milewski](https://github.com/milewski)
