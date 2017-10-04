Feature: Search
	In order to find data about bat eco-interactions
	As a web visitor
	I need to be able to search the database

	@javascript
	Scenario: Searching for a Bat interaction that exists
		Given I am on "/search"
		And the database has loaded
		And I exit the tutorial
		When I group taxa by "Bat"
		Then I should see "Order Chiroptera"