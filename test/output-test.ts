import { ObservableProcess } from "../src/observable-process"
import { strict as assert } from "assert"
import { startNodeProcess } from "./helpers/start-process"

describe(".fullOutput()", function() {
  it("returns the full output received from the process", async function() {
    const process = startNodeProcess('console.log("hello")')
    await process.waitForText("hello")
    assert.equal(process.fullOutput(), "hello\n")
  })
})

describe("output", function() {
  it("provides the accumulated output")
  it("allows to clear all output accumulated so far")
  it("pipes the output to the provided custom streams", async function() {
    // run a process that prints to both STDOUT and STDERR
    let stdOutText = ""
    let stdErrText = ""
    this.process = new ObservableProcess({
      commands: [
        "node",
        "-e",
        "console.log('normal output');\
         console.error('error output')"
      ],
      stdout: {
        write: (text: string) => {
          stdOutText += text
          return false
        }
      },
      stderr: {
        write: text => {
          stdErrText += text
          return false
        }
      }
    })
    await this.process.waitForEnd()

    // verify the piped output
    assert.equal(stdOutText, "normal output\n")
    assert.equal(stdErrText, "error output\n")
  })
})

describe("verbose mode", function() {
  it("adds information about the process health to the error stream", async function() {
    let stdErrContent = "" // this variable contains the STDERR output
    const process = new ObservableProcess({
      commands: [
        "node",
        "-e",
        "console.log('normal output');\
         console.error('error output')"
      ],
      verbose: true,
      stderr: {
        write: (text: string) => {
          stdErrContent += text
          return false
        }
      }
    })
    await process.waitForEnd()
    assert.ok(stdErrContent.includes("PROCESS ENDED"))
    assert.ok(stdErrContent.includes("EXIT CODE: 0"))
  })

  it("does not add information when disabled", async function() {
    let stdErrContent = "" // this variable contains the STDERR output
    const process = new ObservableProcess({
      commands: [
        "node",
        "-e",
        "console.log('normal output');\
         console.error('error output')"
      ],
      verbose: false,
      stderr: {
        write: (text: string) => {
          stdErrContent += text
          return false
        }
      }
    })
    await process.waitForEnd()
    assert.ok(!stdErrContent.includes("PROCESS ENDED"))
    assert.ok(!stdErrContent.includes("EXIT CODE: 0"))
  })
})

describe(".waitForText()", function() {
  it("returns a promise that resolves when the given text occurs in the command output", async function() {
    const process = startNodeProcess(
      'setTimeout(function() { console.log("hello") }, 1)'
    )
    await process.waitForText("hello")
  })

  it("aborts the wait after an optional timeout", async function() {
    const process = startNodeProcess("setTimeout(function() {}, 10)")
    const promise = process.waitForText("hello", 1)
    await assert.rejects(
      promise,
      new Error("Expected '' to include string 'hello'")
    )
  })
})
