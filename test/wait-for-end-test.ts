import { strict as assert } from "assert"
import { createObservableProcess } from "../src/observable-process"
import delay from "delay"

suite("ObservableProcess.waitForEnd()")

test("process ends before calling it", async function () {
  const observable = createObservableProcess(["node", "-e", "console.log('hello')"])
  await delay(50)
  await observable.waitForEnd()
  assert.equal(observable.exitCode, 0)
})
