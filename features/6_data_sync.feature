Feature: Local Data Storage
	In order to search the most recent interaction data
	As an editor
	The remote and local databases needs to sync on search page load

	@javascript
	Scenario: Two editors make changes to the data and their local databases sync
		Given two editors are logged into the website
		When each user creates two interactions
		And each edits some sub-entity data
		And each reloads the search page
		Then the new data should sync between the editors
		And they should see the expected changes in the data grid