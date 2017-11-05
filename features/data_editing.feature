Feature: Editable data via the Search Database page
	In order to find data about bat eco-interactions
	As a web visitor
	I need to be able to search the database

	Background:
		Given I am on "/login"
		And I fill in "Username" with "TestEditor"
		And I fill in "Password" with "pw4test"
		And I press "_submit"
		And I am on "/search"
		And I resize browser window
		Then I should see "TestEditor"

	@javascript
	Scenario:  Setup: Database loads and the welcome tutorial is exited.
		Given the database has loaded
		And I exit the tutorial

	#Test for form error handling

	@javascript
	Scenario:  I should be able to edit the name and level of an existing taxon
		Given the database grid is in "Taxon" view
		And I group interactions by "Arthropoda"
		And I click on the edit pencil for the "Order Lepidoptera" row
		And I see "Editing Taxon"
		When I change the "taxon name" field "input" to "Leopardil"
		When I change the "taxon level" dropdown field to "Class"
		And I break
		And I press "Update Taxon"
		And I break
		Then I should see "Class Leopardil" in the tree

	@javascript
	Scenario:  I should be able to edit the parent taxon of an existing taxon
		Given the database grid is in "Taxon" view
		And I group interactions by "Bats"
		And I expand "Family Phyllostomidae" in the data tree
		And I expand "Genus Artibeus" in the data tree
		And I click on the edit pencil for the "Artibeus lituratus" row
		And I see "Editing Taxon"
		When I press "Change Parent"
		And I see "Select New Taxon Parent"
		When I select "Rhinophylla" from the "Genus" field dropdown
		And I press "Confirm"
		And I press "Update Taxon"
		And I expand "Family Phyllostomidae" in the data tree
		Then I should see "Artibeus lituratus" under "Genus Rhinophylla" in the tree