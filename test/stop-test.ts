import { strict as assert } from "assert"
import got from "got"
import portFinder from "portfinder"
import { startNodeProcess } from "./helpers/start-node-process"

test("ObservableProcess.waitForEnd()", async function() {
  const process = startNodeProcess("setTimeout(function() {}, 1)")
  await process.waitForEnd()
  assert.equal(process.ended, true)
  assert.equal(process.killed, false)
})

test("ObservableProcess.kill()", async function() {
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
  await longRunningProcess.kill()

  // verify the process is no longer running
  await assertIsNotRunning(port)
  assert.equal(longRunningProcess.ended, true, "process should be ended")
  assert.equal(longRunningProcess.killed, true, "process should be killed")
  assert.equal(longRunningProcess.exitCode, null)
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
