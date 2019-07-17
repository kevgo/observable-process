import { strict as assert } from 'assert'
import { ObservableProcess } from '../src/observable-process'

describe('verbose mode', function() {
  it('adds information about the process health to the error stream', async function() {
    let stdErrContent = '' // this variable contains the STDERR output
    const process = new ObservableProcess({
      commands: [
        'node',
        '-e',
        "console.log('normal output'); console.error('error output')"
      ],
      verbose: true,
      stderr: {
        write: (text: string) => {
          stdErrContent += text
          return false
        }
      }
    })
    await process.waitForEnd()
    assert.ok(stdErrContent.includes('PROCESS ENDED'))
    assert.ok(stdErrContent.includes('EXIT CODE: 0'))
  })

  it('does not add information when disabled', async function() {
    let stdErrContent = '' // this variable contains the STDERR output
    const process = new ObservableProcess({
      commands: [
        'node',
        '-e',
        "console.log('normal output'); console.error('error output')"
      ],
      verbose: false,
      stderr: {
        write: (text: string) => {
          stdErrContent += text
          return false
        }
      }
    })
    await process.waitForEnd()
    assert.ok(!stdErrContent.includes('PROCESS ENDED'))
    assert.ok(!stdErrContent.includes('EXIT CODE: 0'))
  })
})
