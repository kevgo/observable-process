import * as childProcess from "child_process"
import mergeStream = require("merge-stream")
import * as util from "util"

import { Result } from "./result"
import * as searchableStream from "./searchable-stream"
const delay = util.promisify(setTimeout)

/** Function signature to call when the process has ended */
export type EndedCallback = (result: Result) => void

/** a long-running process whose behavior can be observed at runtime */
export class Process {
  /** the underlying ChildProcess instance */
  childProcess: childProcess.ChildProcess

  /** populated when the process finishes */
  private result: Result | undefined

  /** the STDIN stream of the underlying ChildProcess */
  stdin: NodeJS.WritableStream

  /** searchable STDOUT stream of the underlying ChildProcess */
  stdout: searchableStream.SearchableStream

  /** searchable STDERR stream of the underlying ChildProcess */
  stderr: searchableStream.SearchableStream

  /** searchable combined STDOUT and STDERR stream */
  output: searchableStream.SearchableStream

  /** functions to call when this process ends  */
  private endedCallbacks: Array<EndedCallback>

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
    this.stdout = searchableStream.createSearchableStream(this.childProcess.stdout)
    if (this.childProcess.stderr == null) {
      throw new Error("process.stderr should not be null") // NOTE: this exists only to make the typechecker shut up
    }
    this.stderr = searchableStream.createSearchableStream(this.childProcess.stderr)
    const outputStream = mergeStream(this.childProcess.stdout, this.childProcess.stderr)
    this.output = searchableStream.createSearchableStream(outputStream)
  }

  /** stops the currently running process */
  async kill(): Promise<Result> {
    this.result = {
      exitCode: -1,
      killed: true,
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
  async waitForEnd(): Promise<Result> {
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
