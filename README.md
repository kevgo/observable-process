# ObservableProcess

[![CircleCI](https://circleci.com/gh/kevgo/observable-process/tree/master.svg?style=shield)](https://circleci.com/gh/kevgo/observable-process/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/kevgo/observable-process/badge.svg?branch=master)](https://coveralls.io/github/kevgo/observable-process?branch=master)

ObservableProcess decorates the low-level
[Node.JS ChildProcess](https://nodejs.org/api/child_process.html) model with
functionality to observe the behavior of long-running processes more
conveniently. In particular:

- easier access to the complete textual content of the
  [stdout](https://nodejs.org/api/child_process.html#child_process_subprocess_stdout)
  and
  [stderr](https://nodejs.org/api/child_process.html#child_process_subprocess_stderr)
  streams
- augments `stdout` and `stderr` with methods to search for textual content
- create a new `output` stream that combines `stdout` and `stderr`
- await the process end
- easier access to the process exit code
- signals whether the process ended naturally or was manually terminated

This is helpful in many situations, for example in testing.

## Setup

Add this library to your code base:

```shell
$ npm install observable-process
```

Load this library into your JavaScript code:

```js
const { createObservableProcess } = require("observable-process")
```

&ndash; or &ndash;

```ts
import { createObservableProcess } from "observable-process"
```

## Starting processes

The best (most idiot-proof) way to start a subprocess is by providing the argv
array:

```js
const myProcess = observable.spawn(["node", "server.js"])
```

You can also provide the command line expression to run as a string:

```js
const myProcess = observable.spawn("node server.js")
```

By default, the process runs in the current directory. To set the different
working directory for the subprocess:

```js
const myProcess = observable.spawn("node server.js", { cwd: "~/tmp" })
```

You can provide custom environment variables for the process:

```js
const myProcess = observable.spawn("node server.js", {
  env: { foo: "bar" }
})
```

## Reading output from the process

The observable process collects the output emitted by the ChildProcess through
the STDOUT and STDERR streams:

```js
// access the combined content of STDOUT and STDERR
const text = myProcess.outputText() // what the process has sent to STDOUT and STDERR so far
await myProcess.waitForOutputText("server is online") // wait for text is the combined output
const port = await myProcess.waitForOutputRegex(/running at port \d+./) // wait for a regex in the combined output

// access STDOUT content
const text = myProcess.stdoutText() // what the process has sent to STDOUT so far
await myProcess.waitForStdoutText("server is online") // wait for text in the STDOUT stream
const port = await myProcess.waitForStdoutRegex(/running at port \d+./) // wait for a regex in the STDOUT stream

// access STDERR content
const text = myProcess.stderrText() // what the process has sent to STDERR so far
await myProcess.waitForStderrText("server is online") // wait for text is the STDERR stream
const port = await myProcess.waitForStderrRegex(/running at port \d+./) // wait for a regex in the STDERR stream
```

You can also access the low-level Node.JS streams directly:

```js
myProcess.output.on('data', function(data) {...})  // combined STDOUT and STDERR stream
myProcess.stdout.on('data', function(data) {...})  // the STDOUT stream
myProcess.stderr.on('data', function(data) {...})  // the STDERR stream
```

## Sending input to the process

You can interact with the STDIN instance of the underlying
[ChildProcess](https://nodejs.org/api/child_process.html) which the
ObservableProcess exposes.

```js
myProcess.stdin.write("my input\n")
myProcess.stdin.end()
```

## Get the process id

```
myProcess.pid()
```

## Stop the process

You can manually stop a running process via:

```js
await myProcess.kill()
```

This sets the `killed` property on the ObservableProcess instance, which allows
to distinguish manually terminated processes from naturally ended ones. To let
ObservableProcess notify you when a process ended:

```js
const exitCode = await myProcess.waitForEnd()
```

or in the background:

```js
myProcess.waitForEnd().then(...)
```

The exit code is available at the process object:

```js
myProcess.exitCode
```

## Related libraries

- [nexpect](https://github.com/nodejitsu/nexpect): Allows to define expectations
  on command output, and send it input, but doesn't allow to add more listeners
  to existing long-running processes, which makes declarative testing hard.

## Development

- run all tests: `make test`
- run unit tests: `make unit`
- run linters: `make lint`
- run automated code repair: `make fix`
- see all make commands: `make help`

To deploy a new version:

- update the version in `package.json` and commit to `master`
- run `npm publish`
