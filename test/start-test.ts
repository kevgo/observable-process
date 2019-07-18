import * as observable from "../src/observable"
import { strict as assert } from "assert"

describe(".spawn()", function() {
  it("starts a process via an argv array", async function() {
    const oProcess = observable.spawn({
      commands: ["node", "-e", "console.log('hello')"]
    })
    await oProcess.waitForEnd()
    assert.equal(oProcess.exitCode, 0)
  })

  it("starts a process via a string", async function() {
    const process = observable.spawn({
      command: "node -e console.log('hello')"
    })
    await process.waitForEnd()
    assert.equal(process.exitCode, 0)
  })

  it("starts processes in the path", async function() {
    const process = observable.spawn({
      command: "node -h"
    })
    await process.waitForEnd()
    assert.equal(process.exitCode, 0)
  })
})

describe("environment variables", function() {
  it("allows to provide custom environment variables for running processes", async function() {
    const process = observable.spawn({
      commands: ["node", "-e", "console.log('foo:', process.env.foo)"],
      env: { foo: "bar" }
    })
    await process.waitForEnd()
    assert.equal(process.outputText(), "foo: bar\n")
  })
})
