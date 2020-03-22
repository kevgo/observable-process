import { strict as assert } from "assert"
import { startNodeProcess } from "./helpers/start-node-process"

suite("ObservableProcess.output")

test("reading", async function () {
  const observable = startNodeProcess('process.stdout.write("hello"); process.stderr.write("world")')
  await observable.waitForEnd()
  assert.equal(observable.output.fullText(), "helloworld")
})

test("waiting for text", async function () {
  const observable = startNodeProcess('process.stdout.write("hello"); process.stderr.write("world")')
  const text = await observable.output.waitForText("helloworld")
  assert.equal(text, "helloworld")
})

test("waiting for text times out", async function () {
  const observable = startNodeProcess("setTimeout(function() {}, 3)")
  const promise = observable.output.waitForText("hello", 1)
  await assert.rejects(promise, new Error('Text "hello" not found within 1 ms. The captured text so far is:\n'))
})

test("waiting for regex", async function () {
  const observable = startNodeProcess('process.stdout.write("hello"); process.stderr.write("world")')
  const text = await observable.output.waitForRegex(/h.+d/)
  assert.equal(text, "helloworld")
})

test("waiting for regex times out", async function () {
  const observable = startNodeProcess("setTimeout(function() {}, 3)")
  const promise = observable.output.waitForRegex(/h.+d/, 1)
  await assert.rejects(promise, new Error("Regex /h.+d/ not found within 1 ms. The captured text so far is:\n"))
})
