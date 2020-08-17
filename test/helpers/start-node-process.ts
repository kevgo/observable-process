import { createObservableProcess, RunningProcess } from "../../src/observable-process"

export function startNodeProcess(code: string): RunningProcess {
  return createObservableProcess(["node", "-e", code])
}
