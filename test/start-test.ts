import { strict as assert } from "assert"
import { createObservableProcess } from "../src/observable-process"

describe(".spawn()", function() {
  it("starts a process via an argv array", async function() {
    const observable = createObservableProcess([
      "node",
      "-e",
      "console.log('hello')"
    ])
    await observable.waitForEnd()
    assert.equal(observable.exitCode, 0)
  })

  it("starts a process via a string", async function() {
    const observable = createObservableProcess("node -e console.log('hello')")
    await observable.waitForEnd()
    assert.equal(observable.exitCode, 0)
  })

  it("starts processes in the path", async function() {
    const observable = createObservableProcess("node -h")
    await observable.waitForEnd()
    assert.equal(observable.exitCode, 0)
  })

  it("throws if it receives no command to run", function() {
    assert.throws(function() {
      // @ts-ignore
      createObservableProcess()
    }, new Error("createObservableProcess: no command to execute given"))
  })

  it("throws if it receives neither a string nor argv array", function() {
    assert.throws(function() {
      // @ts-ignore
      createObservableProcess(1)
    }, new Error(
      "observable.spawn: you must provide the command to run as a string or string[]"
    ))
  })
})

describe("environment variables", function() {
  it("allows to provide custom environment variables for running processes", async function() {
    const observable = createObservableProcess(
      ["node", "-e", "console.log('foo:', process.env.foo)"],
      { env: { foo: "bar", PATH: process.env.PATH } }
    )
    await observable.waitForEnd()
    assert.equal(observable.output.fullText(), "foo: bar\n")
  })
})
