import { FinishedProcess } from "./finished-process"

/** data about a process that was terminated by the user */
export interface KilledProcess {
  /** combined output from STDOUT and STDERR */
  combinedText: string

  /** full output on the STDERR stream */
  errText: string

  state: "killed"

  /** full output on the STDOUT stream */
  stdText: string
}

export function instanceOfKilledProcess(arg: FinishedProcess | KilledProcess): arg is KilledProcess {
  return arg.state === "killed"
}
