import { strict as assert } from "assert"

import * as observableProcess from "../src/index"

suite("stdin", function () {
  test("normal input", async function () {
    // start a process that reads from STDIN
    const running = observableProcess.start([
      "node",
      "-e",
      `process.stdin.on("data", data => { process.stdout.write(data) });\
       process.stdin.on("end", () => { process.stdout.write("\\nEND") })`,
    ])

    // write some stuff into the STDIN stream of this process
    running.stdin.write("hello")
    running.stdin.write(" ")
    running.stdin.write("world")

    // close the STDIN stream
    running.stdin.end()

    // verify
    await running.waitForEnd()
    assert.equal(running.output.fullText(), "hello world\nEND")
  })
})
