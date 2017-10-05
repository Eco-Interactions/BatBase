Feature: Initialize Search Page Database
	In order to find data about bat eco-interactions
	As a web visitor
	I need to be able to search the database

	Background:
		Given I am on "/search"

	@javascript
	Scenario: The tutorial should be displayed on first search page load.
		Given the database has loaded
		Then I exit the tutorial

	### Taxon View ###
	@javascript
	Scenario:  There should be 10 initial bat interactions in the database grid.
		When I group taxa by "Bat"
		Then I should see "Order Chiroptera"
		And the count column should show "10" interactions
		And data in the interaction rows

	@javascript
	Scenario:  There should be 7 initial plant interactions in the database grid.
		When I group taxa by "Plant"
		Then I should see "Kingdom Plantae"
		And the count column should show "7" interactions
		And data in the interaction rows


	@javascript
	Scenario:  There should be 3 initial arthropod interactions in the database grid.
		When I group taxa by "Arthropod"
		Then I should see "Phylum Arthropoda"
		And the count column should show "3" interactions
		And data in the interaction rows

	## Location View ###
	@javascript
	Scenario:  There should be 3 initial region location in the database grid.
		Given the database grid is in "Location" view
		Then I should see "3" rows in the grid data tree
		And I should see "Central America"
		And data in the interaction rows

	@javascript
	Scenario:  There should be 4 initial publications in the database grid.
		Given the database grid is in "Source" view
		Then I should see "4" rows in the grid data tree
		And I should see "Journal of Mammalogy" in the tree
		And data in the interaction rows