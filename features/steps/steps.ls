require! {
  '../..' : ObservableProcess
  'chai' : {expect}
  'nitroglycerin' : N
  'path'
  'port-reservation'
  'request'
  'wait' : {wait-until}
}


module.exports = ->

  @Given /^I spawn a long\-running process$/, (done) ->
    port-reservation.get-port N (@port) ~>
      @observable-process = new ObservableProcess "features/example-apps/long-running #{@port}"
        ..wait "online at port #{@port}", done


  @Given /^I spawn a process that has generated the output "([^"]*)"$/, (output, done) ->
    @observable-process = new ObservableProcess "features/example-apps/print-output #{output}"
      ..wait output, done



  @Given /^I spawn a process that outputs "([^"]*)" after (\d+)ms$/, (output, delay) ->
    @observable-process = new ObservableProcess "features/example-apps/delay-#{delay}"


  @Given /^I spawn a volatile proces$/, (done) ->
    @observable-process = new ObservableProcess "features/example-apps/volatile", on-exit: (~> @on-exit-called = yes)
      ..wait "running", done


  @Given /^I spawn the global command "([^"]*)"$/, (command) ->
    @observable-process = new ObservableProcess command


  @Given /^I spawn the local command "([^"]*)"$/, (command) ->
    command = path.join process.cwd!, 'features', 'example-apps', command
    @observable-process = new ObservableProcess command



  @Given /^I spawn the "([^"]*)" process with verbose (enabled|disabled)$/, (process-name, verbose) ->
    @log-text = ''
    @log-error = ''
    @console =
      log: (text) ~> @log-text += text
      error: (text) ~> @log-error += text
    @exit = no
    @observable-process = new ObservableProcess "features/example-apps/#{process-name}",
                                                verbose: (verbose is 'enabled'),
                                                console: @console,
                                                on-exit: ~> @exit = yes



  @When /^I kill it$/, ->
    @observable-process.kill!


  @When /^I run 'process\.fullOutput\(\)'$/, ->
    @result = @observable-process.full-output!


  @When /^I spawn the "([^"]*)" application with the environment variables:$/, (app-name, env) ->
    env = env.rows-hash!
    delete env.key
    @observable-process = new ObservableProcess path.join(process.cwd!, 'features', 'example-apps', app-name),
                                                env: env


  @When /^I wait for the output "([^"]*)"$/, (search-text, done) ->
    @called = 0
    @start-time = new Date!
    @observable-process.wait search-text, ~>
      @called += 1
      @end-time = new Date!
      done!


  @When /^it crashes$/, (done) ->
    @observable-process.stdin.write "\n"
    @observable-process.wait "crashed", done


  @When /^the process ends$/, (done) ->
    wait-until (~> @exit is yes), done



  @Then /^it invokes the on\-exit callback$/, (done) ->
    wait-until (~> @on-exit-called = yes), done


  @Then /^it is marked as killed$/, ->
    expect(@observable-process.killed).to.be.true


  @Then /^it is no longer running$/, (done) ->
    request "http://localhost:#{@port}", (err) ->
      expect(err?.code).to.equal 'ECONNREFUSED'
      done!


  @Then /^it prints "([^"]*)"$/, (output, done) ->
    @observable-process.wait output, done


  @Then /^it returns "([^"]*)"$/, (expected-text) ->
    expect(@result.trim!).to.equal expected-text


  @Then /^the callback is called after (\d+)ms$/, (expected-delay) ->
    expect(@called).to.equal 1
    expect(@end-time - @start-time).to.be.above expected-delay


  @Then /^the "([^"]*)" property is (true|false)$/, (property-name, value, done) ->
    process.next-tick ~>
      expect(@observable-process[property-name]).to.equal eval(value)
      done!


  @Then /^the stderr I provided received no data$/, ->
    expect(@log-error).to.equal ''


  @Then /^the stderr I provided receives "([^"]*)"$/, (text, done) ->
    wait-until (~> @log-error.includes text), done


  @Then /^the stdout I provided received no data$/, ->
    expect(@log-text).to.equal ''


  @Then /^the stdout I provided receives "([^"]*)"$/, (text, done) ->
    wait-until (~> @log-text.includes text), done
