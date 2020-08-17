import { run, RunningProcess } from "../../src/observable-process"

export function startNodeProcess(code: string): RunningProcess {
  return run(["node", "-e", code])
}
