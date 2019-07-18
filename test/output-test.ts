import { ObservableProcess } from '../dist/observable-process'
import { strict as assert } from 'assert'

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
