import { strict as assert } from "assert"
import * as util from "util"

import * as observableProcess from "../src/index"
const delay = util.promisify(setTimeout)

suite("waitForEnd()", function () {
  test("process ends before calling it", async function () {
    const process = observableProcess.start(["node", "-e", "console.log('hello'); process.exit(7)"])
    await delay(50)
    const result = await process.waitForEnd()
    assert.deepEqual(result.exitCode, 7)
    assert.deepEqual(result.killed, false)
    assert.deepEqual(result.stdText, "hello\n")
    assert.deepEqual(result.errText, "")
    assert.deepEqual(result.combinedText, "hello\n")
  })

  test("process still running when calling it", async function () {
    const process = observableProcess.start([
      "node",
      "-e",
      "setTimeout(function() { console.log('finally'); process.exit(8)}, 10)",
    ])
    const result = await process.waitForEnd()
    assert.equal(result.exitCode, 8)
    assert.equal(result.killed, false)
    assert.equal(result.stdText, "finally\n")
    assert.equal(result.errText, "")
    assert.equal(result.combinedText, "finally\n")
  })
})
