Feature: Enabling more detailed output

  As a developer running a child process
  I want to be able to see extra details on the command line
  So that I can debug it easier.

  Rules:
  - more detailed output is enabled via the option "verbose: true"
  - when enabled, ObservableProcess outputs more detailed runtime information:
    - when the process ends
    - the exit code
  - the extra output goes to the current stdout object


  Scenario: default behavior
    When I run the "console-output" process with a custom stream
    Then my stderr stream does not receive "PROCESS ENDED"


  Scenario: verbose enabled
    When I run the "console-output" process with verbose enabled and a custom stream
    Then my stderr stream receives "PROCESS ENDED"
    And my stderr stream receives "EXIT CODE: 0"


  Scenario: verbose disabled
    When I run the "console-output" process with verbose disabled and a custom stream
    Then my stderr stream does not receive "PROCESS ENDED"
    And my stderr stream does not receive "EXIT CODE: 0"
