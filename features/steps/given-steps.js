// @flow

import type {WriteStream} from '../../src/observable-process.js'

const {Given, When, Then} = require('cucumber')
const ObservableProcess = require('../../dist/observable-process.js')
const path = require('path')
const portFinder = require('portfinder')

Given(/^an observableProcess with accumulated output text$/, async function () {
  const output = 'hello world'
  this.process = new ObservableProcess({commands: ['features/example-apps/print-output', output]})
  await this.process.wait(output)
})

Given(/^I run a process that has generated the output "([^"]*)"$/, async function (output) {
  this.process = new ObservableProcess({commands: ['features/example-apps/print-output', output]})
  await this.process.wait(output)
})

Given(/^I run the global command "([^"]*)"$/, function (command) {
  this.process = new ObservableProcess(command)
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
  const writable: WriteStream = {
    write: (text: string | Buffer): boolean => {
      this.logText += text
      return false
    }
  }
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

Given(/^I start a long\-running process$/, async function () {
  this.port = await portFinder.getPortPromise()
  this.process = new ObservableProcess({commands: ['features/example-apps/long-running', this.port]})
  this.process.waitForEnd().then((exitCode, killed) => {
    this.exitCode = exitCode
    this.killed = killed
  })
  await this.process.waitForText(`online at port ${this.port}`)
})

Given(/^I start a process that outputs "([^"]*)" after (\d+)ms$/, function (output, delay) {
  this.process = new ObservableProcess({commands: ['features/example-apps/delay', delay]})
})

Given(/^I start an interactive process$/, async function (done) {
  this.onExitCalled = false
  this.process = new ObservableProcess({command: 'features/example-apps/interactive'})
  this.process.waitForEnd().then((exitCode) => {
    this.exitCode = exitCode
    this.onExitCalled = true
  })
  await this.process.waitForText('running')
})

Given(/^I start the "([^"]*)" process$/, function (processName) {
  this.process = new ObservableProcess({command: path.join('features', 'example-apps', processName)})
})
