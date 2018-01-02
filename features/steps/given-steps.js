// @flow

import type {WriteStream} from '../../src/observable-process.js'  // eslint-disable-line no-unused-vars

const {Given} = require('cucumber')
const ObservableProcess = require('../../dist/observable-process.js')
const path = require('path')
const portFinder = require('portfinder')

Given(/^an observableProcess with accumulated output text$/, async function () {
  const output = 'hello world'
  this.process = new ObservableProcess({commands: ['features/example-apps/print-output', output]})
  await this.process.waitForText(output)
})

Given(/^I run a process that has generated the output "([^"]*)"$/, async function (output) {
  this.process = new ObservableProcess({commands: ['features/example-apps/print-output', output]})
  await this.process.waitForText(output)
})

Given(/^I run the global command "([^"]*)"$/, function (command) {
  this.process = new ObservableProcess({command})
})

Given(/^I run the local command "([^"]*)"$/, function (command) {
  command = path.join(process.cwd(), 'features', 'example-apps', command)
  this.process = new ObservableProcess({command})
})

Given(/^I run the "([^"]*)" process$/, async function (processName) {
  this.process = new ObservableProcess({command: path.join('features', 'example-apps', processName)})
  await this.process.waitForEnd()
})

Given(/^I run the "([^"]*)" process with a custom stream$/, async function (processName) {
  this.logText = ''
  this.logError = ''
  this.stdout = {
    write: (text: string | Buffer): boolean => {
      this.logText += text
      return false
    }
  }
  this.stderr = {
    write: (text: string | Buffer): boolean => {
      this.logError += text
      return false
    }
  }
  this.process = new ObservableProcess({ command: path.join('features', 'example-apps', processName),
    stdout: this.stdout,
    stderr: this.stderr })
  await this.process.waitForEnd()
})

Given(/^I run the "([^"]*)" process with a null stream/, async function (processName) {
  this.process = new ObservableProcess({ command: path.join('features', 'example-apps', processName),
    stdout: null,
    stderr: null })
  await this.process.waitForEnd()
})

Given(/^I start a long-running process$/, async function () {
  this.port = await portFinder.getPortPromise()
  this.process = new ObservableProcess({commands: ['features/example-apps/long-running', this.port]})
  this.process.waitForEnd().then((exitData) => {
    this.exitData = exitData
  })
  await this.process.waitForText(`online at port ${this.port}`)
})

Given(/^I start a process that outputs "([^"]*)" after (\d+)ms$/, function (output, delay) {
  this.process = new ObservableProcess({commands: ['features/example-apps/delay', delay]})
})

Given(/^I start an interactive process$/, async function () {
  this.onExitCalled = false
  this.process = new ObservableProcess({command: 'features/example-apps/interactive'})
  this.process.waitForEnd().then((exitData) => {
    this.exitData = exitData
    this.onExitCalled = true
  })
  await this.process.waitForText('running')
})

Given(/^I start the "([^"]*)" process$/, function (processName) {
  this.process = new ObservableProcess({command: path.join('features', 'example-apps', processName)})
})