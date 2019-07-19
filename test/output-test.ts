import { strict as assert } from "assert"
import { startNodeProcess } from "./helpers/start-node-process"

describe(".output", function() {
  it("returns the accumulated output of the STDOUT and STDERR streams", async function() {
    const observable = startNodeProcess(
      'process.stdout.write("hello");\
       process.stderr.write("world")'
    )
    await observable.waitForEnd()
    assert.equal(observable.output.fullText(), "helloworld")
  })

  it("allows awaiting given text in the combined command output", async function() {
    const observable = startNodeProcess(
      'process.stdout.write("hello")\n\
       process.stderr.write("world")'
    )
    const text = await observable.output.waitForText("helloworld")
    assert.equal(text, "helloworld")
  })

  it("aborts the text search after the optional timeout has been reached", async function() {
    const observable = startNodeProcess("setTimeout(function() {}, 3)")
    const promise = observable.output.waitForText("hello", 1)
    await assert.rejects(
      promise,
      new Error(
        'Text "hello" not found within 1 ms. The captured text so far is:\n'
      )
    )
  })

  it("allows awaiting a regex in the combined command output", async function() {
    const observable = startNodeProcess(
      'process.stdout.write("hello")\n\
       process.stderr.write("world")'
    )
    const text = await observable.output.waitForRegex(/h.+d/)
    assert.equal(text, "helloworld")
  })

  it("aborts the regex search after the optional timeout has been reached", async function() {
    const observable = startNodeProcess("setTimeout(function() {}, 3)")
    const promise = observable.output.waitForRegex(/h.+d/, 1)
    await assert.rejects(
      promise,
      new Error(
        "Regex /h.+d/ not found within 1 ms. The captured text so far is:\n"
      )
    )
  })
})

describe(".stdout", function() {
  it("returns the accumulated output of the STDOUT stream", async function() {
    const observable = startNodeProcess(
      'process.stdout.write("hello");\
       process.stderr.write("world")'
    )
    await observable.waitForEnd()
    assert.equal(observable.stdout.fullText(), "hello")
  })

  it("allows awaiting given text in the STDOUT stream", async function() {
    const observable = startNodeProcess(
      'process.stderr.write("hello")\n\
       process.stdout.write("world")'
    )
    const text = await observable.stdout.waitForText("world")
    assert.equal(text, "world")
  })

  it("aborts the text search after the optional timeout has been reached", async function() {
    const observable = startNodeProcess("setTimeout(function() {}, 3)")
    const promise = observable.stdout.waitForText("hello", 1)
    await assert.rejects(
      promise,
      new Error(
        'Text "hello" not found within 1 ms. The captured text so far is:\n'
      )
    )
  })

  it("allows awaiting a given regex in the STDOUT stream", async function() {
    const observable = startNodeProcess(
      'process.stderr.write("hello")\n\
       process.stdout.write("world")'
    )
    const text = await observable.stdout.waitForRegex(/w.+d/)
    assert.equal(text, "world")
  })

  it("aborts the regex search after the optional timeout has been reached", async function() {
    const observable = startNodeProcess("setTimeout(function() {}, 3)")
    const promise = observable.stdout.waitForRegex(/w.+d/, 1)
    await assert.rejects(
      promise,
      new Error(
        "Regex /w.+d/ not found within 1 ms. The captured text so far is:\n"
      )
    )
  })
})

describe(".stderr", function() {
  it("returns the accumulated output of the STDERR stream", async function() {
    const observable = startNodeProcess(
      'process.stdout.write("hello");\
       process.stderr.write("world")'
    )
    await observable.waitForEnd()
    assert.equal(observable.stderr.fullText(), "world")
  })

  it("allows awaiting given text in the STDERR stream", async function() {
    const observable = startNodeProcess(
      'process.stdout.write("hello")\n\
       process.stderr.write("world")'
    )
    const text = await observable.stderr.waitForText("world")
    assert.equal(text, "world")
  })

  it("aborts the text search after the optional timeout has been reached", async function() {
    const observable = startNodeProcess("setTimeout(function() {}, 10)")
    const promise = observable.stderr.waitForText("hello", 1)
    await assert.rejects(
      promise,
      new Error(
        'Text "hello" not found within 1 ms. The captured text so far is:\n'
      )
    )
  })

  it("allows awaiting a given regex in the STDERR stream", async function() {
    const observable = startNodeProcess(
      'process.stdout.write("hello")\n\
       process.stderr.write("world")'
    )
    const text = await observable.stderr.waitForRegex(/w.+d/)
    assert.equal(text, "world")
  })

  it("aborts the regex search after the optional timeout has been reached", async function() {
    const observable = startNodeProcess("setTimeout(function() {}, 10)")
    const promise = observable.stderr.waitForRegex(/w.+d/, 1)
    await assert.rejects(
      promise,
      new Error(
        "Regex /w.+d/ not found within 1 ms. The captured text so far is:\n"
      )
    )
  })
})
