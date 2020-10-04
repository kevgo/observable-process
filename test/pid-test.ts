import { strict as assert } from "assert"

import * as observableProcess from "../src/index"

suite("pid()", function () {
  test("a running process", async function () {
    const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 1)"])
    const pid = process.pid()
    assert.equal(typeof pid, "number")
    assert.ok(pid > 0)
    await process.waitForEnd()
  })
})
