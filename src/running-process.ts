import * as childProcess from "child_process"
import mergeStream from "merge-stream"
import * as util from "util"

import { FinishedProcess } from "./finished-process.js"
import { KilledProcess } from "./killed-process.js"
import * as scanner from "./scanner.js"
const delay = util.promisify(setTimeout)

/** a long-running process whose behavior can be observed at runtime */
export class RunningProcess {
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
    if (this.result) {
      throw new Error("process has already finished and cannot be killed anymore")
    }
    this.result = {
      state: "killed",
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
    return this.childProcess.pid ?? -1
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

  /**
   * Called when the underlying ChildProcess ends.
   * This gets called for natural ends and kills.
   */
  private onClose(exitCode: number): void {
    if (exitCode != null) {
      const finishedProcess: FinishedProcess = {
        exitCode,
        errText: this.stderr.fullText(),
        combinedText: this.output.fullText(),
        state: "finished",
        stdText: this.stdout.fullText(),
      }
      this.result = finishedProcess
    } else {
      const killedProcess: KilledProcess = {
        errText: this.stderr.fullText(),
        combinedText: this.output.fullText(),
        state: "killed",
        stdText: this.stdout.fullText(),
      }
      this.result = killedProcess
    }
    for (const endedCallback of this.endedCallbacks) {
      endedCallback(this.result)
    }
  }
}
