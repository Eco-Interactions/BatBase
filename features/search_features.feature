Feature: Search page features
	In order to interact with the database
	As a web visitor
	I should be able to use the various features of the search page

	Background:
		Given I am on "/search"
		And I group interactions by "Bats"

#CSV downloads

#expand tree
	@javascript
	Scenario:  I should be able to expand the data tree completely
		Given the database has loaded
		And I exit the tutorial
		And I group interactions by "Bats"
		And I see "2" rows in the grid data tree
		When I press "Expand All"
		Then I should see "22" rows in the grid data tree

	@javascript
	Scenario:  I should be able to collapse the data tree completely
		Given I press "Expand All"
		And I see "22" rows in the grid data tree
		When I press "Collapse All"
		Then I should see "1" rows in the grid data tree

	@javascript
	Scenario:  I should be able to expand the data tree by one
		Given I see "2" rows in the grid data tree
		When I press "xpand-1"
		And I should see "6" rows in the grid data tree

	@javascript
	Scenario:  I should be able to collapse the data tree by one
		Given I see "2" rows in the grid data tree
		When I press "collapse-1"
		And I should see "1" rows in the grid data tree

	@javascript
	Scenario:  The toggle tree button text should sync with tree state.
		Given I see "2" rows in the grid data tree
		When I press "xpand-1" "3" times
		Then I should see "22" rows in the grid data tree
		And I should see "Collapse All"

	@javascript
	Scenario:  The toggle tree button text should sync with tree state.
		Given I press "xpand-1" "3" times
		And I see "22" rows in the grid data tree
		And I see "Collapse All"
		When I press "collapse-1"
		Then I should see "Expand All"







#read tips

#tutorial loads

