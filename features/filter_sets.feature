Feature: Save and manage custom sets of filters
    In order to have custom filter sets
    As a user
    I should be able to create, edit, and apply filter sets
    
    ### WHAT IS BEING TESTED ###  
        # Create new filter set
          # Save filter state as set
        # Edit existing filter set
          # Apply filter set
          # Update interactions from list  
        # Delete filter set

    Background:
        Given I am on "/search"
        And the database has loaded
        And I exit the tutorial
## --------------- CREATE --------------- ##
    @javascript
    Scenario:  I should be able to CREATE a set of filters.
        Given the database table is in "Location" view
        And I toggle "open" the filter panel
        And I select "Costa Rica" from the "Country" dropdown
        And I set the time "published" filter to "January, 1 1990"
        When I select "Test Filter Set" from the "Saved Filters" dropdown
        And I should see "Test Filter Set" in the "Filters" detail panel
        And I should see "Test Filter Set" in the "Filters" dropdown field
        And I press the "Save" button
        And I should see "Country, Time Published." in the save modal
        And I press the "Submit" button
        Then I should see "(SET) Country, Time Published." in the filter status bar
        And I should see "Test Filter Set" in the "Filters" dropdown field

## --------------- EDIT --------------- ##
    @javascript
    Scenario:  I should be able to APPLY and EDIT a set of filters.
        Given the database table is in "Source" view
        And I toggle "open" the filter panel
        When I select "Test Filter Set" from the "Saved Filters" dropdown
        And I should see "Test Filter Set" in the "Filters" detail panel
        And I should see "Test Filter Set" in the "Filters" dropdown field
        And I press the "Apply" button
        Then I should see the table displayed in "Location" view
        And I should see "(SET) Country, Time Published." in the filter status bar
        And I should see "Test Filter Set" in the "Filters" dropdown field
        When I select "- All- " from the "Country" dropdown
        And I press "Update" button
        And I should see "Region, Time Published." in the save modal
        And I press the "Submit" button
        Then I should see "(SET) Region, Time Published." in the filter status bar
        And I should see "Test Filter Set" in the "Filters" dropdown field

## --------------- DELETE  --------------- ##
    @javascript
    Scenario:  I should be able to DELETE a set of filters.
        Given I toggle "open" the filter panel
        When I select "Test Filter Set" from the "Saved Filters" dropdown
        And I should see "Test Filter Set" in the "Filters" detail panel
        And I should see "Test Filter Set" in the "Filters" dropdown field
        And I press the "Delete" button
        Then I should see "No Active Filters" in the filter status bar 
        And I should see "" in the "Filters" dropdown field
        And I should see "" in the "Filters" detail panel


