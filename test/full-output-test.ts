import { ObservableProcess } from '../src/observable-process'
import { strict as assert } from 'assert'

describe('full output', function() {
  it('returns the full output received so far', async function() {
    const process = new ObservableProcess({
      commands: ['node', '-e', 'console.log("hello")'],
      stdout: null,
      stderr: null
    })
    await process.waitForText('hello')
    const output = process.fullOutput()
    assert.equal(output, 'hello\n')
  })
})
