Feature: Save and manage custom lists of interaction data
    In order to have custom lists of interacitons
    As a user
    I should be able to create, edit, and interact with the custom lists
    
    ### WHAT IS BEING TESTED ###  
        # Create new interaction list
          # Add interactions to list
        # Edit existing interaction list
          # Load list in table
          # Remove interactions from list  
        # Delete interaction list 

    Background:
        Given I am on "/search"
        And the database has loaded
        And I exit the tutorial
## --------------- CREATE INTERACTION LIST --------------- ##
    @javascript
    Scenario:  I should be able to CREATE a list, add interactions, save, and view list.
        Given I see "2" rows in the table data tree
        When I press "Expand All"
        Then I should see "22" rows in the table data tree

## --------------- EDIT INTERACTION LIST --------------- ##
    @javascript
    Scenario:  I should be able to EDIT a list, remove interactions, save, and view updates.

## --------------- DELETE INTERACTION LIST --------------- ##
    @javascript
    Scenario:  I should be able to DELETE a list.