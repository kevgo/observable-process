Feature: deprecated options

  As a developer using a code base written against an older version of the ObservableProcess API
  I want to be notified about usage of deprecated parameters
  So that I know how to upgrade my code base.

  - providing "console" as an option to the constructor causes a deprecation warning


  Scenario: code uses the "console" option
    When trying to instantiate ObservableProcess with the option "console: off"
    Then it throws the exception:
      """
      Deprecated option: console
      Please use the new options "stdout" and "stderr"
      """
