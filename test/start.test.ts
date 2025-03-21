import assert from "node:assert/strict"
import { suite, test } from "node:test"

import { instanceOfFinishedProcess } from "../src/finished-process.js"
import * as observableProcess from "../src/index.js"

suite("start()", function() {
  test("starting a process via an argv array", async function() {
    const observable = observableProcess.start(["node", "-e", "console.log('hello')"])
    const result = await observable.waitForEnd()
    assert.ok(instanceOfFinishedProcess(result))
    assert.equal(result.exitCode, 0)
  })

  test("starting a process via a string", async function() {
    const observable = observableProcess.start("node -e console.log('hello')")
    const result = await observable.waitForEnd()
    assert.ok(instanceOfFinishedProcess(result))
    assert.equal(result.exitCode, 0)
  })

  test("starting processes in the path", async function() {
    const observable = observableProcess.start("node -h")
    const result = await observable.waitForEnd()
    assert.ok(instanceOfFinishedProcess(result))
    assert.equal(result.exitCode, 0)
  })

  test("no command to run", function() {
    assert.throws(function() {
      // @ts-expect-error providing no command to run causes an exception
      observableProcess.start()
    }, new Error("start: no command to execute given"))
  })

  test("wrong argument type", function() {
    assert.throws(function() {
      // @ts-expect-error providing a number as the command to run causes an exception
      observableProcess.start(1)
    }, new Error("you must provide the command to run as a string or string[]"))
  })

  test("providing environment variables", async function() {
    const observable = observableProcess.start(["node", "-e", "console.log('foo:', process.env.foo)"], {
      env: { foo: "bar", PATH: process.env["PATH"] },
    })
    await observable.waitForEnd()
    assert.equal(observable.output.fullText(), "foo: bar\n")
  })
})
