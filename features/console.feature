Feature: Printing the server output

  As a developer spawning a child process
  I want to be able to see its output on the command line
  So that spawning a process feels the same as running it directly.

  Rules:
  - output gets logged onto the console by default
  - logging is disabled by providing "console: null" as a parameter
  - custom console objects must implement the "stdout" and "stdin" methods


  Scenario: providing custom console streams
    When I run the "console-output" process with a custom console object
    Then the stdout I provided receives "normal output"
    And the stderr I provided receives "error output"


  Scenario: default behavior
    When I run the "console-output" process
    Then the process ends without errors


  Scenario: console disabled
    When I run the "console-output" process with a null console
    Then the process ends without errors
