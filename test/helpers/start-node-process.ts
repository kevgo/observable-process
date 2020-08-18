import { ObservableProcess } from "../../src/observable-process"
import { start } from "../../src/start"

export function startNodeProcess(code: string): ObservableProcess {
  return start(["node", "-e", code])
}
