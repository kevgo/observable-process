require! {
  'child_process' : {spawn}
  'events' : EventEmitter
  'merge-stream'
  'path'
  'prelude-ls' : {head, tail}
  'request'
  'string-argv'
  'text-stream-search' : TextStreamSearch
}
debug = require('debug')('observable-process')


# Runs the given command as a separate, parallel process
# and allows to observe it.
class ObservableProcess extends EventEmitter

  # command - the command to run, including all parameters, as a string
  # options.verbose: whether to log
  #        .stdout: the stdout stream to write output to
  #        .stderr: the stderr stream to write errors to
  (command, {@env, @verbose, @cwd, @stdout, @stderr, @console} = {}) ->
    | @console?  =>  throw new Error 'Deprecated option: console\nPlease use the new options "stdout" and "stderr"'
    @stdout ?= process.stdout
    @stderr ?= process.stderr
    command-parts = if Array.is-array command
      command
    else
      string-argv command
    options = env: process.env
    for key, value of @env
      options.env[key] = value
    if @cwd
      options.cwd = @cwd
      debug "using cwd: #{@cwd}"
    @ended = no
    command = head command-parts
    params = tail command-parts
    debug "starting '#{command}' with arguments '#{params}'"
    @process = spawn command, params, options
      ..on 'close', @on-close

    @text-stream-search = new TextStreamSearch merge-stream(@process.stdout, @process.stderr)

    if @stdout
      @process.stdout.on 'data', (data) ~> @stdout.write data.to-string!
    if @stderr
      @process.stderr.on 'data', (data) ~> @stderr.write data.to-string!

    # indicates whether this process has been officially killed
    # (to avoid unnecessary panic if it is killed)
    @killed = no

    @stdin = @process.stdin


  full-output: ->
    @text-stream-search.full-text!


  kill: ->
    @killed = yes
    @process.kill!


  on-close: (@exit-code) ~>
    @ended = yes
    if @verbose
      @stderr?.write 'PROCESS ENDED\n'
      @stderr?.write "\nEXIT CODE: #{@exit-code}"
    @emit 'ended', @exit-code, @killed


  pid: ->
    @process?.pid


  # Calls the given handler when the given text shows up in the output
  wait: (text, handler) ->
    @text-stream-search.wait text, handler


  reset-stream: ->
    @text-stream-search.reset!

module.exports = ObservableProcess
