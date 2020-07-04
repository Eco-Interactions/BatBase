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
        Given I am on "/login"
        And I fill in "Username" with "TestUser"
        And I fill in "Password" with "passwordhere"
        And I press the "_submit" button
        And I am on "/search"
        And the database has loaded
        And I exit the tutorial
## --------------- CREATE --------------- ##
    @javascript
    Scenario:  I should be able to CREATE a set of filters.
        Given the database table is in "Location" view
        And I break "Open console"
        And I toggle "open" the filter panel
        And I select "Costa Rica" from the "Country" dropdown
        And I set the date "cited" filter to "January 1, 1977"
        When I enter "Test Filter Set" in the "Saved Filters" dropdown
        And I should see "Test Filter Set" in the "Saved Filters" dropdown
        And I press the "Save" button
        And I should see "Date Published, Country." in the save modal
        And I press the "Submit" button
        Then I should see "(SET) Date Published, Country." in the filter status bar
        And I should see "Test Filter Set" in the "Saved Filters" dropdown

## --------------- EDIT --------------- ##
    @javascript
    Scenario:  I should be able to APPLY and EDIT a set of filters.
        Given the database table is in "Source" view
        And I toggle "open" the filter panel
        When I select "Test Filter Set" from the "Saved Filters" dropdown
        And I should see "Test Filter Set" in the "Saved Filters" dropdown
        And I press the "Apply" button
        Then I should see the table displayed in "Location" view
        And I should see "(SET) Date Published, Country." in the filter status bar
        And I should see "Test Filter Set" in the "Saved Filters" dropdown
        When I select "all" from the "Country" dropdown
        And I press the "Update" button
        And I should see "Date Published, Region." in the save modal
        And I press the "Submit" button
        Then I should see "(SET) Date Published, Region." in the filter status bar
        And I should see "Test Filter Set" in the "Saved Filters" dropdown

## --------------- DELETE  --------------- ##
 ##The first "Given" step is only needed because sometimes the tutorial isn't fully closed and this was easier than adding another wait
    @javascript
    Scenario:  I should be able to DELETE a set of filters.
        Given the database table is in "Source" view
        And I toggle "open" the filter panel
        When I select "Test Filter Set" from the "Saved Filters" dropdown
        And I should see "Test Filter Set" in the "Saved Filters" dropdown
        And I break "Press Delete and make sure it works. Tests not interacting with these buttons easily."
        And I press the "Delete" button
        And I press the "Confirm" button
        Then I should see "No Active Filters" in the filter status bar
        And I should see "" in the "Saved Filters" dropdown


