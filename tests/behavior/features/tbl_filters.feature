Feature: Filtering the data displayed in the database table
    In order to find specific data about bat eco-interactions
    As a web visitor
    I should be able to use the various view and filter options of the search page

    ### WHAT IS BEING TESTED ###
        # EACH VIEW'S FILTER OPTIONS:
          # Comboboxes: Select option and reset combobox.
          # Text filters
          # Time-published  (Time-updated needs to be worked on)
        ## TODO: Test table column filters

    Background:
        Given I am on "/search"
        Given the database has loaded
        Then I exit the tutorial
    ## -------------------------- Date Filter ---------------------------------##
    @javascript
    Scenario:  I should be able to filter the data by date published.
      Given the database table is in "Location" view
      And I break "Open console"
      And I toggle "open" the filter panel
      And I set the date "cited" filter to "Januray 1, 1990"
      Then I should see "3" rows in the table data tree
      And I should see "6" interactions in the table
      And I should see "Date Published." in the filter status bar

      # TODO: Edit fixture update at time so this filter has something to show
    # @javascript
    # Scenario:  I should be able to filter by the date the data was updated/added.
    #   Given the database table is in "Location" view
    #   And I toggle "open" the filter panel
    #   And I break "What time would be good to set the UPDATED at filter too? How many interactions then?"
    #   When I "check" the time "updated" filter
    #   And I set the time "updated" filter to "Januray 1, 2017"
    #   Then I should see "X" rows in the table data tree
    #   And I should see "X" interactions in the list
    #   And I should see "Time Updated." in the filter status bar

    ## -------------------------- Location -----------------------------------##
    @javascript
    Scenario:  I should be able to filter the data tree to a specific country.
        Given the database table is in "Location" view
        And I toggle "open" the filter panel
        When I select "Costa Rica" from the "Country" dropdown
        Then I should see "Central America" in the "Region" dropdown
        And I should see "3" rows in the table data tree
        And data in the interaction rows
        And I should see "Country." in the filter status bar

    ## -------------------------- Source -------------------------------------##
    @javascript
    Scenario:  I should be able to filter the data tree to a specific publication type.
      Given the database table is in "Source" view
      And I toggle "open" the filter panel
      When I select "Journal" from the "Pub Type" dropdown
      Then I should see "Journal of Mammalogy"
      And I should see "2" rows in the table data tree
      And data in the interaction rows
      And I should see "Publication Type." in the filter status bar

    @javascript
    Scenario:  I should be able to filter the data tree to a specific author.
      Given the database table is in "Source" view
      And I group interactions by "Authors"
      And I toggle "open" the filter panel
      When I type "Cockle" in the "Author" text box and press enter
      And I should see "1" rows in the table data tree
      And data in the interaction rows
      And I should see "cockle" in the filter status bar

    @javascript
    Scenario:  I should be able to filter the data tree to a specific publisher.
      Given the database table is in "Source" view
      And I group interactions by "Publishers"
      And I toggle "open" the filter panel
      When I type "University of Paris VI" in the "Publisher" text box and press enter
      And I should see "1" rows in the table data tree
      And data in the interaction rows
      And I should see "University" in the filter status bar

    ## -------------------------- Taxon --------------------------------------##
    @javascript
    Scenario:  I should be able to filter the data tree to a specific taxon.
      Given the database table is in "Taxon" view
      And I group interactions by "Bats"
      And I toggle "open" the filter panel
      When I select "Artibeus lituratus" from the "Species" dropdown
      Then I should see "Artibeus" in the "Genus" dropdown
      And I should see "Phyllostomidae" in the "Family" dropdown
      And I should see "2" rows in the table data tree
      And data in the interaction rows
      And I should see "Artibeus lituratus" in the filter status bar
