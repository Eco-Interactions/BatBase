Feature: Search page features and database grid controls
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
        # time-updated filter
        # run through all slides in tutorial

    Background:
        Given I am on "/search"
        And the database has loaded
        And I exit the tutorial
        And the database grid is in "Taxon" view
        And I group interactions by "Bats"
/* --------------- EXPAND AND COLLAPSE ROWS IN DATABASE TABLE --------------- */
    @javascript
    Scenario:  I should be able to expand the data tree completely
        Given I see "2" rows in the grid data tree
        When I press "Expand All"
        Then I should see "22" rows in the grid data tree

    @javascript
    Scenario:  I should be able to collapse the data tree completely
        Given I press "Expand All"
        And I see "22" rows in the grid data tree
        When I press "Collapse All"
        Then I should see "1" rows in the grid data tree

    @javascript
    Scenario:  I should be able to expand the data tree by one
        Given I see "2" rows in the grid data tree
        When I press "xpand-1"
        And I should see "6" rows in the grid data tree

    @javascript
    Scenario:  I should be able to collapse the data tree by one
        Given I see "2" rows in the grid data tree
        When I press "collapse-1"
        And I should see "1" rows in the grid data tree

    @javascript
    Scenario:  The toggle tree button text should sync with tree state.
        Given I see "2" rows in the grid data tree
        When I press "xpand-1" "3" times
        Then I should see "22" rows in the grid data tree
        And I should see "Collapse All"

    @javascript
    Scenario:  The toggle tree button text should sync with tree state.
        Given I press "xpand-1" "3" times
        And I see "22" rows in the grid data tree
        And I see "Collapse All"
        When I press "collapse-1"
        Then I should see "Expand All"
/* ------------------ SHOW SEARCH TIPS -------------------------------------- */
    @javascript
    Scenario:  I should be able to show the search tips
        When I press "Search Tips"
        Then I should see "Tips for searching"
/* ------------------ START TUTORIAL ---------------------------------------- */
    @javascript
    Scenario:  I should be able to start the tutorial
        When I press "Tutorial"
        Then I should see "This tutorial is a demonstration the search functionality."