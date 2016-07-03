Feature: Observing child process output

  As a developer starting child processes that takes a while to boot up
  I want the parent to wait until the child process signals it is ready
  So that my service setup is robust even in the face of startup delays.

  Rules:
  - a process is started and observed by an ObservableProcess instance
  - provide the command-line of the process to start in the constructor
  - call "wait" with the console output to wait for
    and the callback to call when that output occurs
  - the registered callback is called only once


  Scenario: waiting for a process to start up
    Given I start a process that outputs "online" after 100ms
    When I wait for the output "online"
    Then the callback is called after 150ms
