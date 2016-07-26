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

  @Given /^I start a long\-running process$/, (done) ->
    port-reservation.get-port N (@port) ~>
      @observable-process = new ObservableProcess "features/example-apps/long-running #{@port}"
        ..wait "online at port #{@port}", done
        ..on 'ended', (@exit-code, @killed) ~>


  @Given /^I run a process that has generated the output "([^"]*)"$/, (output, done) ->
    @observable-process = new ObservableProcess "features/example-apps/print-output #{output}"
      ..wait output, done



  @Given /^I start a process that outputs "([^"]*)" after (\d+)ms$/, (output, delay) ->
    @observable-process = new ObservableProcess "features/example-apps/delay #{delay}"


  @Given /^I start an interactive process$/, (done) ->
    @on-exit-called = no
    @observable-process = new ObservableProcess "features/example-apps/interactive"
      ..on 'ended', (@exit-code) ~> @on-exit-called = yes
      ..wait "running", done


  @Given /^I run the global command "([^"]*)"$/, (command) ->
    @observable-process = new ObservableProcess command


  @Given /^I run the local command "([^"]*)"$/, (command) ->
    command = path.join process.cwd!, 'features', 'example-apps', command
    @observable-process = new ObservableProcess command



  @When /^calling 'process\.fullOutput\(\)'$/, ->
    @result = @observable-process.full-output!


  @When /^I kill it$/, (done) ->
    @observable-process
      ..on 'ended', -> done!
      ..kill!


  @Given /^I run the "([^"]*)" process$/ (process-name, done) ->
    @observable-process = new ObservableProcess "features/example-apps/#{process-name}"
      ..on 'ended', done


  @Given /^I run the "([^"]*)" process with a custom console object$/ (process-name, done) ->
    @log-text = ''
    @log-error = ''
    @console =
      log: (text) ~> @log-text += text
      error: (text) ~> @log-error += text
    @observable-process = new ObservableProcess("features/example-apps/#{process-name}",
                                                console: @console)
      ..on 'ended', done


  @Given /^I run the "([^"]*)" process with a null console$/ (process-name, done) ->
    @observable-process = new ObservableProcess("features/example-apps/#{process-name}",
                                                console: null)
      ..on 'ended', done


  @When /^gettings its PID$/ ->
    @pid = @observable-process.pid!


  @When /^I run the "([^"]*)" process with verbose (enabled|disabled) and a custom console object$/ (process-name, verbose, done) ->
    @log-text = ''
    @log-error = ''
    @console =
      log: (text) ~> @log-text += text
      error: (text) ~> @log-error += text
    @observable-process = new ObservableProcess("features/example-apps/#{process-name}",
                                                console: @console,
                                                verbose: (verbose is 'enabled'))
      ..on 'ended', done


  @When /^I run the "([^"]*)" application with the environment variables:$/, (app-name, env) ->
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


  @When /^it ends/, (done) ->
    @observable-process.stdin.write "\n"
    @observable-process.wait "ended", done


  @When /^the process ends$/, (done) ->
    wait-until (~> @exit is yes), done


  @When /^running the process "([^"]*)"$/ (command, done) ->
    @observable-process = new ObservableProcess path.join(process.cwd!, 'features', 'example-apps', command), console: off
      ..on 'ended', ~>
        @result = @observable-process.full-output!
        done!

  @When /^running the process \[([^"]+)\]$/ (args, done) ->
    args = eval "[#{args}]"
    @observable-process = new ObservableProcess args, console: off
      ..on 'ended', ~>
        @result = @observable-process.full-output!
        done!


  @Then /^I receive a number$/ ->
    expect(+@pid).to.be.above 0


  @Then /^it emits the 'ended' event with exit code "([^"]*)" and killed "([^"]*)"$/ (expected-exit-code, expected-killed) ->
    expect(eval expected-exit-code).to.equal @exit-code
    expect(eval expected-killed).to.equal @killed


  @Then /^the exit code is set in the \.exitCode property$/ ->
    expect(@observable-process.exit-code).to.equal 1


  @Then /^the on\-exit event is emitted with the exit code (\d+)$/, (expected-exit-code, done) ->
    wait-until (~> @on-exit-called is yes), ~>
      expect(@exit-code).to.equal parse-int(expected-exit-code)
      done!


  @Then /^it is marked as ended/, ->
    expect(@observable-process.ended).to.be.true


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


  @Then /^my console object does not receive "([^"]*)"$/ (expected-text) ->
    expect(@log-text).to.not.contain expected-text


  @Then /^my console object receives "([^"]*)"$/ (expected-text) ->
    expect(@log-text).to.contain expected-text


  @Then /^the callback is called after (\d+)ms$/, (expected-delay) ->
    expect(@called).to.equal 1
    expect(@end-time - @start-time).to.be.above expected-delay


  @Then /^the process ends without errors$/ ->


  @Then /^the processes "([^"]*)" property is (true|false)$/, (property-name, value, done) ->
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
