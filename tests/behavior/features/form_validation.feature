@db-val-form
Feature: Custom form-validation alerts editor when there are validation issues.
    In order to enter accurate data into the bat eco-interactions database
    As an editor
    I need to see UI alerts when there are validation issues in the form data.

    ### WHAT IS BEING TESTED ###

    Background:
        Given the fixtures have been reloaded
        And I am on "/login"
        And I fill in "Username" with "TestEditor"
        And I fill in "Password" with "passwordhere"
        And I press the "_submit" button
        And I am on "/search"
        And I see "TestEditor"
        Given the database has loaded
        And I exit the tutorial
  ## ------------------------- ISSUE REPORT ----------------------------------##
    @javascript
    Scenario:  I should see an alert if I try to create an author|editor with the same
        display name as another author|editor.


    # @javascript
    # Scenario:  I should see an alert if I try to create an author|editor with the same
    #     display name as another author|editor.



    # @javascript
    # Scenario:  I should see an alert if I try to create an author|editor with the same
    #     display name as another author|editor.





    # @javascript
    # Scenario:  I should see an alert if I try to create an author|editor with the same
    #     display name as another author|editor.





    # @javascript
    # Scenario:  I should see an alert if I try to create an author|editor with the same
    #     display name as another author|editor.