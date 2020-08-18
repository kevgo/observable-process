import { strict as assert } from "assert"
import { startNodeProcess } from "./helpers/start-node-process"

test("ObservableProcess.stdin", async function () {
  // start a process that reads from STDIN
  const running = startNodeProcess(
    "process.stdin.on('data', data => { process.stdout.write(data.toString()) });\
       process.stdin.on('end', () => { process.stdout.write('\\nEND') })"
  )

  // write some stuff into the STDIN stream of this process
  running.stdin.write("hello")

  // close the STDIN stream
  running.stdin.end()

  // verify
  await running.waitForEnd()
  assert.equal(running.output.fullText(), "hello\nEND")
})
