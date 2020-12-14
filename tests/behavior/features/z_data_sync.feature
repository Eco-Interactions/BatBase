@db-sync
Feature: Local Data Storage updates with changes made by other editors
    In order to search the most recent interaction data
    As an editor
    The remote and local databases needs to sync on search page load

    @javascript
    Scenario: Two editors make changes to the data and their local databases sync
        Given editor "1" visits the database page
        And they exit the tutorial
        And editor "1" creates two interactions
        And editor "1" edits some sub-entity data
        And editor "2" visits the database page
        And they exit the tutorial
        And I break "Open console"
        And editor "2" creates two interactions
        And editor "2" edits some sub-entity data
        When each reloads the search page
        Then the new data should sync between the editors
        And they should see the expected changes in the data table