import { strict as assert } from "assert"

import { start } from "../src/start"

suite("ObservableProcess.spawn()")

test("starting a process via an argv array", async function () {
  const observable = start(["node", "-e", "console.log('hello')"])
  const result = await observable.waitForEnd()
  assert.equal(result.exitCode, 0)
})

test("starting a process via a string", async function () {
  const observable = start("node -e console.log('hello')")
  const result = await observable.waitForEnd()
  assert.equal(result.exitCode, 0)
})

test("starting processes in the path", async function () {
  const observable = start("node -h")
  const result = await observable.waitForEnd()
  assert.equal(result.exitCode, 0)
})

test("no command to run", function () {
  assert.throws(function () {
    // @ts-ignore
    start()
  }, new Error("start: no command to execute given"))
})

test("wrong argument type", function () {
  assert.throws(function () {
    // @ts-ignore
    start(1)
  }, new Error("start: you must provide the command to run as a string or string[]"))
})

test("providing environment variables", async function () {
  const observable = start(["node", "-e", "console.log('foo:', process.env.foo)"], {
    env: { foo: "bar", PATH: process.env.PATH },
  })
  await observable.waitForEnd()
  assert.equal(observable.output.fullText(), "foo: bar\n")
})
