Feature: Filtering the data displayed in the database table
    In order to find specific data about bat eco-interactions
    As a web visitor
    I should be able to use the various view and filter options of the search page

    ### WHAT IS BEING TESTED ### 
        # EACH VIEW'S FILTER OPTIONS: comboboxes and text filters in the options panel.
        ## TODO: Test table column filters

    Background:
        Given I am on "/search"
        Given the database has loaded
        Then I exit the tutorial

    ## -------------------------- Location -----------------------------------##
    @javascript
    Scenario:  I should be able to filter the data tree to a specific country.
        Given the database table is in "Location" view
        When I select "Costa Rica" from the "Country" dropdown
        Then I should see "Central America" in the "Region" dropdown
        And I should see "3" rows in the table data tree
        And data in the interaction rows  
    ## -------------------------- Source -------------------------------------##
    @javascript
    Scenario:  I should be able to filter the data tree to a specific publication type.
      Given the database table is in "Source" view
      When I select "Journal" from the "Pub Type" dropdown
      Then I should see "Journal of Mammalogy"
      And I should see "2" rows in the table data tree
      And data in the interaction rows

    @javascript
    Scenario:  I should be able to filter the data tree to a specific author.
      Given the database table is in "Source" view
      And I group interactions by "Authors"
      When I type "Cockle" in the "Author" text box and press enter
      And I should see "1" rows in the table data tree
      And data in the interaction rows

    @javascript
    Scenario:  I should be able to filter the data tree to a specific publisher.
      Given the database table is in "Source" view
      And I group interactions by "Publishers"
      When I type "University of Paris VI" in the "Publisher" text box and press enter
      And I should see "1" rows in the table data tree
      And data in the interaction rows
        
    ## -------------------------- Taxon --------------------------------------##
    @javascript
    Scenario:  I should be able to filter the data tree to a specific taxon.
      Given the database table is in "Taxon" view
      And I group interactions by "Bats"
      When I select "Artibeus lituratus" from the "Species" dropdown
      Then I should see "Artibeus" in the "Genus" dropdown
      And I should see "Phyllostomidae" in the "Family" dropdown
      And I should see "2" rows in the table data tree
      And data in the interaction rows
