import * as childProcess from "child_process"
import mergeStream from "merge-stream"
import stringArgv from "string-argv"
import { createSearchableStream, SearchableStream } from "./searchable-stream"
import util from "util"
import { Result } from "./result"
const delay = util.promisify(setTimeout)

/** The options that can be provided to Spawn */
export interface SpawnOptions {
  cwd?: string
  env?: NodeJS.ProcessEnv
}

/** starts a new ObservableProcess with the given options */
export function createObservableProcess(command: string | string[], args: SpawnOptions = {}) {
  // determine args
  if (!command) {
    throw new Error("createObservableProcess: no command to execute given")
  }
  let argv: string[] = []
  if (typeof command === "string") {
    argv = stringArgv(command)
  } else if (Array.isArray(command)) {
    argv = command
  } else {
    throw new Error("createObservableProcess: you must provide the command to run as a string or string[]")
  }
  const [runnable, ...params] = argv

  // start the process
  return new ObservableProcess({
    cwd: args.cwd || process.cwd(),
    env: args.env || process.env,
    params,
    runnable,
  })
}

/** a long-running process whose behavior can be observed at runtime */
export class ObservableProcess {
  /** indicates whether the process has stopped running */
  ended: boolean

  /** the underlying ChildProcess instance */
  process: childProcess.ChildProcess

  /** indicates whether the process was killed */
  private result: Result | undefined

  /** the STDIN stream of the underlying ChildProcess */
  stdin: NodeJS.WritableStream

  /** searchable STDOUT stream of the underlying ChildProcess */
  stdout: SearchableStream

  /** searchable STDERR stream of the underlying ChildProcess */
  stderr: SearchableStream

  /** searchable combined STDOUT and STDERR stream */
  output: SearchableStream

  /** functions to call when this process ends  */
  private endedListeners: Array<(result: Result) => void>

  constructor(args: { runnable: string; params: string[]; cwd: string; env: NodeJS.ProcessEnv }) {
    this.ended = false
    this.endedListeners = []
    this.process = childProcess.spawn(args.runnable, args.params, {
      cwd: args.cwd,
      env: args.env,
    })
    this.process.on("close", this.onClose.bind(this))
    if (this.process.stdin == null) {
      throw new Error("process.stdin should not be null") // this exists only to make the typechecker shut up
    }
    this.stdin = this.process.stdin
    if (this.process.stdout == null) {
      throw new Error("process.stdout should not be null") // NOTE: this exists only to make the typechecker shut up
    }
    this.stdout = createSearchableStream(this.process.stdout)
    if (this.process.stderr == null) {
      throw new Error("process.stderr should not be null") // NOTE: this exists only to make the typechecker shut up
    }
    this.stderr = createSearchableStream(this.process.stderr)
    const outputStream = mergeStream(this.process.stdout, this.process.stderr)
    this.output = createSearchableStream(outputStream)
  }

  /** stops the currently running process */
  async kill(): Promise<Result> {
    this.result = new Result(-1, true)
    this.process.kill()
    await delay(0)
    return this.result
  }

  /** returns the process ID of the underlying ChildProcess */
  pid() {
    return this.process.pid
  }

  /** returns a promise that resolves when the underlying ChildProcess terminates */
  async waitForEnd(): Promise<Result> {
    if (this.ended) {
      if (!this.result) {
        throw new Error("process ended but no result")
      }
      return this.result
    }
    return new Promise((resolve) => {
      this.endedListeners.push(resolve)
    })
  }

  /** called when the underlying ChildProcess terminates */
  private onClose(exitCode: number) {
    this.ended = true
    this.result = new Result(exitCode, false)
    for (const resolver of this.endedListeners) {
      resolver(this.result)
    }
  }
}
