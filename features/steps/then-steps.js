// @flow

const delay = require('delay')
const {Given, When, Then} = require('cucumber')
const {expect} = require('chai')
const request = require('request-promise-native')
const waitUntil = require('wait-until-promise')

Then(/^I receive a number$/, function () {
  expect(this.pid).to.be.above(0)
})

Then(/^it emits the 'ended' event with exit code "([^"]*)" and killed "([^"]*)"$/, function (expectedExitCode, expectedKilled) {
  expect(eval(expectedExitCode)).to.equal(this.exitCode)
  expect(eval(expectedKilled)).to.equal(this.killed)
})

Then(/^it is marked as ended/, function () {
  expect(this.process.ended).to.be.true
})

Then(/^it is marked as killed$/, function () {
  expect(this.process.killed).to.be.true
})

Then(/^it is no longer running$/, function (done) {
  try {
    request(`http://localhost:${this.port}`)
    throw new Error('process should not be running anymore')
  } catch (err) {
    expect(err.code).to.equal('ECONNREFUSED')
  }
})

Then(/^it prints "([^"]*)"$/, function (output, done) {
  this.process.wait(output, done)
})

Then(/^it returns "([^"]*)"$/, function (expectedText) {
  expect(this.result.trim()).to.equal(expectedText)
})

Then(/^it throws the exception:$/, function (string) {
  expect(this.error.message).to.include(string)
})

Then(/^its accumulated output is empty$/, function () {
  expect(this.process.fullOutput()).to.be.empty
})

Then(/^my stderr stream does not receive "([^"]*)"$/, function (expectedText) {
  expect(this.logError).to.not.contain(expectedText)
})

Then(/^my stderr stream receives "([^"]*)"$/, function (expectedText) {
  expect(this.logError).to.contain(expectedText)
})

Then(/^the callback is called after (\d+)ms$/, function (expectedDelay) {
  expect(this.called).to.equal(1)
  expect(this.endTime - this.startTime).to.be.above(expectedDelay)
})

Then(/^the callback is called after (\d+)ms with the error$/, function (expectedDelay, errorMessage) {
  expect(this.called).to.equal(1)
  expect(this.endTime - this.startTime).to.be.above(expectedDelay)
  expect(this.waitError.message).to.eql(errorMessage)
})

Then(/^the exit code is set in the \.exitCode property$/, function () {
  expect(this.process.exitCode).to.equal(1)
})

Then(/^the on\-exit event is emitted with the exit code (\d+)$/, async function (expectedExitCode, done) {
  await waitUntil(() => this.onExitCalled)
  expect(this.exitCode).to.equal(parseInt(expectedExitCode))
})

Then(/^the process ends without errors$/, function () {})

Then(/^the processes "([^"]*)" property is (true|false)$/, async function (propertyName, value, done) {
  await delay(1)
  expect(this.process[propertyName]).to.equal(eval(value))
})

Then(/^the stderr I provided received no data$/, function () {
  expect(this.logError).to.equal('')
})

Then(/^the stderr I provided receives "([^"]*)"$/, function (text, done) {
  waitUntil(() => this.logError.includes(text), done)
})

Then(/^the stdout I provided received no data$/, function () {
  expect(this.logText).to.equal('')
})

Then(/^the stdout I provided receives "([^"]*)"$/, function (text, done) {
  waitUntil(() => this.logText.includes(text), done)
})
