import { RunningProcess } from "../../src/running-process"
import { run } from "../../src/run"

export function startNodeProcess(code: string): RunningProcess {
  return run(["node", "-e", code])
}
