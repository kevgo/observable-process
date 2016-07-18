Feature: Providing the command to run in various formats

  As a developer running subprocesses
  I want to be able to provide them either as a string or pre-parsed array
  So that I can use this library at the right level of abstraction.

  - when called with a string, it is parsed as Bash would
  - when called with an array, it uses those as-is


  Scenario: calling with a string
    When running the process "print-output hello"
    Then it returns "hello"


  Scenario: calling with an array
    When running the process ['./features/example-apps/print-output', 'hello']
    Then it returns "hello"
