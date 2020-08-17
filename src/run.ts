import stringArgv from "string-argv"
import { RunningProcess } from "./running-process"

/** The options that can be provided to Spawn */
export interface SpawnOptions {
  cwd?: string
  env?: NodeJS.ProcessEnv
}

/** starts a new ObservableProcess with the given options */
export function run(command: string | string[], args: SpawnOptions = {}) {
  // determine args
  if (!command) {
    throw new Error("run: no command to execute given")
  }
  let argv: string[] = []
  if (typeof command === "string") {
    argv = stringArgv(command)
  } else if (Array.isArray(command)) {
    argv = command
  } else {
    throw new Error("run: you must provide the command to run as a string or string[]")
  }
  const [runnable, ...params] = argv

  // start the process
  return new RunningProcess({
    cwd: args.cwd || process.cwd(),
    env: args.env || process.env,
    params,
    runnable,
  })
}
