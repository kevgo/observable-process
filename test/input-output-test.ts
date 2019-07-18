import { strict as assert } from 'assert'
import { startProcess } from './helpers/start-process'

describe('full output', function() {
  it('returns the full output received from the process', async function() {
    const process = startProcess('console.log("hello")')
    await process.waitForText('hello')
    const output = process.fullOutput()
    assert.equal(output, 'hello\n')
  })
})
