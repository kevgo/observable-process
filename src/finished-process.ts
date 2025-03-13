import { KilledProcess } from "./killed-process.js"

/** data about a process that has finished naturally */
export interface FinishedProcess {
  /** combined output from STDOUT and STDERR */
  combinedText: string

  /** full output on the STDERR stream */
  errText: string

  /** the code with which the process has ended */
  exitCode: number

  state: "finished"

  /** full output on the STDOUT stream */
  stdText: string
}

export function instanceOfFinishedProcess(arg: FinishedProcess | KilledProcess): arg is FinishedProcess {
  return arg.state === "finished"
}
