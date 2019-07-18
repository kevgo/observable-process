import { strict as assert } from 'assert'
import { startProcess } from './helpers/start-process'

describe('.fullOutput()', function() {
  it('returns the full output received from the process', async function() {
    const process = startProcess('console.log("hello")')
    await process.waitForText('hello')
    const output = process.fullOutput()
    assert.equal(output, 'hello\n')
  })
})

describe('STDIN', function() {
  it('allows entering text into the running process', async function() {
    // start a process that reads from STDIN
    const process = startProcess(
      "process.stdin\
      .on('data', data => { console.log(data.toString()) })\
      .on('end', () => { console.log('END') })"
    )

    // write some stuff into the STDIN stream of this process
    process.stdin.write('hello')

    // close the STDIN stream
    process.stdin.end()

    // verify
    await process.waitForEnd()
    assert.equal(process.fullOutput(), 'hello\nEND\n')
  })
})
