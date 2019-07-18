import { startNodeProcess } from "./helpers/start-process"
import { strict as assert } from "assert"

describe(".pid()", function() {
  it("returns the process id", function() {
    const process = startNodeProcess("setTimeout(function() {}, 1)")
    const pid = process.pid()
    assert.equal(typeof pid, "number")
    assert.ok(pid > 0)
  })
})
