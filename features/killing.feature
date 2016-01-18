Feature: killing a running process

  As a developer running processes in the background
  I want to be able to stop them
  So that I can clean up my processes once I'm done with them.

  Rules:
  - call "kill" on a process to kill it
  - if a process has been killed, its "killed" property is set


  Scenario: killing a running process
    Given I spawn a long-running process
    When I kill it
    Then it is marked as killed
    And it is no longer running
