import { ObservableProcess } from "../src/observable-process"
import { strict as assert } from "assert"

describe("constructor", function() {
  it("allows to start a process via an array of arguments", async function() {
    const process = new ObservableProcess({
      commands: ["node", "-e", "console.log('hello')"]
    })
    await process.waitForText("hello")
  })

  it("allows to start a process via a string", async function() {
    const process = new ObservableProcess({
      command: "node -e console.log('hello')"
    })
    await process.waitForText("hello")
  })

  it("starts global processes that are in the path", async function() {
    const process = new ObservableProcess({
      command: "node -h"
    })
    await process.waitForEnd()
    assert.equal(process.exitCode, 0)
  })

  it("starts local processes in the current directory")
})

describe("environment variables", function() {
  it("allows to provide custom environment variables for running processes", async function() {
    const process = new ObservableProcess({
      commands: ["node", "-e", "console.log('foo:', process.env.foo)"],
      env: { foo: "bar" }
    })
    await process.waitForEnd()
    assert.equal(process.fullOutput(), "foo: bar\n")
  })
})
