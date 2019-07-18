import { ObservableProcess } from '../dist/observable-process'
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

describe('output', function() {
  it('provides the accumulated output')
  it('allows to clear all output accumulated so far')
  it('pipes the output to the provided custom streams', async function() {
    // run a process that prints to both STDOUT and STDERR
    let stdOutText = ''
    let stdErrText = ''
    this.process = new ObservableProcess({
      commands: [
        'node',
        '-e',
        "console.log('normal output'); console.error('error output')"
      ],
      stdout: {
        write: (text: string) => {
          stdOutText += text
          return false
        }
      },
      stderr: {
        write: text => {
          stdErrText += text
          return false
        }
      }
    })
    await this.process.waitForEnd()

    // verify the piped output
    assert.equal(stdOutText, 'normal output\n')
    assert.equal(stdErrText, 'error output\n')
  })
})
