Feature: retrieving the complete text output so far

  As a developer verifying the output of a command
  I want to be able to retrieve the complete output received from the subprocess so far
  So that I can diff it against the expected text.

  - call "process.fullOutput()" to get the full output received from the process


  Scenario: the process has generated some output
    Given I run a process that has generated the output "hello"
    When calling 'process.fullOutput()'
    Then it returns "hello"
