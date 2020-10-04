import { strict as assert } from "assert"
import got from "got"
import * as portFinder from "portfinder"

import * as observableProcess from "../src/index"

suite("kill()", function () {
  test("a running process", async function () {
    this.timeout(8000)

    // start a long-running process
    const port = await portFinder.getPortPromise()
    const process = observableProcess.start([
      "node",
      "-e",
      `http = require('http');\
      http.createServer(function(_, res) { res.end('hello') }).listen(${port}, 'localhost');\
      console.log('online')`,
    ])
    await process.stdout.waitForText("online")
    await assertIsRunning(port)

    // kill the process
    const result = await process.kill()

    // verify the process is no longer running
    await assertIsNotRunning(port)
    assert.equal(result.killed, true, "process should be killed")
    assert.equal(result.exitCode, -1)
    assert.equal(result.stdText, "online\n")
    assert.equal(result.errText, "")
    assert.equal(result.combinedText, "online\n")
  })
})

test("killing an already exited process")

async function assertIsRunning(port: number) {
  await got(`http://localhost:${port}`)
}

async function assertIsNotRunning(port: number) {
  try {
    await got(`http://localhost:${port}`)
  } catch (e) {
    assert.equal(e.code, "ECONNREFUSED")
    return
  }
  assert.fail("should not reach this")
}
