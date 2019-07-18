import * as observable from "../../src/observable"

export function startNodeProcess(code: string): observable.Process {
  return observable.spawn({ commands: ["node", "-e", code] })
}
