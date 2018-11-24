import delay from "delay"
import { Then } from "cucumber"
import { expect } from "chai"
import request from "request-promise-native"
import waitUntil from "wait-until-promise"

Then(/^I receive a number$/, function() {
  expect(this.pid).to.be.above(0)
})

Then(
  /^it emits the 'ended' event with exit code "([^"]*)" and killed "([^"]*)"$/,
  function(expectedExitCode, expectedKilled) {
    expect(this.exitData.exitCode).to.equal(eval(expectedExitCode))
    expect(this.exitData.killed).to.equal(eval(expectedKilled))
  }
)

Then(/^it is marked as ended/, function() {
  expect(this.process.ended).to.be.true
})

Then(/^it is marked as killed$/, function() {
  expect(this.process.killed).to.be.true
})

Then(/^it is no longer running$/, async function() {
  try {
    await request(`http://localhost:${this.port}`)
    throw new Error("process should not be running anymore")
  } catch (err) {
    expect(err.error.code).to.equal("ECONNREFUSED")
  }
})

Then(/^it prints "([^"]*)"$/, async function(output) {
  await this.process.waitForText(output)
})

Then(/^it returns "([^"]*)"$/, function(expectedText) {
  expect(this.result.trim()).to.equal(expectedText)
})

Then(/^it throws the exception:$/, function(string) {
  expect(this.error.message).to.include(string)
})

Then(/^its accumulated output is empty$/, function() {
  expect(this.process.fullOutput()).to.be.empty
})

Then(/^my stderr stream does not receive "([^"]*)"$/, function(expectedText) {
  expect(this.logError).to.not.contain(expectedText)
})

Then(/^my stderr stream receives "([^"]*)"$/, function(expectedText) {
  expect(this.logError).to.contain(expectedText)
})

Then(/^the callback is called within (\d+)ms$/, function(expectedDelay) {
  expect(this.called).to.equal(1)
  expect(this.endTime - this.startTime).to.be.below(expectedDelay)
})

Then(/^the callback is called after (\d+)ms with the error$/, function(
  expectedDelay,
  expectedMessage
) {
  expect(this.called).to.equal(1)
  expect(this.endTime - this.startTime).to.be.above(expectedDelay)
  try {
    expect(this.waitError.message.trim()).to.eql(expectedMessage.trim())
  } catch (e) {
    console.log(e)
    console.log(`EXPECTED: '${expectedMessage}'`)
    console.log(`ACTUAL: '${this.waitError.message}'`)
    throw e
  }
})

Then(/^the exit code is set in the \.exitCode property$/, function() {
  expect(this.process.exitCode).to.equal(1)
})

Then(/^the on-exit event is emitted with the exit code (\d+)$/, async function(
  expectedExitCode
) {
  await waitUntil(() => this.onExitCalled)
  expect(this.exitData.exitCode).to.equal(parseInt(expectedExitCode))
})

Then(/^the process ends without errors$/, function() {})

Then(/^the processes "([^"]*)" property is (true|false)$/, async function(
  propertyName,
  value
) {
  await delay(1)
  expect(this.process[propertyName]).to.equal(eval(value))
})

Then(/^the stderr I provided received no data$/, function() {
  expect(this.logError).to.equal("")
})

Then(/^the stderr I provided receives "([^"]*)"$/, async function(text) {
  await waitUntil(() => this.logError.includes(text))
})

Then(/^the stdout I provided received no data$/, function() {
  expect(this.logText).to.equal("")
})

Then(/^the stdout I provided receives "([^"]*)"$/, async function(text) {
  await waitUntil(() => this.logText.includes(text))
})
