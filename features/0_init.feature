Feature: Search Page Database Initialization
    In order to find data about bat eco-interactions
    As a web visitor
    I need to be able to load the database

    ### WHAT IS BEING TESTED ### 
        # INITIAL DATA LOADS, STORES, AND DISPLAYS AS EXPECTED

    Background:
        Given I am on "/search"
        And the database has loaded
        Then I exit the tutorial
        And I break "Open console"

    ###----------------------- Taxon View -----------------------------------###
    @javascript
    Scenario:  There should be 10 initial bat interactions in the database table.
        And I group interactions by "Bats"
        Then I see "Order Chiroptera"
        And the count column should show "10" interactions
        And data in the interaction rows

    @javascript
    Scenario:  There should be 7 initial plant interactions in the database table.
        And I group interactions by "Plants"
        Then I see "Kingdom Plantae"
        And the count column should show "7" interactions
        And data in the interaction rows

    @javascript
    Scenario:  There should be 3 initial arthropod interactions in the database table.
        And I group interactions by "Arthropoda"
        Then I see "Phylum Arthropoda"
        And the count column should show "3" interactions
        And data in the interaction rows

    ##------------------------- Location View -------------------------------###
    @javascript
    Scenario:  There should be 3 region location in initial the database table.
        Given the database table is in "Location" view
        Then I should see "3" rows in the table data tree
        And I see "Central America"
        And data in the interaction rows
    
    @javascript
    Scenario:  There should be 8 interactions in the initial map view.
        Given the database table is in "Location" view
        And I display locations in "Map" View
        Then I should see "8" interactions shown on the map
        And I should see markers on the map

    ##------------------------- Source View ---------------------------------###
    @javascript
    Scenario:  There should be 4 publications in the initial database table.
        Given the database table is in "Source" view
        Then I should see "4" rows in the table data tree
        And I see "Journal of Mammalogy"
        And data in the interaction rows

    @javascript
    Scenario:  There should be 4 authors in the initial database table.
        Given the database table is in "Source" view
        And I group interactions by "Authors"
        Then I should see "4" rows in the table data tree
        And I see "Cockle, Anya"
        And data in the interaction rows

    @javascript
    Scenario:  There should be 3 publishers in the initial database table.
        Given the database table is in "Source" view
        And I group interactions by "Publishers"
        Then I should see "3" rows in the table data tree
        And I see "University of Paris VI"
        And data in the interaction rows