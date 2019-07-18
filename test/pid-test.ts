import { startNodeProcess } from "./helpers/start-node-process"
import { strict as assert } from "assert"

describe(".pid()", function() {
  it("returns the process id", async function() {
    const oProcess = startNodeProcess("setTimeout(function() {}, 1)")
    const pid = oProcess.pid()
    assert.equal(typeof pid, "number")
    assert.ok(pid > 0)
    await oProcess.waitForEnd()
  })
})
