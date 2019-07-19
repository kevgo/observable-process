import {
  createObservableProcess,
  ObservableProcess
} from "../../src/observable-process"

export function startNodeProcess(code: string): ObservableProcess {
  return createObservableProcess(["node", "-e", code])
}
