Feature: Recognizing crashes

  As a developer running a process that I expect to be running
  I want to be able to recognize if it has crashed
  So that I am aware of extraordinary circumstances when they happen.

  Rules:
  - when the process crashes, it sets the "crashed" property to true


  Scenario: a crashing process
    Given I spawn a volatile proces
    Then the "crashed" property is false
    When it crashes
    Then it invokes the on-exit callback
    And the "crashed" property is true
