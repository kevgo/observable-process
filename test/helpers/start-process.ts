import { ObservableProcess } from "../../src/observable-process"

export function startNodeProcess(code: string): ObservableProcess {
  return new ObservableProcess({
    commands: ["node", "-e", code],
    stdout: null,
    stderr: null
  })
}
