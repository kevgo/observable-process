import * as childProcess from "child_process"
import delay from "delay"
import mergeStream from "merge-stream"
import stringArgv from "string-argv"
import { createSearchableStream, SearchableStream } from "./searchable-stream"

/** The options that can be provided to Spawn */
export interface SpawnOptions {
  cwd?: string
  env?: NodeJS.ProcessEnv
}

/** starts a new ObservableProcess with the given options */
export function createObservableProcess(command: string | string[], args: SpawnOptions = {}) {
  // determine args
  let argv: string[] = []
  if (!command) {
    throw new Error("createObservableProcess: no command to execute given")
  }
  if (typeof command === "string") {
    argv = stringArgv(command)
  } else if (Array.isArray(command)) {
    argv = command
  } else {
    throw new Error("observable.spawn: you must provide the command to run as a string or string[]")
  }
  const [runnable, ...params] = argv

  // start the process
  return new ObservableProcess({
    cwd: args.cwd || process.cwd(),
    env: args.env || process.env,
    params,
    runnable
  })
}

/** a long-running process whose behavior can be observed at runtime */
export class ObservableProcess {
  /** indicates whether the process has stopped running */
  ended: boolean

  /** the code with which the process has ended */
  exitCode: number | null

  /** whether the process was manually terminated by the user */
  killed: boolean

  /** the underlying ChildProcess instance */
  process: childProcess.ChildProcess

  /** the STDIN stream of the underlying ChildProcess */
  stdin: NodeJS.WritableStream

  /** searchable STDOUT stream of the underlying ChildProcess */
  stdout: SearchableStream

  /** searchable STDERR stream of the underlying ChildProcess */
  stderr: SearchableStream

  /** searchable combined STDOUT and STDERR stream */
  output: SearchableStream

  /** functions to call when this process ends  */
  private endedListeners: Array<() => void>

  constructor(args: { runnable: string; params: string[]; cwd: string; env: NodeJS.ProcessEnv }) {
    this.ended = false
    this.killed = false
    this.endedListeners = []
    this.exitCode = null
    this.process = childProcess.spawn(args.runnable, args.params, {
      cwd: args.cwd,
      env: args.env
    })
    this.process.on("close", this.onClose.bind(this))
    if (this.process.stdin == null) {
      throw new Error("process.stdin should not be null")
    }
    this.stdin = this.process.stdin
    if (this.process.stdout == null) {
      throw new Error("process.stdout should not be null")
    }
    this.stdout = createSearchableStream(this.process.stdout)
    if (this.process.stderr == null) {
      throw new Error("process.stderr should not be null")
    }
    this.stderr = createSearchableStream(this.process.stderr)
    const outputStream = mergeStream(this.process.stdout, this.process.stderr)
    this.output = createSearchableStream(outputStream)
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
  private onClose(exitCode: number) {
    this.ended = true
    this.exitCode = exitCode
    for (const resolver of this.endedListeners) {
      resolver()
    }
  }
}
