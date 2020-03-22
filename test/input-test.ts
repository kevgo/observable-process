import { strict as assert } from "assert"
import { startNodeProcess } from "./helpers/start-node-process"

test("ObservableProcess.stdin", async function () {
  // start a process that reads from STDIN
  const observable = startNodeProcess(
    "process.stdin.on('data', data => { process.stdout.write(data.toString()) });\
       process.stdin.on('end', () => { process.stdout.write('\\nEND') })"
  )

  // write some stuff into the STDIN stream of this process
  observable.stdin.write("hello")

  // close the STDIN stream
  observable.stdin.end()

  // verify
  await observable.waitForEnd()
  assert.equal(observable.output.fullText(), "hello\nEND")
})
