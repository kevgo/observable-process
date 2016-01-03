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

  (command, @options) ->
    command-parts = command.split ' '
    @process = spawn(path.join(process.cwd!, head command-parts),
                     tail(command-parts),
                     options)
      ..on 'close', @on-close

    @text-stream-search = new TextStreamSearch @process.stdout


    # whether this process has been officially killed
    # (to avoid unnecessary panic if it ends)
    @killed = no


  kill: ->
    @killed = yes
    @process.kill!


  on-close: (err) ~>
    | @killed  =>  return
    console.log 'PROCESS ENDED' if options?.verbose
    console.log "\nEXIT CODE: #{err}"



  # Calls the given handler when the given text shows up in the output
  wait: (text, handler) ->
    @text-stream-search.wait text, handler



module.exports = ObservableProcess
