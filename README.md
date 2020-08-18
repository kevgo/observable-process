# ObservableProcess

[![CircleCI](https://circleci.com/gh/kevgo/observable-process/tree/master.svg?style=shield)](https://circleci.com/gh/kevgo/observable-process/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/kevgo/observable-process/badge.svg?branch=master)](https://coveralls.io/github/kevgo/observable-process?branch=master)
[![install size](https://packagephobia.now.sh/badge?p=observable-process)](https://packagephobia.now.sh/result?p=observable-process)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/kevgo/observable-process.svg)](https://lgtm.com/projects/g/kevgo/observable-process/context:javascript)

ObservableProcess enhances the slightly too low-level
[Node.JS ChildProcess](https://nodejs.org/api/child_process.html) model with
functionality to observe the behavior of processes more conveniently. In
particular:

- easier access to the textual content of the
  [stdout](https://nodejs.org/api/child_process.html#child_process_subprocess_stdout)
  and
  [stderr](https://nodejs.org/api/child_process.html#child_process_subprocess_stderr)
  streams
- augments `stdout` and `stderr` with methods to wait for textual content
- create a new `output` stream that combines `stdout` and `stderr`
- ability to `await` the process end
- easier access to the process exit code
- signals whether the process ended naturally or was manually terminated

This is useful for example when testing the terminal output of applications or
waiting until a server has fully booted up. Executing long-running processes
that produce lots of output through ObservableProcess will cause high memory
consumption because it stores all the terminal output in RAM.

## Setup

Add this library to your code base:

```shell
$ npm install observable-process
```

Load this library into your JavaScript code:

```js
const { start } = require("observable-process")
```

or

```ts
import { start } from "observable-process"
```

## Starting processes

The best way to provide the command to start is in the form of an argv array:

```js
const observable = start(["node", "server.js"])
```

You can also provide the full command line to run as a string:

```js
const observable = start("node server.js")
```

By default, the process runs in the current directory. To set the different
working directory for the subprocess:

```js
const observable = start("node server.js", { cwd: "~/tmp" })
```

You can provide custom environment variables for the process:

```js
const observable = start("node server.js", {
  env: {
    foo: "bar",
    PATH: process.env.PATH,
  },
})
```

Without a custom `env` parameter, ObservableProcess uses the environment
variables from the parent process.

## Reading output

The `stdout` and `stderr` variables of an ObservableProcess behave like normal
[readable streams](https://nodejs.org/api/stream.html#stream_readable_streams)
and provide extra functionality to access and search their content while the
process runs.

```js
// normal access to STDOUT
observable.stdout.on("data", function () {
  // ...
})

// get all content from STDOUT as a string
const text = observable.stdout.fullText()

// wait for text to appear in STDOUT
await observable.stdout.waitForText("server is online")

// wait for a regex on STDOUT
const port = await observable.stdout.waitForRegex(/running at port \d+./)
// => "running at port 3000."
```

Comparable functionality is available for STDERR. ObservableProcess also creates
a new `output` stream with the combined content of STDOUT and STDERR:

```js
observable.output.on("data", function (data) {
  // ...
})
const text = observable.output.fullText()
await observable.output.waitForText("server is online")
const port = await observable.output.waitForRegex(/running at port \d+./)
```

The [Result](src/result.ts) instance you get when the process ends also contains
the full content of the output streams:

```js
const result = observable.waitForEnd()
assert.equal(result, {
  exitCode: 0,
  killed: false,
  stdText: "... content from STDOUT ...",
  errText: "... content from STDERR ...",
  combinedText: "... content from both STDOUT and STDERR ...",
})
```

## Sending input to the process

ObservableProcess exposes the
[stdin](https://nodejs.org/api/child_process.html#child_process_subprocess_stdin)
stream of its underlying
[ChildProcess](https://nodejs.org/api/child_process.html):

```js
observable.stdin.write("my input\n")
observable.stdin.end()
```

## Get the process id

```
observable.pid()
```

## Stop the process

To let ObservableProcess notify you when a process ended:

```js
const result = await observable.waitForEnd()
```

You can also listen to this in the background:

```js
observable.waitForEnd().then(function () {
  // do somehing here
})
```

The exit code is available via an attribute:

```js
observable.exitCode
```

You can also manually stop a running process via:

```js
const result = await observable.kill()
```

## Related libraries

- [nexpect](https://github.com/nodejitsu/nexpect): Allows to define expectations
  on command output, and send it input, but doesn't allow to add more listeners
  to existing long-running processes, which makes declarative testing hard.

## Development

If you want to hack on ObservableProcess:

- run all tests: `make test`
- run automated code repair: `make fix`
- see all make commands: `make help`

To deploy a new version:

- update the version in `package.json` and commit to `master`
- run `npm publish`
