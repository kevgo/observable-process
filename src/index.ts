import * as childProcess from "child_process"
import stringArgv from "string-argv"
import mergeStream = require("merge-stream")
import * as util from "util"

import * as scanner from "./scanner"
const delay = util.promisify(setTimeout)

export * as scanner from "./scanner"

/** a long-running process whose behavior can be observed at runtime */
export class Process {
  /** the underlying ChildProcess instance */
  private childProcess: childProcess.ChildProcess

  /** populated when the process finishes */
  private result: FinishedProcess | KilledProcess | undefined

  /** the STDIN stream of the underlying ChildProcess */
  stdin: NodeJS.WritableStream

  /** searchable STDOUT stream of the underlying ChildProcess */
  stdout: scanner.Stream

  /** searchable STDERR stream of the underlying ChildProcess */
  stderr: scanner.Stream

  /** searchable combined STDOUT and STDERR stream */
  output: scanner.Stream

  /** functions to call when this process ends  */
  private endedCallbacks: Array<(result: FinishedProcess | KilledProcess) => void>

  constructor(args: { cwd: string; env: NodeJS.ProcessEnv; params: string[]; runnable: string }) {
    this.endedCallbacks = []
    this.childProcess = childProcess.spawn(args.runnable, args.params, {
      cwd: args.cwd,
      env: args.env,
    })
    this.childProcess.on("close", this.onClose.bind(this))
    if (this.childProcess.stdin == null) {
      throw new Error("process.stdin should not be null") // this exists only to make the typechecker shut up
    }
    this.stdin = this.childProcess.stdin
    if (this.childProcess.stdout == null) {
      throw new Error("process.stdout should not be null") // NOTE: this exists only to make the typechecker shut up
    }
    this.stdout = scanner.wrapStream(this.childProcess.stdout)
    if (this.childProcess.stderr == null) {
      throw new Error("process.stderr should not be null") // NOTE: this exists only to make the typechecker shut up
    }
    this.stderr = scanner.wrapStream(this.childProcess.stderr)
    const outputStream = mergeStream(this.childProcess.stdout, this.childProcess.stderr)
    this.output = scanner.wrapStream(outputStream)
  }

  /** stops the currently running process */
  async kill(): Promise<KilledProcess> {
    this.result = {
      exitCode: -1,
      stdText: this.stdout.fullText(),
      errText: this.stderr.fullText(),
      combinedText: this.output.fullText(),
    }
    this.childProcess.kill()
    await delay(1)
    return this.result
  }

  /** returns the process ID of the underlying ChildProcess */
  pid(): number {
    return this.childProcess.pid
  }

  /** returns a promise that resolves when the underlying ChildProcess terminates */
  async waitForEnd(): Promise<FinishedProcess | KilledProcess> {
    if (this.result) {
      return this.result
    }
    return new Promise((resolve) => {
      this.endedCallbacks.push(resolve)
    })
  }

  /** called when the underlying ChildProcess terminates */
  private onClose(exitCode: number) {
    this.result = {
      exitCode,
      killed: false,
      stdText: this.stdout.fullText(),
      errText: this.stderr.fullText(),
      combinedText: this.output.fullText(),
    }
    for (const endedCallback of this.endedCallbacks) {
      endedCallback(this.result)
    }
  }
}

/** data about a process that has finished naturally */
export interface FinishedProcess {
  /** combined output from STDOUT and STDERR */
  combinedText: string

  /** full output on the STDERR stream */
  errText: string

  /** the code with which the process has ended */
  exitCode: number

  /** full output on the STDOUT stream */
  stdText: string
}

/** data about a process that was terminated by the user */
export interface KilledProcess {
  /** combined output from STDOUT and STDERR */
  combinedText: string

  /** full output on the STDERR stream */
  errText: string

  /** full output on the STDOUT stream */
  stdText: string
}

/** options for start */
export interface StartOptions {
  /** the directory to run the process in */
  cwd?: string

  /** environment variables for the process */
  env?: NodeJS.ProcessEnv
}

/** starts a new ObservableProcess with the given options */
export function start(command: string | string[], options: StartOptions = {}): Process {
  // determine args
  if (!command) {
    throw new Error("start: no command to execute given")
  }
  let argv: string[] = []
  // TODO: instanceOfString
  if (instanceOfString(command)) {
    argv = stringArgv(command)
  } else if (instanceOfArray(command)) {
    argv = command
  } else {
    throw new Error("you must provide the command to run as a string or string[]")
  }
  const [runnable, ...params] = argv

  // start the process
  return new Process({
    cwd: options.cwd || process.cwd(),
    env: options.env || process.env,
    params,
    runnable,
  })
}

function instanceOfString(arg: any): arg is string {
  return typeof arg === "string"
}

function instanceOfArray(arg: string | string[]): arg is string[] {
  return Array.isArray(arg)
}
