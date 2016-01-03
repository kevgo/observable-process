# Node.js Child Process Observer

[![Circle CI](https://circleci.com/gh/Originate/observable-process.svg?style=shield)](https://circleci.com/gh/Originate/observable-process)


A high-level API for spawning child processes in Node.js
and waiting until they output a certain text.


```javascript
ObservableProcess = require('observable-process');

observer = new ObservableProcess('my-server --port 3000');
observer.wait('listening on port 3000', function() {
  // the child process is ready now
});
```



## related libraries

* [nexpect](https://github.com/nodejitsu/nexpect):
  Allows to define expectations on command output,
  and send it input,
  but doesn't allow to add more listeners to existing long-running processes.
