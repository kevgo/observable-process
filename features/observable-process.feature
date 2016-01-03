Feature: Observing child process output

  As a developer spawning child processes that take a while to boot up
  I want to be able to wait until they signal they are ready
  So that my process setup is robust.

  Rules:
  - provide the command-line of the process to spawn in the constructor
  - call "wait" with the console output to wait for
    and the callback to call when that output occurs
  - the registered callback is called only once


  Scenario: waiting for a process to start up
    Given I spawn a process that outputs "online" after 100ms
    When I wait for the output "online"
    Then the callback is called after 150ms
