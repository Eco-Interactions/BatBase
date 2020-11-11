@db-ui
Feature: Search page features and database table controls
    In order to interact with the database
    As a web visitor
    I should be able to use the various features and controls on the search page

    ### WHAT IS BEING TESTED ###
        # EXPAND AND COLLAPSE ROWS in database table
        # START TUTORIAL
        # OPEN SEARCH TIPS
        # DISPLAY INTERACTIONS IN TABLE ON THE MAP
            # RETURN THEM TO THE TABLE
        ## TODO
        # CSV downloads
        # run through all slides in tutorial

    Background:
        Given I am on "/search"
        And the database has loaded
        And I exit the tutorial
        And the database table is in "Taxon" view
        And I view interactions by "Bats"
## --------------- EXPAND AND COLLAPSE ROWS IN DATABASE TABLE --------------- ##
    @javascript
    Scenario:  I should be able to expand the data tree completely
        Given I see "2" rows in the table data tree
        And I break "Open console"
        When I press "Expand All"
        Then I should see "10" interactions in the table
        Then I should see "22" rows in the table data tree

    @javascript
    Scenario:  I should be able to collapse the data tree completely
        Given I press "Expand All"
        And I see "22" rows in the table data tree
        When I press "Collapse All"
        Then I should see "1" rows in the table data tree

    @javascript
    Scenario:  I should be able to expand the data tree by one
        Given I see "2" rows in the table data tree
        When I press "xpand-1"
        And I should see "6" rows in the table data tree

    @javascript
    Scenario:  I should be able to collapse the data tree by one
        Given I see "2" rows in the table data tree
        When I press "collapse-1"
        And I should see "1" rows in the table data tree

    @javascript
    Scenario:  The toggle tree button text should sync with tree state.
        Given I see "2" rows in the table data tree
        When I press "xpand-1" "3" times
        Then I should see "22" rows in the table data tree
        And i see "Collapse All"

    @javascript
    Scenario:  The toggle tree button text should sync with tree state.
        Given I press "xpand-1" "3" times
        And I see "22" rows in the table data tree
        And I see "Collapse All"
        When I press "collapse-1"
        Then i see "Expand All"
## ------------------ SHOW SEARCH TIPS -------------------------------------- ##
    @javascript
    Scenario:  I should be able to show the search tips
        When I press "Tips"
        Then i see "Tips for searching"
# ------------------ START TUTORIAL ---------------------------------------- ##
    @javascript
    Scenario:  I should be able to start the tutorial
        When I press "Tutorial"
        Then i see "Full Tutorial"

    @javascript
    Scenario:  I should be able to jump to the map section of the tutorial
        When I press "Tutorial"
        And I press the "Map View" button
        Then i see "Interactions in the table can be displayed on a map"
## --------- DISPLAY INTERACTIONS IN TABLE ON MAP --------------------------- ##
    @javascript
    Scenario:  I should be able to show interactions with gps data on the map
      Given the database table is grouped by "Sources"
      When I select "Journal" from the "Pub Type" dropdown
      And i see "Journal of Mammalogy"
      And I should see "2" rows in the table data tree
      And I press the "Map Interactions" button
      Then I should see "1" interactions shown on the map
      And I click on a map marker
      And I should see "Journal of Mammalogy -" in popup

    @javascript
    Scenario:  I should be able to view interactions on the map
        Given the database table is grouped by "Locations"
        When I select the Location view "Map Data"
        Then I should see the map with markers

    @javascript
    Scenario:  I should be able to show interactions in the table from a map marker
        Given the database table is grouped by "Locations"
        And I select the Location view "Map Data"
        When I click on a map marker
        And I press the "Show Interactions In Data-Table" button
        Then I should see data in the interaction rows

    @javascript
    Scenario:  I should be able to view a specific location on the map
        Given the database table is grouped by "Locations"
        When I expand "Central America" in the data tree
        And I expand "Panama" in the data tree
        And I click on the map pin for "Summit Experimental Gardens"
        Then I should see the map with the location summary popup
        And i see "Habitat: forest"
        And i see "Cited bats: Artibeus lituratus"