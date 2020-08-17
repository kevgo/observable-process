import { strict as assert } from "assert"
import { run } from "../src/observable-process"
import util from "util"
const delay = util.promisify(setTimeout)

suite("ObservableProcess.waitForEnd()")

test("process ends before calling it", async function () {
  const observable = run(["node", "-e", "console.log('hello')"])
  await delay(50)
  const result = await observable.waitForEnd()
  assert.equal(result.exitCode, 0)
})

test("process still running when calling it", async function () {
  const observable = run(["node", "-e", "setTimeout(function() {}, 10)"])
  const result = await observable.waitForEnd()
  assert.equal(result.exitCode, 0)
})
