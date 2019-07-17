import { ObservableProcess } from '../src/observable-process'
import { strict as assert } from 'assert'

describe('.waitForText()', function() {
  it('returns a promise that resolves when the given text occurs in the command output', async function() {
    const command = 'setTimeout(function() { console.log("hello") }, 1)'
    const process = new ObservableProcess({
      commands: ['node', '-e', command],
      stdout: null,
      stderr: null
    })
    await process.waitForText('hello')
  })

  it('aborts the wait after an optional timeout', async function() {
    const process = new ObservableProcess({
      commands: ['node', '-e', 'setTimeout(function() {}, 10)'],
      stdout: null,
      stderr: null
    })
    const promise = process.waitForText('hello', 1)
    await assert.rejects(
      promise,
      new Error("Expected '' to include string 'hello'")
    )
  })
})
