import { strict as assert } from "assert"
import got from "got"
import * as portFinder from "portfinder"
import { startNodeProcess } from "./helpers/start-node-process"

test("ObservableProcess.kill()", async function () {
  this.timeout(8000)

  // start a long-running process
  const port = await portFinder.getPortPromise()
  const longRunningProcess = startNodeProcess(
    `http = require('http');\
      http.createServer(function(_, res) { res.end('hello') }).listen(${port}, 'localhost');\
      console.log('online')`
  )
  longRunningProcess.stdout.waitForText("online")
  await assertIsRunning(port)

  // kill the process
  const result = await longRunningProcess.kill()

  // verify the process is no longer running
  await assertIsNotRunning(port)
  assert.equal(result.killed, true, "process should be killed")
  assert.equal(result.exitCode, -1)
  assert.equal(result.stdText, "online\n")
  assert.equal(result.errText, "")
  assert.equal(result.combinedText, "online\n")
})

async function assertIsRunning(port: number) {
  await got(`http://localhost:${port}`)
}

async function assertIsNotRunning(port: number) {
  try {
    await got(`http://localhost:${port}`)
  } catch (e) {
    assert.equal(e.code, "ECONNREFUSED")
  }
}
