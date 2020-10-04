import { strict as assert } from "assert"

import * as observableProcess from "../src/index"

suite("output", function () {
  test("reading", async function () {
    const process = observableProcess.start([
      "node",
      "-e",
      'process.stdout.write("hello"); process.stderr.write("world")',
    ])
    await process.waitForEnd()
    assert.equal(process.output.fullText(), "helloworld")
  })

  test("waiting for text", async function () {
    const process = observableProcess.start([
      "node",
      "-e",
      'process.stdout.write("hello"); process.stderr.write("world")',
    ])
    const text = await process.output.waitForText("helloworld")
    assert.equal(text, "helloworld")
  })

  test("waiting for text times out", async function () {
    const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 3)"])
    const promise = process.output.waitForText("hello", 1)
    await assert.rejects(promise, new Error('Text "hello" not found within 1 ms. The captured text so far is:\n'))
  })

  test("waiting for regex", async function () {
    const process = observableProcess.start([
      "node",
      "-e",
      'process.stdout.write("hello"); process.stderr.write("world")',
    ])
    const text = await process.output.waitForRegex(/h.+d/)
    assert.equal(text, "helloworld")
  })

  test("waiting for regex times out", async function () {
    const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 3)"])
    const promise = process.output.waitForRegex(/h.+d/, 1)
    await assert.rejects(promise, new Error("Regex /h.+d/ not found within 1 ms. The captured text so far is:\n"))
  })
})
