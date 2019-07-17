import { strict as assert } from 'assert'
import { startProcess } from './helpers/start-process'

describe('.waitForText()', function() {
  it('returns a promise that resolves when the given text occurs in the command output', async function() {
    const process = startProcess(
      'setTimeout(function() { console.log("hello") }, 1)'
    )
    await process.waitForText('hello')
  })

  it('aborts the wait after an optional timeout', async function() {
    const process = startProcess('setTimeout(function() {}, 10)')
    const promise = process.waitForText('hello', 1)
    await assert.rejects(
      promise,
      new Error("Expected '' to include string 'hello'")
    )
  })
})
