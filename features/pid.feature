Feature: process ID

  As a developer spawning processes
  I want to be able to access the PID of the spawned process
  So that I can use Unix tools with it.

  - call ".pid()" to get the PID of the process


  Scenario: a running process
    Given I start a long-running process
    When gettings its PID
    Then I receive a number

