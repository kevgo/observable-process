/** Provides the results of running the process */
export class Result {
  /** the code with which the process has ended */
  exitCode: number

  /** whether the process was manually terminated by the user */
  killed: boolean

  constructor(exitCode: number, killed: boolean) {
    this.exitCode = exitCode
    this.killed = killed
  }
}
