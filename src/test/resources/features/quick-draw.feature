# language: en
# ------------------------------------------------------------------------------
Feature: Play "Quick, Draw!"

  Scenario: Play with unmatched words
    When I start playing
    And I draw:
      # | submarine  |
      # | rhinoceros |
      # | van        |
      # | apple      |
      # | dog        |
      | teapot |

  Scenario: Play well
    When I start playing
    And I draw all requested words
