Feature: Search Page Database Initialization
    In order to find data about bat eco-interactions
    As a web visitor
    I need to be able to load the database

    Background:
        Given I am on "/search"
        And the database has loaded
        Then I exit the tutorial

    ###----------------------- Taxon View -----------------------------------###
    @javascript
    Scenario:  There should be 10 initial bat interactions in the database grid.
        And I group interactions by "Bats"
        Then I should see "Order Chiroptera"
        And the count column should show "10" interactions
        And data in the interaction rows

    @javascript
    Scenario:  There should be 7 initial plant interactions in the database grid.
        And I group interactions by "Plants"
        Then I should see "Kingdom Plantae"
        And the count column should show "7" interactions
        And data in the interaction rows

    @javascript
    Scenario:  There should be 3 initial arthropod interactions in the database grid.
        And I group interactions by "Arthropoda"
        Then I should see "Phylum Arthropoda"
        And the count column should show "3" interactions
        And data in the interaction rows

    ##------------------------- Location View -------------------------------###
    @javascript
    Scenario:  There should be 3 region location in initial the database grid.
        Given the database grid is in "Location" view
        Then I should see "3" rows in the grid data tree
        And I should see "Central America"
        And data in the interaction rows

    ##------------------------- Source View ---------------------------------###
    @javascript
    Scenario:  There should be 4 publications in the initial database grid.
        Given the database grid is in "Source" view
        Then I should see "4" rows in the grid data tree
        And I should see "Journal of Mammalogy" in the tree
        And data in the interaction rows

    @javascript
    Scenario:  There should be 4 authors in the initial database grid.
        Given the database grid is in "Source" view
        And I group interactions by "Authors"
        Then I should see "4" rows in the grid data tree
        And I should see "Cockle, Anya" in the tree
        And data in the interaction rows

    @javascript
    Scenario:  There should be 3 publishers in the initial database grid.
        Given the database grid is in "Source" view
        And I group interactions by "Publishers"
        Then I should see "3" rows in the grid data tree
        And I should see "University of Paris VI" in the tree
        And data in the interaction rows