Feature: Resetting accumulated text stream

  As a developer dealing with an output stream
  I want to be able to clear all previously accumulated text
  So that I may search through only new and relevant data.

  Rules:
  - call ".resetOutputStreams()" to clear all accumulated output text


  Scenario: clear accumulated output text
    Given an observableProcess with accumulated output text
    When calling the "resetOutputStreams" method
    Then its accumulated output is empty
