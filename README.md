# Node.js Child Process Observer

[![Circle CI](https://circleci.com/gh/Originate/observable-process.svg?style=shield)](https://circleci.com/gh/Originate/observable-process)

A high-level API for spawning child processes in Node.js
and waiting until they output a certain text.


```javascript
ObservableProcess = require('observable-process');

observer = new ObservableProcess('my-server --port 3000');
observer.wait('listening on port 3000', function() {
  // the child process says it is ready now
});
```

## Logging the output

* by default the output of the observed process is hidden
* provide the option `verbose: true` to log the output on stdio
* provide custom console streams via the option `console`

```javascript
observer = new ObservableProcess('my-server', { verbose: true });
// output goes to your terminal

observer = new ObservableProcess('my-server', { verbose: true, console: myConsole });
// output goes to your myConsole object
```


## Killing the process

If the process is running, you can kill it via:

```javascript
observer.kill()
```

To let ObservableProcess notify you when a process ended,
provide it a callback via the `onExit` parameter:

```javascript
observer = new ObservableProcess('my-server', onExit: function() {
  // here the server has ended/crashed
});
```


## related libraries

* [nexpect](https://github.com/nodejitsu/nexpect):
  Allows to define expectations on command output,
  and send it input,
  but doesn't allow to add more listeners to existing long-running processes,
  which makes declarative testing hard.
