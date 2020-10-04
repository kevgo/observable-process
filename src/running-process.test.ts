import { strict as assert } from "assert"
import got from "got"
import * as portFinder from "portfinder"
import * as util from "util"

import * as observableProcess from "../src/index"
const delay = util.promisify(setTimeout)

suite("RunningProcess", function () {
  test("stdin", async function () {
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

  suite("kill()", function () {
    test("a running process", async function () {
      this.timeout(8000)

      // start a long-running process
      const port = await portFinder.getPortPromise()
      const process = observableProcess.start([
        "node",
        "-e",
        `http = require('http');\
        http.createServer(function(_, res) { res.end('hello') }).listen(${port}, 'localhost');\
        console.log('online')`,
      ])
      await process.stdout.waitForText("online")
      await assertIsRunning(port)

      // kill the process
      const result = await process.kill()

      // verify the process is no longer running
      await assertIsNotRunning(port)
      assert.equal(result.stdText, "online\n")
      assert.equal(result.errText, "")
      assert.equal(result.combinedText, "online\n")
    })

    test("an already exited process")
  })

  suite("output", function () {
    test("reading", async function () {
      const process = observableProcess.start([
        "node",
        "-e",
        'process.stdout.write("hello"); process.stderr.write("world")',
      ])
      await process.waitForEnd()
      assert.equal(process.output.fullText(), "helloworld")
    })

    test("waiting for text", async function () {
      const process = observableProcess.start([
        "node",
        "-e",
        'process.stdout.write("hello"); process.stderr.write("world")',
      ])
      const text = await process.output.waitForText("helloworld")
      assert.equal(text, "helloworld")
    })

    test("waiting for text times out", async function () {
      const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 3)"])
      const promise = process.output.waitForText("hello", 1)
      await assert.rejects(promise, new Error('Text "hello" not found within 1 ms. The captured text so far is:\n'))
    })

    test("waiting for regex", async function () {
      const process = observableProcess.start([
        "node",
        "-e",
        'process.stdout.write("hello"); process.stderr.write("world")',
      ])
      const text = await process.output.waitForRegex(/h.+d/)
      assert.equal(text, "helloworld")
    })

    test("waiting for regex times out", async function () {
      const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 3)"])
      const promise = process.output.waitForRegex(/h.+d/, 1)
      await assert.rejects(promise, new Error("Regex /h.+d/ not found within 1 ms. The captured text so far is:\n"))
    })
  })

  suite("pid()", function () {
    test("a running process", async function () {
      const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 1)"])
      const pid = process.pid()
      assert.equal(typeof pid, "number")
      assert.ok(pid > 0)
      await process.waitForEnd()
    })
  })

  suite("stderr", function () {
    test("reading", async function () {
      const observable = observableProcess.start([
        "node",
        "-e",
        'process.stdout.write("hello"); process.stderr.write("world")',
      ])
      await observable.waitForEnd()
      assert.equal(observable.stderr.fullText(), "world")
    })

    test("waiting for text", async function () {
      const observable = observableProcess.start([
        "node",
        "-e",
        'process.stdout.write("hello"); process.stderr.write("world")',
      ])
      const text = await observable.stderr.waitForText("world")
      assert.equal(text, "world")
    })

    test("waiting for text times out", async function () {
      const observable = observableProcess.start(["node", "-e", "setTimeout(function() {}, 10)"])
      const promise = observable.stderr.waitForText("hello", 1)
      await assert.rejects(promise, new Error('Text "hello" not found within 1 ms. The captured text so far is:\n'))
    })

    test("waiting for regex", async function () {
      const observable = observableProcess.start([
        "node",
        "-e",
        'process.stdout.write("hello"); process.stderr.write("world")',
      ])
      const text = await observable.stderr.waitForRegex(/w.+d/)
      assert.equal(text, "world")
    })

    test("waiting for regex times out", async function () {
      const observable = observableProcess.start(["node", "-e", "setTimeout(function() {}, 10)"])
      const promise = observable.stderr.waitForRegex(/w.+d/, 1)
      await assert.rejects(promise, new Error("Regex /w.+d/ not found within 1 ms. The captured text so far is:\n"))
    })
  })

  suite("stdout", function () {
    test("reading", async function () {
      const process = observableProcess.start([
        "node",
        "-e",
        'process.stdout.write("hello"); process.stderr.write("world")',
      ])
      await process.waitForEnd()
      assert.equal(process.stdout.fullText(), "hello")
    })

    test("waiting for text", async function () {
      const process = observableProcess.start([
        "node",
        "-e",
        'process.stderr.write("hello"); process.stdout.write("world")',
      ])
      const text = await process.stdout.waitForText("world")
      assert.equal(text, "world")
    })

    test("waiting for text times out", async function () {
      const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 3)"])
      const promise = process.stdout.waitForText("hello", 1)
      await assert.rejects(promise, new Error('Text "hello" not found within 1 ms. The captured text so far is:\n'))
    })

    test("waiting for regex", async function () {
      const process = observableProcess.start([
        "node",
        "-e",
        'process.stderr.write("hello"); process.stdout.write("world")',
      ])
      const text = await process.stdout.waitForRegex(/w.+d/)
      assert.equal(text, "world")
    })

    test("waiting for regex times out", async function () {
      const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 3)"])
      const promise = process.stdout.waitForRegex(/w.+d/, 1)
      await assert.rejects(promise, new Error("Regex /w.+d/ not found within 1 ms. The captured text so far is:\n"))
    })
  })

  suite("waitForEnd()", function () {
    test("process ends before calling it", async function () {
      const process = observableProcess.start(["node", "-e", "console.log('hello'); process.exit(7)"])
      await delay(50)
      const result = await process.waitForEnd()
      // assert.deepEqual(result.exitCode, 7)
      assert.deepEqual(result.stdText, "hello\n")
      assert.deepEqual(result.errText, "")
      assert.deepEqual(result.combinedText, "hello\n")
    })

    test("process still running when calling it", async function () {
      const process = observableProcess.start([
        "node",
        "-e",
        "setTimeout(function() { console.log('finally'); process.exit(8)}, 10)",
      ])
      const result = await process.waitForEnd()
      // assert.equal(result.exitCode, 8)
      assert.equal(result.stdText, "finally\n")
      assert.equal(result.errText, "")
      assert.equal(result.combinedText, "finally\n")
    })
  })
})

async function assertIsRunning(port: number) {
  await got(`http://localhost:${port}`)
}

async function assertIsNotRunning(port: number) {
  try {
    await got(`http://localhost:${port}`)
  } catch (e) {
    assert.equal(e.code, "ECONNREFUSED")
    return
  }
  assert.fail("should not reach this")
}
