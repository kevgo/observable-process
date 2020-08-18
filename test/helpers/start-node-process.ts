import { ObservableProcess } from "../../src/observable-process"
import { run } from "../../src/run"

export function startNodeProcess(code: string): ObservableProcess {
  return run(["node", "-e", code])
}
