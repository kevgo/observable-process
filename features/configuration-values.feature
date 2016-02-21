Feature: providing configuration values

  As a developer spawning a subprocess
  I want to be able to provide configuration values to my subprocess
  So that I can start it up in a way that suits my needs.

  Rules:
  - provide configuration values through the "configuration" parameter
  - this parameter is a hash of key-value pairs


  Scenario: providing configuration data
    When I spawn the "config-values" application with the environment variables:
      | KEY         | VALUE |
      | port        | 3000  |
      | exocommPort | 3100  |
    Then it prints "using port 3000"
    And it prints "using exocomm-port 3100"
