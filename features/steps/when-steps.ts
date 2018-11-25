import { When } from "cucumber"
import ObservableProcess from "../.."
import path from "path"
import waitUntil from "wait-until-promise"

When("calling {string}", function(code) {
  eval(`this.result = this.${code}`)
})

When(/^calling the "([^"]*)" method$/, function(methodName) {
  this.process[methodName]()
})

When(/^gettings its PID$/, function() {
  this.pid = this.process.pid()
})

When(/^I kill it$/, async function() {
  this.process.kill()
  await this.process.waitForEnd()
})

When(
  /^I run the "([^"]*)" process with verbose (enabled|disabled) and a custom stream$/,
  async function(processName, verbose) {
    this.logText = ""
    this.logError = ""
    this.stdout = {
      write: text => {
        this.logText += text
        return false
      }
    }
    this.stderr = {
      write: text => {
        this.logError += text
        return false
      }
    }
    this.process = new ObservableProcess({
      commands: ["node", path.join("features", "example-apps", processName)],
      stdout: this.stdout,
      stderr: this.stderr,
      verbose: verbose === "enabled"
    })
    await this.process.waitForEnd()
  }
)

When(
  /^I run the "([^"]*)" application with the environment variables:$/,
  function(appName, env) {
    env = env.rowsHash()
    delete env.key
    this.process = new ObservableProcess({
      commands: [
        "node",
        path.join(process.cwd(), "features", "example-apps", appName)
      ],
      env: env
    })
  }
)

When(/^I wait for the output "([^"]*)"$/, async function(searchText) {
  this.called = 0
  this.startTime = new Date()
  await this.process.waitForText(searchText)
  this.called += 1
  this.endTime = new Date()
})

When(
  /^I wait for the output "([^"]*)" with a timeout of (\d+)ms$/,
  { timeout: 2000 },
  async function(searchText, timeout) {
    this.called = 0
    this.startTime = new Date()
    try {
      await this.process.waitForText(searchText, parseInt(timeout))
    } catch (err) {
      this.waitError = err
    }
    this.called += 1
    this.endTime = new Date()
  }
)

When(/^it ends/, async function() {
  this.process.stdin.write("\n")
  await this.process.waitForEnd()
})

When(/^running the process "([^"]*)"$/, async function(command) {
  const commands = command.split(" ")
  commands[0] = path.join(
    process.cwd(),
    "features",
    "example-apps",
    commands[0]
  )
  commands.splice(0, 0, "node")
  this.process = new ObservableProcess({ commands, stdout: null })
  await this.process.waitForEnd()
  this.result = this.process.fullOutput()
})

When(/^running the global process "([^"]*)"$/, async function(command) {
  this.process = new ObservableProcess({ command, stdout: null, stderr: null })
  await this.process.waitForEnd()
  this.result = this.process.fullOutput()
})

When(/^running the process {commands: \[([^"]+)\]}$/, async function(args) {
  var parsedArgs = {}
  eval(`parsedArgs = {commands: [${args}]}`)
  this.process = new ObservableProcess(parsedArgs)
  await this.process.waitForEnd()
  this.result = this.process.fullOutput()
})

When(/^the process ends$/, async function() {
  await waitUntil(() => this.exit)
})

When(
  /^trying to instantiate ObservableProcess with the option "([^"]*)"$/,
  function(optionCode) {
    var options: any = {}
    eval(`options = ${optionCode}`)
    console.log(options)
    options.command = "ls"
    try {
      new ObservableProcess(options) // eslint-disable-line no-new
    } catch (e) {
      this.error = e
    }
  }
)
