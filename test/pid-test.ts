import { strict as assert } from "assert"
import { startNodeProcess } from "./helpers/start-node-process"

test("ObservableProcess.pid()", async function() {
  const oProcess = startNodeProcess("setTimeout(function() {}, 1)")
  const pid = oProcess.pid()
  assert.equal(typeof pid, "number")
  assert.ok(pid > 0)
  await oProcess.waitForEnd()
})
