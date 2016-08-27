require! {
  '../..' : ObservableProcess
  'chai' : {expect}
  'livescript'
  'nitroglycerin' : N
  'path'
  'port-reservation'
  'request'
  'wait' : {wait-until}
}


module.exports = ->

  @Given /^an observableProcess with accumulated output text$/ (done) ->
    output = "hello world"
    @process = new ObservableProcess "features/example-apps/print-output '#{output}'"
      ..wait output, done


  @Given /^I run a process that has generated the output "([^"]*)"$/, (output, done) ->
    @process = new ObservableProcess "features/example-apps/print-output #{output}"
      ..wait output, done



  @Given /^I run the global command "([^"]*)"$/, (command) ->
    @process = new ObservableProcess command


  @Given /^I run the local command "([^"]*)"$/, (command) ->
    command = path.join process.cwd!, 'features', 'example-apps', command
    @process = new ObservableProcess command


  @Given /^I run the "([^"]*)" process$/ (process-name, done) ->
    @process = new ObservableProcess "features/example-apps/#{process-name}"
      ..on 'ended', done


  @Given /^I run the "([^"]*)" process with a custom stream$/ (process-name, done) ->
    @log-text = ''
    @log-error = ''
    @stdout = write: (text) ~> @log-text += text
    @stderr = write: (text) ~> @log-error += text
    @process = new ObservableProcess("features/example-apps/#{process-name}",
                                                {@stdout, @stderr})
      ..on 'ended', done


  @Given /^I run the "([^"]*)" process with a null stream/ (process-name, done) ->
    @process = new ObservableProcess("features/example-apps/#{process-name}",
                                                stdout: null, stderr: null)
      ..on 'ended', done


  @Given /^I start a long\-running process$/, (done) ->
    port-reservation.get-port N (@port) ~>
      @process = new ObservableProcess "features/example-apps/long-running #{@port}"
        ..wait "online at port #{@port}", done
        ..on 'ended', (@exit-code, @killed) ~>


  @Given /^I start a process that outputs "([^"]*)" after (\d+)ms$/, (output, delay) ->
    @process = new ObservableProcess "features/example-apps/delay #{delay}"


  @Given /^I start an interactive process$/, (done) ->
    @on-exit-called = no
    @process = new ObservableProcess "features/example-apps/interactive"
      ..on 'ended', (@exit-code) ~> @on-exit-called = yes
      ..wait "running", done


  @Given /^I start the "([^"]*)" process$/ (process-name) ->
    @process = new ObservableProcess "features/example-apps/#{process-name}"



  @When /^calling "([^"]*)"$/ (code) ->
    eval "this.result = this.#{code}"


  @When /^calling 'process\.fullOutput\(\)'$/, ->
    @result = @process.full-output!


  @When /^calling the "([^"]*)" method$/ (method-name) ->
    @process[method-name]!


  @When /^gettings its PID$/ ->
    @pid = @process.pid!


  @When /^I kill it$/, (done) ->
    @process
      ..on 'ended', -> done!
      ..kill!


  @When /^I run the "([^"]*)" process with verbose (enabled|disabled) and a custom stream$/ (process-name, verbose, done) ->
    @log-text = ''
    @log-error = ''
    @stdout = write: (text) ~> @log-text += text
    @stderr = write: (text) ~> @log-error += text
    @process = new ObservableProcess("features/example-apps/#{process-name}",
                                                stdout: @stdout,
                                                stderr: @stderr,
                                                verbose: (verbose is 'enabled'))
      ..on 'ended', done


  @When /^I run the "([^"]*)" application with the environment variables:$/, (app-name, env) ->
    env = env.rows-hash!
    delete env.key
    @process = new ObservableProcess path.join(process.cwd!, 'features', 'example-apps', app-name),
                                                env: env


  @When /^I wait for the output "([^"]*)"$/, (search-text, done) ->
    @called = 0
    @start-time = new Date!
    @process.wait search-text, ~>
      @called += 1
      @end-time = new Date!
      done!


  @When /^it ends/, (done) ->
    @process.stdin.write "\n"
    @process.wait "ended", done


  @When /^running the process "([^"]*)"$/ (command, done) ->
    @process = new ObservableProcess path.join(process.cwd!, 'features', 'example-apps', command), stdout: off
      ..on 'ended', ~>
        @result = @process.full-output!
        done!


  @When /^running the global process "([^"]*)"$/ (command, done) ->
    @process = new ObservableProcess command, stdout: off, stderr: off
      ..on 'ended', ~>
        @result = @process.full-output!
        done!


  @When /^running the process \[([^"]+)\]$/ (args, done) ->
    args = eval "[#{args}]"
    @process = new ObservableProcess args, stdout: off
      ..on 'ended', ~>
        @result = @process.full-output!
        done!


  @When /^the process ends$/, (done) ->
    wait-until (~> @exit is yes), done


  @When /^trying to instantiate ObservableProcess with the option "([^"]*)"$/ (option-code) ->
    eval livescript.compile "options = #{option-code}", bare: yes, header: no
    try
      new ObservableProcess 'ls', options
    catch
      @error = e



  @Then /^I receive a number$/ ->
    expect(+@pid).to.be.above 0


  @Then /^it emits the 'ended' event with exit code "([^"]*)" and killed "([^"]*)"$/ (expected-exit-code, expected-killed) ->
    expect(eval expected-exit-code).to.equal @exit-code
    expect(eval expected-killed).to.equal @killed


  @Then /^it is marked as ended/, ->
    expect(@process.ended).to.be.true


  @Then /^it is marked as killed$/, ->
    expect(@process.killed).to.be.true


  @Then /^it is no longer running$/, (done) ->
    request "http://localhost:#{@port}", (err) ->
      expect(err?.code).to.equal 'ECONNREFUSED'
      done!


  @Then /^it prints "([^"]*)"$/, (output, done) ->
    @process.wait output, done


  @Then /^it returns "([^"]*)"$/, (expected-text) ->
    expect(@result.trim!).to.equal expected-text


  @Then /^it throws the exception:$/ (string) ->
    expect(@error.message).to.include string


  @Then /^its accumulated output is empty$/ ->
    expect(@process.full-output!).to.be.empty


  @Then /^my stderr stream does not receive "([^"]*)"$/ (expected-text) ->
    expect(@log-error).to.not.contain expected-text


  @Then /^my stderr stream receives "([^"]*)"$/ (expected-text) ->
    expect(@log-error).to.contain expected-text


  @Then /^the callback is called after (\d+)ms$/, (expected-delay) ->
    expect(@called).to.equal 1
    expect(@end-time - @start-time).to.be.above expected-delay


  @Then /^the exit code is set in the \.exitCode property$/ ->
    expect(@process.exit-code).to.equal 1


  @Then /^the on\-exit event is emitted with the exit code (\d+)$/, (expected-exit-code, done) ->
    wait-until (~> @on-exit-called is yes), ~>
      expect(@exit-code).to.equal parse-int(expected-exit-code)
      done!


  @Then /^the process ends without errors$/ ->


  @Then /^the processes "([^"]*)" property is (true|false)$/, (property-name, value, done) ->
    process.next-tick ~>
      expect(@process[property-name]).to.equal eval(value)
      done!


  @Then /^the stderr I provided received no data$/, ->
    expect(@log-error).to.equal ''


  @Then /^the stderr I provided receives "([^"]*)"$/, (text, done) ->
    wait-until (~> @log-error.includes text), done


  @Then /^the stdout I provided received no data$/, ->
    expect(@log-text).to.equal ''


  @Then /^the stdout I provided receives "([^"]*)"$/, (text, done) ->
    wait-until (~> @log-text.includes text), done
