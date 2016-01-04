Feature: Logging the server output

  As a developer spawning a child process
  I want to be able to see its output on the command line
  So that spawning a process feels the same as running it directly.

  Rules:
  - logging is enabled by providing the option "verbose: true" to the constructor
  - when enabled, all stdout and stderr from the spawned process is printed on the console.


  Scenario: verbose enabled
    Given I spawn the "console-output" process with verbose enabled
    Then the stdout I provided receives "normal output"
    And the stderr I provided receives "error output"
    When the process ends
    Then the stdout I provided receives "PROCESS ENDED"


  Scenario: verbose disabled
    Given I spawn the "console-output" process with verbose disabled
    When the process ends
    Then the stdout I provided received no data
    And the stderr I provided received no data
