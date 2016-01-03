# Node.js Child Process Observer

> High-level support for spawning, observing, and interacting with child processes in Node.js

[![Circle CI](https://circleci.com/gh/Originate/observable-process.svg?style=shield)](https://circleci.com/gh/Originate/observable-process)


This library provides a high-level API for spawning child processes
and waiting until they output a certain text on the command line.


```javascript
ObservableProcess = require('observable-process');

observer = new ObservableProcess('ls -l');
observer.wait('listening on port 3000', function() {
  // the child process is ready now
});
```



## Related libraries

* [nexpect](https://github.com/nodejitsu/nexpect):
  Allows to define expectations on command output,
  and send it input,
  but doesn't allow to add more listeners to existing processes.
