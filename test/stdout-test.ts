import { strict as assert } from "assert"

import * as observableProcess from "../src/index"

suite("ObservableProcess.stdout")

test("reading", async function () {
  const process = observableProcess.start([
    "node",
    "-e",
    'process.stdout.write("hello"); process.stderr.write("world")',
  ])
  await process.waitForEnd()
  assert.equal(process.stdout.fullText(), "hello")
})

test("waiting for text", async function () {
  const process = observableProcess.start([
    "node",
    "-e",
    'process.stderr.write("hello"); process.stdout.write("world")',
  ])
  const text = await process.stdout.waitForText("world")
  assert.equal(text, "world")
})

test("waiting for text times out", async function () {
  const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 3)"])
  const promise = process.stdout.waitForText("hello", 1)
  await assert.rejects(promise, new Error('Text "hello" not found within 1 ms. The captured text so far is:\n'))
})

test("waiting for regex", async function () {
  const process = observableProcess.start([
    "node",
    "-e",
    'process.stderr.write("hello"); process.stdout.write("world")',
  ])
  const text = await process.stdout.waitForRegex(/w.+d/)
  assert.equal(text, "world")
})

test("waiting for regex times out", async function () {
  const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 3)"])
  const promise = process.stdout.waitForRegex(/w.+d/, 1)
  await assert.rejects(promise, new Error("Regex /w.+d/ not found within 1 ms. The captured text so far is:\n"))
})
