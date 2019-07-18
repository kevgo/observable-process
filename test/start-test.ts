import { ObservableProcess } from '../src/observable-process'

describe('constructor', function() {
  it('allows to start a process via an array of arguments', async function() {
    const process = new ObservableProcess({
      commands: ['node', '-e', "console.log('hello')"]
    })
    await process.waitForText('hello')
  })

  it('allows to start a process via a string', async function() {
    const process = new ObservableProcess({
      command: "node -e console.log('hello')"
    })
    await process.waitForText('hello')
  })
})
