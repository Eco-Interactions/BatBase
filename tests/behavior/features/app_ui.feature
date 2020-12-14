@app-ui
Feature: Website's core features
    In order to interact with the website
    As a web visitor
    I should be able to see/use the various core features of the website

    ### WHAT IS BEING TESTED ###
        # Site-data statistics load in the header of specified pages

    # Background:
    #     Given I am on "/"
## ------------------------ PAGE HEADER SITE STATISTICS  -------------------- ##
    @javascript
    Scenario:  The home page site-statistics should load
        Given I am on "/"
        When the data-statistics load in the page header
        Then I should see "12" "Interactions" in the page header
        And I should see "4" "Bat Species" in the page header
        And I should see "4" "Citations" in the page header
        And I should see "6" "Locations" in the page header
        And I should see "3" "Countries" in the page header

    @javascript
    Scenario:  The about->database page site statistics should load
        Given I am on "/db"
        When the data-statistics load in the page header
        Then I should see "12" "Interactions" in the page header
        And I should see "4" "Bat Species" in the page header
        And I should see "3" "Other Species" in the page header
        And I should see "4" "Citations" in the page header
        And I should see "6" "Locations" in the page header
        And I should see "3" "Countries" in the page header

    @javascript
    Scenario:  The about->project page site statistics should load
        Given I am on "/about"
        When the data-statistics load in the page header
        Then I should see "4" "Users" in the page header
        And I should see "1" "Editors" in the page header

    @javascript
    Scenario:  The about->database page site statistics should load
        Given I am on "/search"
        When the data-statistics load in the page header
        Then I should see "12" "Interactions" in the page header
        And I should see "4" "Bat Species" in the page header
        And I should see "3" "Other Species" in the page header
        And I should see "4" "Citations" in the page header
        And I should see "6" "Locations" in the page header
        And I should see "3" "Countries" in the page header
