import { strict as assert } from "assert"
import { run } from "../src/run"
import util from "util"
const delay = util.promisify(setTimeout)

suite("ObservableProcess.waitForEnd()")

test("process ends before calling it", async function () {
  const observable = run(["node", "-e", "console.log('hello')"])
  await delay(50)
  const result = await observable.waitForEnd()
  assert.deepEqual(result, {
    exitCode: 0,
    killed: false,
    stdOutput: "hello\n",
    errOutput: "",
    combinedOutput: "hello\n",
  })
})

test("process still running when calling it", async function () {
  const observable = run(["node", "-e", "setTimeout(function() { console.log('finally')}, 10)"])
  const result = await observable.waitForEnd()
  assert.equal(result.exitCode, 0)
  assert.equal(result.killed, false)
  assert.equal(result.stdOutput, "finally\n")
  assert.equal(result.errOutput, "")
  assert.equal(result.combinedOutput, "finally\n")
})
