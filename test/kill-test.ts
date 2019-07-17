import { startProcess } from './helpers/start-process'
import { strict as assert } from 'assert'
import delay from 'delay'
import portFinder from 'portfinder'
import got from 'got'

describe('.kill()', function() {
  it('stops the running process', async function() {
    this.timeout(8000)

    // start a long-running process
    const port = await portFinder.getPortPromise()
    const longRunningProcess = startProcess(`
http = require('http')
http.createServer(function(_, res) { res.end('hello') }).listen(${port}, 'localhost')
console.log('online')`)
    longRunningProcess.waitForText('online')
    await assertIsRunning(port)

    // kill the process
    longRunningProcess.kill()
    await delay(0)

    // verify it is no longer running
    await assertIsNotRunning(port)
    assert.equal(longRunningProcess.ended, true, 'process should be ended')
    assert.equal(longRunningProcess.killed, true, 'process should be killed')
    assert.equal(longRunningProcess.exitCode, null)
  })
})

async function assertIsRunning(port: number) {
  await got(`http://localhost:${port}`)
}

async function assertIsNotRunning(port: number) {
  try {
    await got(`http://localhost:${port}`)
  } catch (e) {
    assert.equal(e.code, 'ECONNREFUSED')
  }
}
