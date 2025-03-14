import assert from "node:assert/strict"
import { suite, test } from "node:test"
import * as portFinder from "portfinder"
import * as util from "util"

import { instanceOfFinishedProcess } from "../src/finished-process.js"
import * as observableProcess from "../src/index.js"
const delay = util.promisify(setTimeout)

suite("RunningProcess", function() {
  suite("stdin", function() {
    test("running process", async function() {
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

  suite("kill()", function() {
    test("a running process", async function() {
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

    test("an already finished process", async function() {
      const process = observableProcess.start(["node", "-e", "console"])
      await process.waitForEnd()
      try {
        await process.kill()
      } catch (e) {
        assert.equal((e as Error).message, "process has already finished and cannot be killed anymore")
        return
      }
      throw new Error("expected failure")
    })
  })

  suite("output", function() {
    test(".fullText()", async function() {
      const process = observableProcess.start([
        "node",
        "-e",
        'process.stdout.write("hello"); process.stderr.write("world")',
      ])
      await process.waitForEnd()
      assert.equal(process.output.fullText(), "helloworld")
    })

    test(".waitForText()", async function() {
      const process = observableProcess.start([
        "node",
        "-e",
        'process.stdout.write("hello"); process.stderr.write("world")',
      ])
      const text = await process.output.waitForText("helloworld")
      assert.equal(text, "helloworld")
    })

    test(".waitForText() timeout", async function() {
      const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 3)"])
      const promise = process.output.waitForText("hello", 1)
      await assert.rejects(promise, new Error('Text "hello" not found within 1 ms. The captured text so far is:\n'))
    })

    test("waitForRegex()", async function() {
      const process = observableProcess.start([
        "node",
        "-e",
        'process.stdout.write("hello"); process.stderr.write("world")',
      ])
      const text = await process.output.waitForRegex(/h.+d/)
      assert.equal(text, "helloworld")
    })

    test("waitForRegex() timeout", async function() {
      const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 3)"])
      const promise = process.output.waitForRegex(/h.+d/, 1)
      await assert.rejects(promise, new Error("Regex /h.+d/ not found within 1 ms. The captured text so far is:\n"))
    })
  })

  suite("pid()", function() {
    test("running process", async function() {
      const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 1)"])
      const pid = process.pid()
      assert.equal(typeof pid, "number")
      assert.ok(pid > 0)
      await process.waitForEnd()
    })
    test("finished process", async function() {
      const process = observableProcess.start(["node", "-e", "console"])
      await process.waitForEnd()
      const pid = process.pid()
      assert.equal(typeof pid, "number")
      assert.ok(pid > 0)
    })
  })

  suite("stderr", function() {
    test(".fullText()", async function() {
      const observable = observableProcess.start([
        "node",
        "-e",
        'process.stdout.write("hello"); process.stderr.write("world")',
      ])
      await observable.waitForEnd()
      assert.equal(observable.stderr.fullText(), "world")
    })

    test("waitForText()", async function() {
      const observable = observableProcess.start([
        "node",
        "-e",
        'process.stdout.write("hello"); process.stderr.write("world")',
      ])
      const text = await observable.stderr.waitForText("world")
      assert.equal(text, "world")
    })

    test(".waitForText() timeout", async function() {
      const observable = observableProcess.start(["node", "-e", "setTimeout(function() {}, 10)"])
      const promise = observable.stderr.waitForText("hello", 1)
      await assert.rejects(promise, new Error('Text "hello" not found within 1 ms. The captured text so far is:\n'))
    })

    test(".waitForRegex()", async function() {
      const observable = observableProcess.start([
        "node",
        "-e",
        'process.stdout.write("hello"); process.stderr.write("world")',
      ])
      const text = await observable.stderr.waitForRegex(/w.+d/)
      assert.equal(text, "world")
    })

    test(".waitForRegex() timeout", async function() {
      const observable = observableProcess.start(["node", "-e", "setTimeout(function() {}, 10)"])
      const promise = observable.stderr.waitForRegex(/w.+d/, 1)
      await assert.rejects(promise, new Error("Regex /w.+d/ not found within 1 ms. The captured text so far is:\n"))
    })
  })

  suite("stdout", function() {
    test(".fullText()", async function() {
      const process = observableProcess.start([
        "node",
        "-e",
        'process.stdout.write("hello"); process.stderr.write("world")',
      ])
      await process.waitForEnd()
      assert.equal(process.stdout.fullText(), "hello")
    })

    test(".waitForText()", async function() {
      const process = observableProcess.start([
        "node",
        "-e",
        'process.stderr.write("hello"); process.stdout.write("world")',
      ])
      const text = await process.stdout.waitForText("world")
      assert.equal(text, "world")
    })

    test(".waitForText() timeout", async function() {
      const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 3)"])
      const promise = process.stdout.waitForText("hello", 1)
      await assert.rejects(promise, new Error('Text "hello" not found within 1 ms. The captured text so far is:\n'))
    })

    test(".waitForRegex()", async function() {
      const process = observableProcess.start([
        "node",
        "-e",
        'process.stderr.write("hello"); process.stdout.write("world")',
      ])
      const text = await process.stdout.waitForRegex(/w.+d/)
      assert.equal(text, "world")
    })

    test(".waitForRegex() timeout", async function() {
      const process = observableProcess.start(["node", "-e", "setTimeout(function() {}, 3)"])
      const promise = process.stdout.waitForRegex(/w.+d/, 1)
      await assert.rejects(promise, new Error("Regex /w.+d/ not found within 1 ms. The captured text so far is:\n"))
    })
  })

  suite(".waitForEnd()", function() {
    test("finished process", async function() {
      const process = observableProcess.start(["node", "-e", "console.log('hello'); process.exit(7)"])
      await delay(50)
      const result = await process.waitForEnd()
      assert.ok(instanceOfFinishedProcess(result))
      assert.equal(result.exitCode, 7)
      assert.equal(result.stdText, "hello\n")
      assert.equal(result.errText, "")
      assert.equal(result.combinedText, "hello\n")
    })

    test("running process", async function() {
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
  await fetch(`http://localhost:${port}`)
}

async function assertIsNotRunning(port: number) {
  try {
    await fetch(`http://localhost:${port}`)
  } catch (e) {
    return
  }
  assert.fail("should not reach this")
}
