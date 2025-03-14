# ObservableProcess

[![test status](https://github.com/kevgo/observable-process/actions/workflows/test.yml/badge.svg)](https://github.com/kevgo/observable-process/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/kevgo/observable-process/badge.svg?branch=main)](https://coveralls.io/github/kevgo/observable-process?branch=main)
[![install size](https://packagephobia.now.sh/badge?p=observable-process)](https://packagephobia.now.sh/result?p=observable-process)

ObservableProcess enhances the slightly too low-level
[Node.JS ChildProcess](https://nodejs.org/api/child_process.html) model with
functionality to observe the behavior of processes more conveniently. In
particular:

- easy access to the accumulated content of
  [stdout](https://nodejs.org/api/child_process.html#child_process_subprocess_stdout)
  and
  [stderr](https://nodejs.org/api/child_process.html#child_process_subprocess_stderr)
- await content in `stdout` and `stderr`
- combines `stdout` and `stderr` into a new `output` stream
- await the process end
- easier access to the process exit code
- signals whether the process ended naturally or was manually terminated

ObservableProcess is for short-lived processes, for example when testing the
terminal output of applications. Since ObservableProcess stores all output from
the child process in memory, executing long-running processes that produce lots
of output through ObservableProcess will cause high memory consumption.

## Setup

Add this library to your code base:

<pre type="npm/install">
$ npm install observable-process
</pre>

Load this library into your JavaScript code:

```ts
import * as observableProcess from "observable-process"
```

## Starting processes

The best way to provide the command to start is in the form of an `argv` array:

```js
const observable = observableProcess.start(["node", "server.js"])
```

You can also provide the full command line to run as a string:

```js
const observable = observableProcess.start("node server.js")
```

By default, the process runs in the current directory. To set a different
working directory for the subprocess:

```js
const observable = observableProcess.start("node server.js", { cwd: "~/tmp" })
```

You can provide custom environment variables for the process:

```js
const observable = observableProcess.start("node server.js", {
  env: {
    foo: "bar",
    PATH: process.env["PATH"],
  },
})
```

Without an `env` parameter, ObservableProcess uses the environment variables
from the parent process.

## Reading output

The `stdout` and `stderr` variables of an ObservableProcess behave like normal
[readable streams](https://nodejs.org/api/stream.html#stream_readable_streams):

```js
// normal consumption of data from STDOUT via the event stream
observable.stdout.on("data", function() {
  // ...
})
```

They also provide extra functionality to access and search their aggregated
content. To get all content from STDOUT as a string:

```js
const text = observable.stdout.fullText()
```

To wait for text to appear in STDOUT:

```js
const match = await observable.stdout.waitForText("server is online")
// => "server is online"
```

To wait for a regular expression on STDOUT:

```js
const match = await observable.stdout.waitForRegex(/running at port \d+/)
// => "running at port 3000"
```

Comparable functionality is available for `stderr`. ObservableProcess also
provides a new `output` stream with the combined content of STDOUT and STDERR:

```js
observable.output.on("data", function(data) {
  // ...
})
const text = observable.output.fullText()
await observable.output.waitForText("server is online")
const port = await observable.output.waitForRegex(/running at port \d+./)
```

You also get a copy of the process output after it ended (see below).

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

```js
observable.pid()
```

## Stop the process

Wait until the process ends naturally:

```js
const result = await observable.waitForEnd()
assert.equal(result, {
  status: "finished",
  exitCode: 0,
  stdText: "... content from STDOUT ...",
  errText: "... content from STDERR ...",
  combinedText: "... content from both STDOUT and STDERR ...",
})
```

Manually stop the process:

```js
const result = await observable.kill()
assert.equal(result, {
  status: "killed",
  stdText: "... content from STDOUT ...",
  errText: "... content from STDERR ...",
  combinedText: "... content from both STDOUT and STDERR ...",
})
```

## Related libraries

- [nexpect](https://github.com/nodejitsu/nexpect): Allows to define expectations
  on command output, and send it input, but doesn't allow to add more listeners
  to existing long-running processes, which makes declarative testing hard.

## Development

If you want to hack on ObservableProcess:

- run all tests: <code type="npm/script-call">npm run test</code>
- run automated code repair: <code target="npm/script-call">npm run fix</code>

To deploy a new version:

- update the version in `package.json` and commit to `main`
- run <code target="npm/script-call">npm publish</code>
