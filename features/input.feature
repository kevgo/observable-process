Feature: entering text

  As a user spawning an interactive process
  I want to be able to enter characters into the process
  So that I can control it.

  - call ".input" with the text to enter into the subprocess


  Scenario: entering text
    Given I start the "input" process
    When calling "process.enter('hello')"
    Then it prints "You entered hello"


