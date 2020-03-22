import { strict as assert } from "assert"
import { startNodeProcess } from "./helpers/start-node-process"

suite("ObservableProcess.stdout")

test("reading", async function () {
  const observable = startNodeProcess('process.stdout.write("hello"); process.stderr.write("world")')
  await observable.waitForEnd()
  assert.equal(observable.stdout.fullText(), "hello")
})

test("waiting for text", async function () {
  const observable = startNodeProcess('process.stderr.write("hello"); process.stdout.write("world")')
  const text = await observable.stdout.waitForText("world")
  assert.equal(text, "world")
})

test("waiting for text times out", async function () {
  const observable = startNodeProcess("setTimeout(function() {}, 3)")
  const promise = observable.stdout.waitForText("hello", 1)
  await assert.rejects(promise, new Error('Text "hello" not found within 1 ms. The captured text so far is:\n'))
})

test("waiting for regex", async function () {
  const observable = startNodeProcess('process.stderr.write("hello"); process.stdout.write("world")')
  const text = await observable.stdout.waitForRegex(/w.+d/)
  assert.equal(text, "world")
})

test("waiting for regex times out", async function () {
  const observable = startNodeProcess("setTimeout(function() {}, 3)")
  const promise = observable.stdout.waitForRegex(/w.+d/, 1)
  await assert.rejects(promise, new Error("Regex /w.+d/ not found within 1 ms. The captured text so far is:\n"))
})
