require! {
  '../..' : ObservableProcess
  'chai' : {expect}
  'wait' : {wait-until}
}


module.exports = ->

  @Given /^I spawn a process that outputs "([^"]*)" after (\d+)ms$/, (output, delay) ->
    @observable-process = new ObservableProcess "features/example-apps/delay-#{delay}"


  @Given /^I spawn the "([^"]*)" process with logging (enabled|disabled)$/, (process-name, logging) ->
    @log-text = ''
    @log-error = ''
    @console =
      log: (text) ~> @log-text += text
      error: (text) ~> @log-error += text
    @exit = no
    @observable-process = new ObservableProcess "features/example-apps/#{process-name}",
                                                log: (logging is 'enabled'),
                                                console: @console,
                                                on-exit: ~> @exit = yes


  @When /^I wait for the output "([^"]*)"$/, (search-text, done) ->
    @called = 0
    @start-time = new Date!
    @observable-process.wait search-text, ~>
      @called += 1
      @end-time = new Date!
      done!


  @Then /^the stderr I provided receives "([^"]*)"$/, (text, done) ->
    wait-until (~> @log-error.includes text), done


  @Then /^the stderr I provided received no data$/, ->
    expect(@log-error).to.equal ''


  @Then /^the stdout I provided receives "([^"]*)"$/, (text, done) ->
    wait-until (~> @log-text.includes text), done


  @Then /^the stdout I provided received no data$/, ->
    expect(@log-text).to.equal ''


  @Then /^the callback is called after (\d+)ms$/, (expected-delay) ->
    expect(@called).to.equal 1
    expect(@end-time - @start-time).to.be.above expected-delay


  @When /^the process ends$/, (done) ->
    wait-until (~> @exit is yes), done
