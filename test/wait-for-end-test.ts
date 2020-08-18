import { strict as assert } from "assert"
import { start } from "../src/start"
import * as util from "util"
const delay = util.promisify(setTimeout)

suite("ObservableProcess.waitForEnd()")

test("process ends before calling it", async function () {
  const observable = start(["node", "-e", "console.log('hello'); process.exit(7)"])
  await delay(50)
  const result = await observable.waitForEnd()
  assert.deepEqual(result.exitCode, 7)
  assert.deepEqual(result.killed, false)
  assert.deepEqual(result.stdText, "hello\n")
  assert.deepEqual(result.errText, "")
  assert.deepEqual(result.combinedText, "hello\n")
})

test("process still running when calling it", async function () {
  const observable = start(["node", "-e", "setTimeout(function() { console.log('finally'); process.exit(8)}, 10)"])
  const result = await observable.waitForEnd()
  assert.equal(result.exitCode, 8)
  assert.equal(result.killed, false)
  assert.equal(result.stdText, "finally\n")
  assert.equal(result.errText, "")
  assert.equal(result.combinedText, "finally\n")
})
