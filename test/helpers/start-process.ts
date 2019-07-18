import { ObservableProcess } from "../../src/observable-process"

export function startProcess(code: string): ObservableProcess {
  return new ObservableProcess({
    commands: ["node", "-e", code],
    stdout: null,
    stderr: null
  })
}
