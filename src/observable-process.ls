require! {
  'child_process' : {spawn}
  'events' : EventEmitter
  'extend'
  'merge-stream'
  'path'
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
    options = env: {}
    extend options.env, process.env, @env
    options.cwd = @cwd if @cwd
    @ended = no
    [runnable, ...params] = @_split-command command
    debug "starting '#{runnable}' with arguments '#{params}'"
    @process = spawn runnable, params, options
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


  # Enters the given text into the subprocess.
  # Types the ENTER key automatically.
  enter: (text) ->
    @stdin.write "#{text}\n"


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
  wait: (text, handler, timeout) ->
    @text-stream-search.wait text, handler, timeout


  reset-output-streams: ->
    @text-stream-search.reset!


  _split-command: (command) ->
    if Array.is-array command
      command
    else
      string-argv command



module.exports = ObservableProcess
