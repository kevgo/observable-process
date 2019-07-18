import * as childProcess from 'child_process'
import deb from 'debug'
import delay from 'delay'
import extend from 'extend'
import mergeStream from 'merge-stream'
import stringArgv from 'string-argv'
import TextStreamSearch from 'text-stream-search'
import { Env } from './env'
import { EndedNotification } from './ended-notification'
import { WriteStream } from './write-stream'

const debug = deb('observable-process')

// Runs the given command as a separate, parallel process
// and allows to observe it and interact with it.
class ObservableProcess {
  cwd: string
  ended: boolean
  endedListeners: Array<(EndedNotification) => void>
  env: Env
  exitCode: number
  killed: boolean
  process: childProcess.ChildProcess
  stdout: WriteStream
  stderr: WriteStream
  stdin: NodeJS.WritableStream
  textStreamSearch: TextStreamSearch
  verbose: boolean

  constructor(args: {
    command?: string
    commands?: string[]
    env?: Env
    verbose?: boolean
    cwd?: string
    stdout?: WriteStream | null
    stderr?: WriteStream | null
  }) {
    this.verbose = args.verbose || false
    this.cwd = args.cwd != null ? args.cwd : process.cwd()
    this.stdout = args.stdout || process.stdout
    this.stderr = args.stderr || process.stderr
    this.ended = false
    this.endedListeners = []
    this.env = args.env || {}
    this.exitCode = -1
    this.killed = false

    const [runnable, params] = this.determineRunnable(
      args.command,
      args.commands
    )
    debug(`starting '${runnable}' with arguments [${params.join(',')}]`)
    this.process = childProcess.spawn(runnable, params, this.spawnOptions())
    this.process.on('close', this._onClose.bind(this))
    if (this.process.stdin == null) {
      throw new Error('process.stdin should not be null')
    }
    this.stdin = this.process.stdin
    this.textStreamSearch = this.createStdOutErrStreamSearch()
    this.forwardStreams()
  }

  // Returns a TextStream instance that listens on both stdout and stderr
  private createStdOutErrStreamSearch(): TextStreamSearch {
    return new TextStreamSearch(
      mergeStream(
        this.process.stdout as NodeJS.ReadableStream,
        this.process.stderr as NodeJS.ReadableStream
      )
    )
  }

  // Forwards output streams
  private forwardStreams() {
    if (this.stdout && this.process.stdout) {
      this.process.stdout.on('data', data => {
        this.stdout.write(data.toString())
      })
    }
    if (this.stderr && this.process.stderr) {
      this.process.stderr.on('data', data => {
        this.stderr.write(data.toString())
      })
    }
  }

  // Determines the process name and parameters to run
  private determineRunnable(
    command: string | undefined,
    commands: string[] | undefined
  ): [string, string[]] {
    let runnable = ''
    let params: Array<string> = []
    if (command != null) {
      ;[runnable, ...params] = this._splitCommand(command)
    }
    if (commands != null) {
      runnable = commands[0]
      params = commands.splice(1)
    }
    return [runnable, params]
  }

  // Returns the options with which the subprocess is going to be spawned
  private spawnOptions(): childProcess.SpawnOptions {
    const result = {
      env: {},
      cwd: this.cwd
    }
    extend(result.env, process.env, this.env)
    return result
  }

  fullOutput() {
    return this.textStreamSearch.fullText()
  }

  async kill() {
    debug('killing the process')
    this.killed = true
    this.process.kill()
    await delay(0)
  }

  // notifies all registered listeners that this process has ended
  notifyEnded() {
    for (let resolver of this.endedListeners) {
      resolver({ exitCode: this.exitCode, killed: this.killed })
    }
  }

  _onClose(exitCode: number) {
    debug(`process has ended with code ${exitCode}`)
    this.exitCode = exitCode
    this.ended = true
    if (this.verbose) {
      if (this.stderr) this.stderr.write('PROCESS ENDED\n')
      if (this.stderr) this.stderr.write(`\nEXIT CODE: ${this.exitCode}`)
    }
    this.notifyEnded()
  }

  pid() {
    return this.process ? this.process.pid : -1
  }

  waitForEnd(): Promise<EndedNotification> {
    return new Promise(resolve => {
      this.endedListeners.push(resolve)
    })
  }

  // Calls the given handler when the given text shows up in the output
  async waitForText(text: string, timeout?: number) {
    await this.textStreamSearch.waitForText(text, timeout)
  }

  resetOutputStreams() {
    this.textStreamSearch.reset()
  }

  _splitCommand(command: string | Array<string>): Array<string> {
    if (Array.isArray(command)) {
      return command
    } else {
      return stringArgv(command)
    }
  }
}

export { Env, EndedNotification, WriteStream, ObservableProcess }
