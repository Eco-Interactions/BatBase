Feature: Filtering the data displayed in the database grid
    In order to find specific data about bat eco-interactions
    As a web visitor
    I should be able to use the various search options of the search page

    Background:
        Given I am on "/search"
        Given the database has loaded
        Then I exit the tutorial

    ## -------------------------- Location -----------------------------------##
    @javascript
    Scenario:  I should be able to filter the data tree to a specific country.
        Given the database grid is in "Location" view
        When I select "Costa Rica" from the "Country" dropdown
        Then I should see "Central America" in the "Region" dropdown
        And I should see "3" rows in the grid data tree
        And data in the interaction rows  

    @javascript
    Scenario:  I should be able to view interactions on the map 
        Given the database grid is in "Location" view
        When I select the Location view "Map Data"
        Then I should see the map with markers

    @javascript
    Scenario:  I should be able to show interactions in the grid from a map marker
        Given the database grid is in "Location" view
        And I select the Location view "Map Data"
        When I click on a map marker
        And I press the "Location Summary" button
        And I press the "Show Interactions In Data-Grid" button
        Then I should see data in the interaction rows

    @javascript
    Scenario:  I should be able to view a specific location on the map 
        Given the database grid is in "Location" view
        When I expand "Central America" in the data tree
        And I expand "Panama" in the data tree
        And I click on the map pin for "Summit Experimental Gardens"
        Then I should see the map with the location summary popup
        And I should see "Habitat: forest"
        And I should see "Cited bats: Artibeus lituratus"
    ## -------------------------- Source -------------------------------------##
    @javascript
    Scenario:  I should be able to filter the data tree to a specific publication type.
      Given the database grid is in "Source" view
      When I select "Journal" from the "Publication Type" dropdown
      Then I should see "Journal of Mammalogy"
      And I should see "2" rows in the grid data tree
      And data in the interaction rows

    @javascript
    Scenario:  I should be able to filter the data tree to a specific author.
      Given the database grid is in "Source" view
      And I group interactions by "Authors"
      When I type "Cockle" in the "Author" text box and press enter
      And I should see "1" rows in the grid data tree
      And data in the interaction rows

    @javascript
    Scenario:  I should be able to filter the data tree to a specific publisher.
      Given the database grid is in "Source" view
      And I group interactions by "Publishers"
      When I type "University of Paris VI" in the "Publisher" text box and press enter
      And I should see "1" rows in the grid data tree
      And data in the interaction rows
        
    ## -------------------------- Taxon --------------------------------------##
    @javascript
    Scenario:  I should be able to filter the data tree to a specific taxon.
      Given the database grid is in "Taxon" view
      And I group interactions by "Bats"
      When I select "Artibeus lituratus" from the "Species" dropdown
      Then I should see "Artibeus" in the "Genus" dropdown
      And I should see "Phyllostomidae" in the "Family" dropdown
      And I should see "2" rows in the grid data tree
      And data in the interaction rows
