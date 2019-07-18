import { strict as assert } from "assert"
import { startProcess } from "./helpers/start-process"

describe("STDIN", function() {
  it("allows entering text into the running process", async function() {
    // start a process that reads from STDIN
    const process = startProcess(
      "process.stdin\
      .on('data', data => { console.log(data.toString()) })\
      .on('end', () => { console.log('END') })"
    )

    // write some stuff into the STDIN stream of this process
    process.stdin.write("hello")

    // close the STDIN stream
    process.stdin.end()

    // verify
    await process.waitForEnd()
    assert.equal(process.fullOutput(), "hello\nEND\n")
  })
})
