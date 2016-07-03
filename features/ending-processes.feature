Feature: Recognizing process termination

  As a developer running a process that I expect to be running
  I want to be able to recognize if it has ended
  So that I run the next steps after the command is over, or am aware of unexpected crashes.

  Rules:
  - when the process ends, it sets the "ended" property to true


  Scenario: a process that ends
    Given I start an interactive process
    Then the processes "ended" property is false
    When it ends
    Then the on-exit event is emitted with the exit code 1
    And the processes "ended" property is true
    And the exit code is set in the .exitCode property
