require! {
  'child_process' : {spawn}
  'merge-stream'
  'path'
  'prelude-ls' : {head, tail}
  'request'
  'text-stream-search' : TextStreamSearch
}



# Spawns the given command into a separate, parallel process
# and allows to observe it.
class ObservableProcess

  # command - the command to run, including all parameters, as a string
  # options.verbose: whether to log
  #        .console: the console to log to
  (command, {@verbose, @cwd, @console, @on-exit} = {}) ->
    @console ||= console
    command-parts = command.split ' '
    options = {}
    options.cwd = @cwd if @cwd
    @process = spawn(path.join(process.cwd!, head command-parts),
                     tail(command-parts),
                     options)
      ..on 'close', @on-close

    @text-stream-search = new TextStreamSearch @process.stdout

    if @verbose
      @process.stdout.on 'data', (data) ~> @console.log data.to-string!
      @process.stderr.on 'data', (data) ~> @console.error data.to-string!

    # whether this process has been officially killed
    # (to avoid unnecessary panic if it is killed)
    @killed = no


  kill: ->
    @killed = yes
    @process.kill!


  on-close: (err) ~>
    | @killed  =>  return
    if @verbose
      @console?.log 'PROCESS ENDED'
      @console?.log "\nEXIT CODE: #{err}"
    @on-exit?!



  # Calls the given handler when the given text shows up in the output
  wait: (text, handler) ->
    @text-stream-search.wait text, handler



module.exports = ObservableProcess
