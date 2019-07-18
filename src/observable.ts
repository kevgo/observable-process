import * as childProcess from "child_process"
import delay from "delay"
import mergeStream from "merge-stream"
import stringArgv from "string-argv"
import TextStreamSearch from "text-stream-search"

/** Env is a list of environment variables. */
export type Env = { [key: string]: string }

/** The options that can be provided to Spawn */
export interface SpawnOptions {
  command?: string
  commands?: string[]
  cwd?: string
  env?: Env
  stdin?: NodeJS.WritableStream
  stdout?: NodeJS.ReadableStream
  stderr?: NodeJS.ReadableStream
}
export function spawn(args: SpawnOptions) {
  // determine env
  const env = args.env || {}
  for (const [key, value] of Object.entries(process.env)) {
    if (value != null) {
      env[key] = value
    }
  }

  // determine args
  let argv: Array<string> = []
  if (args.command != null) {
    argv = stringArgv(args.command)
  } else if (args.commands != null) {
    argv = args.commands
  } else {
    throw new Error("you must provide either command or commands")
  }
  const [runnable, ...params] = argv

  // start the process
  return new Process({
    cwd: args.cwd || process.cwd(),
    env,
    params,
    runnable
  })
}

// Runs the given command as a separate, parallel process
// and allows to observe it and interact with it.
export class Process {
  /** indicates whether the process has stopped running */
  ended: boolean

  /** functions to call when this process ends  */
  endedListeners: Array<() => void>

  /** the code with which the process has ended */
  exitCode: number | null

  /** whether the process was manually terminated by the user */
  killed: boolean

  /** the underlying ChildProcess instance */
  process: childProcess.ChildProcess

  /** the STDIN stream of the underlying ChildProcess */
  stdin: NodeJS.WritableStream

  /** the STDOUT stream of the underlying ChildProcess */
  stdout: NodeJS.ReadableStream

  /** the STDERR stream of the underlying ChildProcess */
  stderr: NodeJS.ReadableStream

  /** the combined STDOUT and STDERR streams */
  output: NodeJS.ReadableStream

  /** stream search for the combined output */
  outputSearch: TextStreamSearch

  /** stream search for STDOUT */
  stdoutSearch: TextStreamSearch

  /** stream search for STDERR */
  stderrSearch: TextStreamSearch

  constructor(args: {
    runnable: string
    params: string[]
    cwd: string
    env: Env
  }) {
    this.ended = false
    this.killed = false
    this.endedListeners = []
    this.exitCode = null
    this.process = childProcess.spawn(args.runnable, args.params, {
      cwd: args.cwd,
      env: args.env
    })
    this.process.on("close", this._onClose.bind(this))
    if (this.process.stdin == null) {
      throw new Error("process.stdin should not be null")
    }
    this.stdin = this.process.stdin
    if (this.process.stdout == null) {
      throw new Error("process.stdout should not be null")
    }
    this.stdout = this.process.stdout
    this.stdoutSearch = new TextStreamSearch(this.stdout)
    if (this.process.stderr == null) {
      throw new Error("process.stderr should not be null")
    }
    this.stderr = this.process.stderr
    this.stderrSearch = new TextStreamSearch(this.stderr)
    this.output = mergeStream(this.stdout, this.stderr)
    this.outputSearch = new TextStreamSearch(this.output)
  }

  /** returns the accumulated output of the STDOUT and STDERR streams combined */
  outputText() {
    return this.outputSearch.fullText()
  }

  /** returns the accumulated output of the STDOUT stream */
  stdoutText() {
    return this.stdoutSearch.fullText()
  }

  /** returns the accumulated output of the STDERR stream */
  stderrText() {
    return this.stderrSearch.fullText()
  }

  /** stops the currently running process */
  async kill() {
    this.killed = true
    this.process.kill()
    await delay(0)
  }

  /** returns the process ID of the underlying ChildProcess */
  pid() {
    return this.process.pid
  }

  /** returns a promise that resolves when the underlying ChildProcess terminates */
  waitForEnd(): Promise<void> {
    return new Promise(resolve => {
      this.endedListeners.push(resolve)
    })
  }

  /** called when the underlying ChildProcess terminates */
  _onClose(exitCode: number) {
    this.ended = true
    this.exitCode = exitCode
    for (const resolver of this.endedListeners) {
      resolver()
    }
  }
}
