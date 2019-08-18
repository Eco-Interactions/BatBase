Feature: Save and manage custom Lists of interaction data
    In order to have custom Lists of interacitons
    As a user
    I should be able to create, edit, and interact with the custom Lists
    
    ### WHAT IS BEING TESTED ###  
        # Create new interaction list
          # Add interactions to list
        # Edit existing interaction list
          # Load list in table
          # Remove interactions from list  
        # Delete interaction list 

    Background:
        Given I am on "/login"
        And I fill in "Username" with "TestUser"
        And I fill in "Password" with "passwordhere"
        And I press the "_submit" button
        And I am on "/search"
        And the database has loaded
        And I exit the tutorial
        And the database table is in "Location" view
## --------------- CREATE INTERACTION LIST --------------- ##
    @javascript
    Scenario:  I should be able to CREATE a list, add interactions, save, and view list.
        Given I toggle "open" the data lists panel
        And the database table is in "Location" view
        When I enter "Test Interaction List" in the "Int List" dropdown
        And I should see "Test Interaction List" in the "Int List" dropdown
        And I toggle "open" the filter panel
        And I select "Costa Rica" from the "Country" dropdown
        And I select "add" "All Shown" from the list modification panel
        And I press the "Save List" button
        Then I should see "3" interactions in the list
        And I should see "Test Interaction List" in the "Int List" dropdown

## --------------- EDIT INTERACTION LIST --------------- ##
    @javascript
    Scenario:  I should be able to EDIT a list by adding interactions
        Given I toggle "open" the data lists panel
        And the database table is in "Location" view
        And I select "Test Interaction List" from the "Int List" dropdown
        And I should see "Test Interaction List" in the "Int List" dropdown
        And I toggle "open" the filter panel
        And I select "Panama" from the "Country" dropdown
        When I select "add" "All Shown" from the list modification panel
        # And I break "Just move forward."
        And I press the "Save List" button
        Then I should see "6" interactions in the list
        And I should see "Test Interaction List" in the "Int List" dropdown

    @javascript
    Scenario:  I should be able to EDIT a list by removing interactions
        Given I toggle "open" the data lists panel
        And I select "Test Interaction List" from the "Int List" dropdown
        And I should see "Test Interaction List" in the "Int List" dropdown
        # And I break "Click the screen to close the combobox dropdown."
        And I press the "Load Interaction List in Table" button
        And I should see "6" interactions in the table
        And I toggle "open" the filter panel
        And I select "Panama" from the "Country" dropdown
        When I select "remove" "All Shown" from the list modification panel
        And I press the "Save List" button
        Then I should see "3" interactions in the list
        And I should see "Test Interaction List" in the "Int List" dropdown

## --------------- DELETE INTERACTION LIST --------------- ##
    @javascript
    Scenario:  I should be able to DELETE a list.
        Given I toggle "open" the data lists panel
        And I select "Test Interaction List" from the "Int List" dropdown
        When I press the "Delete" button
        And I press the "Confirm" button
        Then I should see "" in the "Int List" dropdown


