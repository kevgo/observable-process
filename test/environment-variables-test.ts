import { ObservableProcess } from '../dist/observable-process'
import { strict as assert } from 'assert'

describe('environment variables', function() {
  it('allows to provide custom environment variables for running processes', async function() {
    const process = new ObservableProcess({
      commands: ['node', '-e', "console.log('foo:', process.env.foo)"],
      env: { foo: 'bar' }
    })
    await process.waitForEnd()
    assert.equal(process.fullOutput(), 'foo: bar\n')
  })
})
