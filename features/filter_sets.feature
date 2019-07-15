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
        Given I see "2" rows in the table data tree
        When I press "Expand All"
        Then I should see "22" rows in the table data tree

## --------------- EDIT --------------- ##
    @javascript
    Scenario:  I should be able to APPLY and EDIT a set of filters.

## --------------- DELETE  --------------- ##
    @javascript
    Scenario:  I should be able to DELETE a set of filters.