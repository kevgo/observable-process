# High-level, interactive, child process runner for Node.JS

[![Circle CI](https://circleci.com/gh/Originate/observable-process.svg?style=shield)](https://circleci.com/gh/Originate/observable-process)
[![Dependency Status](https://david-dm.org/originate/observable-process.svg)](https://david-dm.org/originate/observable-process)
[![devDependency Status](https://david-dm.org/originate/observable-process/dev-status.svg)](https://david-dm.org/originate/observable-process#info=devDependencies)


High-level support for running, observing, and interacting with child processes
in Node.js


```javascript
ObservableProcess = require('observable-process')
process = new ObservableProcess('my-server --port 3000')
```

You can also provide the process to run as an _argv_ array:

```javascript
process = new ObservableProcess(['my-server', '--port', '3000'])
```


## Set the working directory of the subshell

```javascript
process = new ObservableProcess('my-server', { cwd: '~/tmp' })
```


## Set environment variables in the subshell


```javascript
process = new ObservableProcess('my-server', { env: { foo: 'bar' } })
```

## Waiting for output

You can be notified when the process prints given text on the console:

```javascript
process.wait('listening on port 3000', function() {
  // this method runs after the process prints "listening on port 3000"
});
```

This is useful for waiting until slow-starting services are fully booted up.


## Configure console output

By default the output of the observed process is printed on the console.
To disable logging:

```js
process = new ObservableProcess('my-server', { console: false });
```

You can also customize logging by providing a custom `console` object
(which needs to have the method `log`):

```javascript
myConsole = {
  log: (text) => { file.write(text) }
}
process = new ObservableProcess('my-server', { console: myConsole })
```

You can use [dim-console](https://github.com/kevgo/dim-console-node)
to print output from the subshell dimmed,
so that it is easy to distinguish from output of the main thread.

```javascript
dimConsole = require('dim-console')
process = new ObservableProcess('my-server', { console: dimConsole.console })
```

To get more detailed output (including lifecycle events of the subshell):

```javascript
process = new ObservableProcess('my-server', { verbose: true })
```


## Kill the process

If the process is running, you can kill it via:

```javascript
process.kill()
```

This sets the `killed` property on the ObservableProcess instance,
so that manual kills can be distinguished from crashes.

To let ObservableProcess notify you when a process ended,
subscribe to the `ended` event:

```javascript
process.on 'ended', (exitCode, killed) => {
  // the process has ended here
  // you can also access the exit code via process.exitCode
}
```

## Get the process id

```
process.pid()
```


## related libraries

* [nexpect](https://github.com/nodejitsu/nexpect):
  Allows to define expectations on command output,
  and send it input,
  but doesn't allow to add more listeners to existing long-running processes,
  which makes declarative testing hard.
