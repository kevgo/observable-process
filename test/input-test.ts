import { strict as assert } from "assert"
import { startNodeProcess } from "./helpers/start-node-process"

describe("STDIN", function() {
  it("allows entering text into the running process", async function() {
    // start a process that reads from STDIN
    const process = startNodeProcess(
      "process.stdin.on('data', data => { process.stdout.write(data.toString()) });\
       process.stdin.on('end', () => { process.stdout.write('\\nEND') })"
    )

    // write some stuff into the STDIN stream of this process
    process.stdin.write("hello")

    // close the STDIN stream
    process.stdin.end()

    // verify
    await process.waitForEnd()
    assert.equal(process.outputText(), "hello\nEND")
  })
})
