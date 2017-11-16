Feature: Search page features
	In order to search the database
	As a web visitor
	I should be able to use the various features of the search page

	Background:
		Given I am on "/search"

	@javascript
	Scenario:  I should be able to filter the data tree to a specific taxon.
		Given the database grid is in "Taxon" view
		And I group interactions by "Bats"
		When I select "Artibeus lituratus" from the "Species" dropdown
		Then I should see "Artibeus" in the "Genus" dropdown
		And I should see "Phyllostomidae" in the "Family" dropdown
		And I should see "2" rows in the grid data tree
		And data in the interaction rows

	@javascript
	Scenario:  I should be able to filter the data tree to a specific country.
		Given the database grid is in "Location" view
		When I select "Costa Rica" from the "Country" dropdown
		Then I should see "Central America" in the "Region" dropdown
		And I should see "4" rows in the grid data tree
		And data in the interaction rows

	@javascript
	Scenario:  I should be able to filter the data tree to a specific publication type.
		Given the database grid is in "Source" view
		When I select "Journal" from the "Publication Type" dropdown
		Then I should see "Journal of Mammalogy"
		And I should see "2" rows in the grid data tree
		And data in the interaction rows

	@javascript
	Scenario:  I should be able to filter the data tree to a specific author.
		Given the database grid is in "Source" view
		And I group interactions by "Authors"
		When I type "Cockle" in the "Author" text box and press enter
		And I should see "1" rows in the grid data tree
		And data in the interaction rows

	@javascript
	Scenario:  I should be able to reset the data tree.
		Given the database grid is in "Source" view
		And I group interactions by "Publications"
		And I select "Journal" from the "Publication Type" dropdown
     	And I see "2" rows in the grid data tree
		When I press "Reset Data"
		And I should see "4" rows in the grid data tree
		And I should see "- All -" in the "Publication Type" dropdown
		And data in the interaction rows

#use column sorts