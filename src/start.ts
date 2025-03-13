import { parseArgsStringToArgv } from "string-argv"

import { RunningProcess } from "./running-process.js"

/** options for start */
export interface StartOptions {
  /** the directory to run the process in */
  cwd?: string

  /** environment variables for the process */
  env?: NodeJS.ProcessEnv
}

/** starts a new ObservableProcess with the given options */
export function start(command: string | string[], options: StartOptions = {}): RunningProcess {
  // determine args
  if (!command) {
    throw new Error("start: no command to execute given")
  }
  let argv: string[] = []
  if (instanceOfString(command)) {
    argv = parseArgsStringToArgv(command)
  } else if (instanceOfArray(command)) {
    argv = command
  } else {
    throw new Error("you must provide the command to run as a string or string[]")
  }
  const [runnable, ...params] = argv
  if (runnable == null) {
    throw new Error("start: no command to execute given")
  }

  // start the process
  return new RunningProcess({
    cwd: options.cwd || process.cwd(),
    env: options.env || process.env,
    params,
    runnable,
  })
}

function instanceOfString(arg: any): arg is string {
  return typeof arg === "string"
}

function instanceOfArray(arg: string | string[]): arg is string[] {
  return Array.isArray(arg)
}
