import { strict as assert } from "assert"
import { startNodeProcess } from "./helpers/start-node-process"

describe(".outputSearch", function() {
  it("allows awaiting given text in the combined command output", async function() {
    const oProcess = startNodeProcess(
      'process.stdout.write("hello");\
       process.stderr.write("world")'
    )
    const text = await oProcess.outputSearch.waitForText("helloworld")
    assert.equal(text, "helloworld")
  })

  it("aborts the wait after the optional timeout has been reached", async function() {
    const process = startNodeProcess("setTimeout(function() {}, 10)")
    const promise = process.outputSearch.waitForText("hello", 1)
    await assert.rejects(
      promise,
      new Error("Expected '' to include string 'hello'")
    )
  })
})

describe(".outputText()", function() {
  it("returns the accumulated output of the STDOUT and STDERR streams", async function() {
    const oProcess = startNodeProcess(
      'process.stdout.write("hello");\
       process.stderr.write("world")'
    )
    await oProcess.waitForEnd()
    assert.equal(oProcess.outputText(), "helloworld")
  })
})

describe(".stdoutSearch", function() {
  it("allows awaiting given text in the STDOUT stream", async function() {
    const oProcess = startNodeProcess(
      'process.stderr.write("hello");\
       process.stdout.write("world")'
    )
    const text = await oProcess.outputSearch.waitForText("world")
    assert.equal(text, "world")
  })

  it("aborts the wait after the optional timeout has been reached", async function() {
    const process = startNodeProcess("setTimeout(function() {}, 10)")
    const promise = process.outputSearch.waitForText("hello", 1)
    await assert.rejects(
      promise,
      new Error("Expected '' to include string 'hello'")
    )
  })
})

describe(".stdoutText()", function() {
  it("returns the accumulated output of the STDOUT stream", async function() {
    const oProcess = startNodeProcess(
      'process.stdout.write("hello");\
       process.stderr.write("world")'
    )
    await oProcess.waitForEnd()
    assert.equal(oProcess.stdoutText(), "hello")
  })
})

describe(".stderrSearch", function() {
  it("allows awaiting given text in the STDERR stream", async function() {
    const oProcess = startNodeProcess(
      'process.stdout.write("hello");\
       process.stderr.write("world")'
    )
    const text = await oProcess.stderrSearch.waitForText("world")
    assert.equal(text, "world")
  })

  it("aborts the wait after the optional timeout has been reached", async function() {
    const process = startNodeProcess("setTimeout(function() {}, 10)")
    const promise = process.stderrSearch.waitForText("hello", 1)
    await assert.rejects(
      promise,
      new Error("Expected '' to include string 'hello'")
    )
  })
})

describe(".stderrText()", function() {
  it("returns the accumulated output of the STDERR stream", async function() {
    const oProcess = startNodeProcess(
      'process.stdout.write("hello");\
       process.stderr.write("world")'
    )
    await oProcess.waitForEnd()
    assert.equal(oProcess.stderrText(), "world")
  })
})
