Feature: Auto-detecting the path to the executable

  As a developer
  I want to be able to use spawn system commands without having to specify their absolute path
  So that my programs run on a variety of machines.

  - when the executable is a relative path, ObservableProcess determines the absolute path for it
  - when the executable is an absolute path, ObservableProcess uses it directly


  Scenario: relative path given
    Given I spawn the global command "node -h"
    Then it prints "Usage: node [options]"


  Scenario: absolute path given
    Given I spawn the local command "console-output"
    Then it prints "normal output"
