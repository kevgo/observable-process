Feature: Printing the server output

  As a developer running a child process
  I want to be able to see its output on the command line
  So that running a process feels the same as running it directly.

  Rules:
  - output gets logged to process.stdout by default
  - logging is disabled by providing "stdout: null" and "stderr: null" as a parameter
  - custom stdout and stderr objects must implement the "write" methods


  Scenario: providing custom streams
    When I run the "console-output" process with a custom stream
    Then the stdout I provided receives "normal output"
    And the stderr I provided receives "error output"


  Scenario: default behavior
    When I run the "console-output" process
    Then the process ends without errors


  Scenario: streams disabled
    When I run the "console-output" process with a null stream
    Then the process ends without errors
