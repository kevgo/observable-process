import { strict as assert } from "assert"
import { createObservableProcess } from "../src/observable-process"

suite("ObservableProcess.spawn()")

test("starting a process via an argv array", async function () {
  const observable = createObservableProcess(["node", "-e", "console.log('hello')"])
  await observable.waitForEnd()
  assert.equal(observable.exitCode, 0)
})

test("starting a process via a string", async function () {
  const observable = createObservableProcess("node -e console.log('hello')")
  await observable.waitForEnd()
  assert.equal(observable.exitCode, 0)
})

test("starting processes in the path", async function () {
  const observable = createObservableProcess("node -h")
  await observable.waitForEnd()
  assert.equal(observable.exitCode, 0)
})

test("no command to run", function () {
  assert.throws(function () {
    // @ts-ignore
    createObservableProcess()
  }, new Error("createObservableProcess: no command to execute given"))
})

test("wrong argument type", function () {
  assert.throws(function () {
    // @ts-ignore
    createObservableProcess(1)
  }, new Error("observable.spawn: you must provide the command to run as a string or string[]"))
})

test("providing environment variables", async function () {
  const observable = createObservableProcess(["node", "-e", "console.log('foo:', process.env.foo)"], {
    env: { foo: "bar", PATH: process.env.PATH },
  })
  await observable.waitForEnd()
  assert.equal(observable.output.fullText(), "foo: bar\n")
})
