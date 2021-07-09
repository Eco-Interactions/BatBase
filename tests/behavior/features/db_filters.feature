@db-filters
Feature: Filtering the data displayed in the database table
    In order to find specific data about bat eco-interactions
    As a user
    I should be able to use the various view and filter options of the search page

    ### WHAT IS BEING TESTED ###
        # EACH VIEW'S FILTER OPTIONS:
          # Comboboxes: Select option and reset combobox.
          # Text filters
          # Time-published  (Time-updated needs to be worked on)
        # FILTER-SET: Create, Edit, Delete
        ## TODO: Test table column filters

    Background:
        Given I am on "/login"
        And I fill in "Username" with "TestUser"
        And I fill in "Password" with "passwordhere"
        And I press the "_submit" button
        And I am on "/search"
        And the database has loaded
        And I exit the tutorial
    ## -------------------------- Date Filter ---------------------------------##
    @javascript
    Scenario:  I should be able to filter the data by date published.
      Given the database table is grouped by "Locations"
      And I break "Open console"
      And I toggle "open" the filter panel
      And I set the date "cited" filter to "Januray 1, 1990"
      Then I should see "3" rows in the table data tree
      And I should see "6" interactions in the table
      And I should see "Date Published." in the filter status bar

      # TODO: Edit fixture update at time so this filter has something to show
    # @javascript
    # Scenario:  I should be able to filter by the date the data was updated/added.
    #   Given the database table is grouped by "Locations"
    #   And I toggle "open" the filter panel
    #   And I break "What time would be good to set the UPDATED at filter too? How many interactions then?"
    #   When I "check" the date "updated" filter
    #   And I set the date "updated" filter to "Januray 1, 2017"
    #   Then I should see "X" rows in the table data tree
    #   And I should see "X" interactions in the list
    #   And I should see "Time Updated." in the filter status bar

    # -------------------------- Location -----------------------------------##
    @javascript
    Scenario:  I should be able to filter the data tree to a specific country.
        Given the database table is grouped by "Locations"
        And I toggle "open" the filter panel
        And I see "Location and Date Filters"
        When I select "Costa Rica" from the "Country Filter" combobox
        Then I should see "Central America" in the "Region Filter" combobox
        And I should see "3" rows in the table data tree
        And data in the interaction rows
        And I should see "Country." in the filter status bar

    ## -------------------------- Source -------------------------------------##
    @javascript
    Scenario:  I should be able to filter the data tree to a specific publication type.
      Given the database table is grouped by "Sources"
      And I toggle "open" the filter panel
      And I see "Source and Date Filters"
      When I select "Journal" from the "Publication Type Filter" combobox
      Then i see "Journal of Mammalogy"
      And I should see "2" rows in the table data tree
      And data in the interaction rows
      And I should see "Publication Type." in the filter status bar

    @javascript
    Scenario:  I should be able to filter the data tree to a specific author.
      Given the database table is grouped by "Sources"
      And I view interactions by "Authors"
      And I toggle "open" the filter panel
      When I type "Cockle" in the "Author" text box and press enter
      And I should see "1" rows in the table data tree
      And data in the interaction rows
      And I should see "cockle" in the filter status bar

    @javascript
    Scenario:  I should be able to filter the data tree to a specific publisher.
      Given the database table is grouped by "Sources"
      And I view interactions by "Publishers"
      And I toggle "open" the filter panel
      When I type "University of Paris VI" in the "Publisher" text box and press enter
      And I should see "1" rows in the table data tree
      And data in the interaction rows
      And I should see "University" in the filter status bar

    ## -------------------------- Taxon --------------------------------------##
    @javascript
    Scenario:  I should be able to filter the data tree to a specific taxon.
      Given the database table is grouped by "Taxa"
      And I view interactions by "Bats"
      And I toggle "open" the filter panel
      And I see "Taxon and Date Filters"
      When I select "Artibeus lituratus" from the "Species Filter" combobox
      Then I should see "Artibeus" in the "Genus Filter" combobox
      And I should see "Phyllostomidae" in the "Family Filter" combobox
      And I should see "2" rows in the table data tree
      And I should see "Bats" in the taxon filter status bar
      And data in the interaction rows
      And I should see "Artibeus lituratus" in the filter status bar

    @javascript
    Scenario:  I should be able to filter the data tree to specific object groups.
      Given the database table is grouped by "Taxa"
      And I view interactions by "Bats"
      And I toggle "open" the filter panel
      When I select "[Fish, Bird, Potozoa]" from the "Taxon Groups Filter" combobox
      Then I should see "2" rows in the table data tree
      And data in the interaction rows
      And I should see "Taxon Group" in the filter status bar

    @javascript
    Scenario:  I should be able to filter the data tree to taxon sub-groups.
      Given the database table is grouped by "Taxa"
      And I view interactions by "Potozoas"
      And I toggle "open" the filter panel
      When I select "[Phylum Nematoda, Phylum Acanthocephala]" from the "Sub-Group Filter" combobox
      Then I should see "2" rows in the table data tree
      And data in the interaction rows
      And I should see "Sub-Group" in the filter status bar

## --------------- FILTER-SET CREATE --------------- ##
    @javascript
    Scenario:  I should be able to CREATE a set of filters.
        Given the database table is grouped by "Locations"
        And I toggle "open" the filter panel
        And I select "Costa Rica" from the "Country Filter" combobox
        And I set the date "cited" filter to "January 1, 1977"
        When I add "Test Filter Set" to the "Filter Set" combobox
        And I press the "Save" button
        And I should see "Date Published, Country." in the save modal
        And I press the "Submit" button
        Then I should see "(SET) Date Published, Country." in the filter status bar
        And I should see "Test Filter Set" in the "Filter Set" combobox

## --------------- FILTER-SET EDIT --------------- ##
    @javascript
    Scenario:  I should be able to APPLY and EDIT a set of filters.
        Given the database table is grouped by "Sources"
        And I toggle "open" the filter panel
        When I select "Test Filter Set" from the "Filter Set" combobox
        And I should see "Test Filter Set" in the "Filter Set" combobox
        And I press the "Apply" button
        Then I should see the table displayed in "Location" view
        And I should see "(SET) Date Published, Country." in the filter status bar
        And I should see "Test Filter Set" in the "Filter Set" combobox
        When I select "- All -" from the "Country Filter" combobox
        And I press the "Update" button
        And I should see "Date Published, Region." in the save modal
        And I press the "Submit" button
        Then I should see "(SET) Date Published, Region." in the filter status bar
        And I should see "Test Filter Set" in the "Filter Set" combobox

## --------------- FILTER-SET DELETE  --------------- ##
 ##The first "Given" step is only needed because sometimes the tutorial isn't fully closed and this was easier than adding another wait
    @javascript
    Scenario:  I should be able to DELETE a set of filters.
        Given the database table is grouped by "Sources"
        And I toggle "open" the filter panel
        When I select "Test Filter Set" from the "Filter Set" combobox
        And I should see "Test Filter Set" in the "Filter Set" combobox
        And I break "Press Delete and make sure it works. Tests not interacting with these buttons easily."
        And I press the "Delete" button
        And I press the "Confirm" button
        Then I should see "No Active Filters" in the filter status bar
        And I should see "" in the "Filter Set" combobox