require! {
  '../..' : ObservableProcess
  'chai' : {expect}
  'wait' : {wait}
}


module.exports = ->

  @Given /^I spawn a process that outputs "([^"]*)" after (\d+)ms$/, (output, delay) ->
    @observable-process = new ObservableProcess "features/example-apps/delay-#{delay}"


  @When /^I wait for the output "([^"]*)"$/, (search-text, done) ->
    @called = 0
    @start-time = process.hrtime![1]
    @observable-process.wait search-text, ~>
      @called += 1
      @end-time = process.hrtime![1]
      done!


  @Then /^the callback is called after (\d+)ms$/, (expected-delay) ->
    expect(@called).to.equal 1
    actual-delay = @end-time - @start-time
    expect(actual-delay).to.be.above expected-delay
