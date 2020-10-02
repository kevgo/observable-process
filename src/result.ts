/** Provides the results of running the process */
export interface Result {
  /** combined output from STDOUT and STDERR */
  combinedText: string

  /** full output on the STDERR stream */
  errText: string

  /** the code with which the process has ended */
  exitCode: number

  /** whether the process was manually terminated by the user */
  killed: boolean

  /** full output on the STDOUT stream */
  stdText: string
}
