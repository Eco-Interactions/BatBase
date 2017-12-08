Feature: Add new data to the database
	In order to have accurate data about bat eco-interactions
	As an editor
	I need to be able to add new data to the database

	Background:
		Given I am on "/login"
		And I fill in "Username" with "TestEditor"
		And I fill in "Password" with "passwordhere"
		And I press "_submit"
		And I am on "/search"
		Then I should see "TestEditor"

	# @javascript
	# Scenario:  Setup: Database loads and the welcome tutorial is exited.
	# 	Given the database has loaded
	# 	And I exit the tutorial

	@javascript
	Scenario:  I should be able to create a publisher with its sub-form
		Given I open the New Interaction form
		And I enter "Test Publication" in the "Publication" field dropdown
		And I see "New Publication"
		When I enter "Test Publisher" in the "Publisher" field dropdown
		And I see "New Publisher"
		And I type "Publisher Description" in the "Description" field "textarea"
		And I type "www.publisher.com" in the "Link Url" field "input"
		And I type "Test Publisher Webiste" in the "Link Display" field "input"
		And I press "Create Publisher"
		Then I should see "Test Publisher" in the "Publisher" field

	@javascript
	Scenario:  I should be able to create an author with its sub-form
		Given I open the New Interaction form
		And I enter "Test Publication" in the "Publication" field dropdown
		And I see "New Publication"
		When I enter "Smith, George" in the "Authors" field dynamic dropdown
		And I type "George" in the "First Name" field "input"
		And I type "Michael" in the "Middle Name" field "input"
		And I type "Smith" in the "Last Name" field "input"
		And I type "Sr" in the "Suffix" field "input"
		And I type "www.author.com" in the "Link Url" field "input"
		And I type "Test Author Webiste" in the "Link Display" field "input"
		And I press "Create Author"
		Then I should see "Smith, George Michael Sr" in the "Authors" field dynamic dropdown

	@javascript
	Scenario:  I should be able to create a publication with its sub-form
		Given I open the New Interaction form
		And I enter "Test Publication" in the "Publication" field dropdown
		And I see "New Publication"
		When I type "Test description" in the "Description" field "textarea"
		And I select "Book" from the "Publication Type" field dropdown
		And I type "www.publication.com" in the "Link Url" field "input"
		And I type "Test Publication Webiste" in the "Link Display" field "input"
		And I type "10.1037/rmh0000008" in the "Doi" field "input"
		And I select "Test Publisher" from the "Publisher" field dropdown
		And I select "Smith, George Michael Sr" from the "Authors" field dynamic dropdown
		And I press "Create Publication"
		Then I should see "Test Publication" in the "Publication" field
		And I should see "Test Publication" in the "Publication" detail panel
		And I should see "Test description" in the "Publication" detail panel
		And I should see "Book" in the "Publication" detail panel
		And I should see "Test Publisher" in the "Publication" detail panel
		And I should see "Smith, George Michael Sr" in the "Publication" detail panel

	@javascript
	Scenario:  I should be able to create a citation with its sub-form
		Given I open the New Interaction form
		And I select "Test Publication" from the "Publication" field dropdown
		And I enter "Test Citation" in the "Citation Title" field dropdown
		And I see "New Citation"
		When I type "Test Citation Text" in the "Citation Text" field "textarea"
		And I type "Test Abstract Text" in the "Abstract" field "textarea"
		And I select "Article" from the "Citation Type" field dropdown
		And I type "1990" in the "Year" field "input"
		And I type "29" in the "Volume" field "input"
		And I type "3" in the "Issue" field "input"
		And I type "333-666" in the "Pages" field "input"
		And I type "www.citation.com" in the "Link Url" field "input"
		And I type "Test Citation Webiste" in the "Link Display" field "input"
		And I type "10.1037/rmh0000008" in the "Doi" field "input"
		And I select "Cockel, Joy Karen Jr" from the "Authors" field dynamic dropdown
		And I press "Create Citation"
		Then I should see "Test Citation" in the "Citation Title" field
		And I should see "Test Citation" in the "Citation" detail panel
		And I should see "Test Citation Text" in the "Citation" detail panel
		And I should see "Test Abstract Text" in the "Citation" detail panel
		And I should see "Article" in the "Citation" detail panel
		And I should see "29" in the "Citation" detail panel
		And I should see "3" in the "Citation" detail panel
		And I should see "333-666" in the "Citation" detail panel
		And I should see "Smith, George Michael Sr, Cockel, Joy Karen Jr" in the "Citation" detail panel

	@javascript
	Scenario:  I should be able to create a location with its sub-form
		Given I open the New Interaction form
		And I enter "Test Location" in the "Location" field dropdown
		Then I should see "New Location"
		When I type "Test Description" in the "Description" field "textarea"
		And I select "Costa Rica" from the "Country" field dropdown
		And I select "Savanna" from the "Habitat Type" field dropdown
		And I type "1500" in the "Elevation" field "input"
		And I type "2500" in the "Elevation Max" field "input"
		And I type "-58.864905" in the "Latitude" field "input"
		And I type "3.339844" in the "Longitude" field "input"
		And I press "Create Location"
		Then I should see "Test Location" in the "Location" field
		And I should see "Test Description" in the "Location" detail panel
		And I should see "Savanna" in the "Location" detail panel
		And I should see "1500" in the "Location" detail panel
		And I should see "2500" in the "Location" detail panel
		And I should see "-58.864905" in the "Location" detail panel
		And I should see "3.339844" in the "Location" detail panel

	@javascript
	Scenario:  I should be able to create a taxon Family within the subject taxon sub-form
		Given I open the New Interaction form
		And I focus on the "Subject" taxon field
		And I see "Select Subject Taxon"
		When I enter "Subject Family" in the "Family" field dropdown
		And I see "New Taxon Family"
		And I press "Create Taxon"
		Then I should see "Subject Family" in the "Family" field

	@javascript
	Scenario:  I should be able to create a taxon Genus within the subject taxon sub-form
		Given I open the New Interaction form
		And I focus on the "Subject" taxon field
		And I see "Select Subject Taxon"
		And I select "Subject Family" from the "Family" field dropdown
		When I enter "Subject Genus" in the "Genus" field dropdown
		And I see "New Taxon Genus"
		And I press "Create Taxon"
		Then I should see "Subject Genus" in the "Genus" field

	@javascript
	Scenario:  I should be able to create a taxon Species within the subject taxon sub-form
		Given I open the New Interaction form
		And I focus on the "Subject" taxon field
		And I see "Select Subject Taxon"
		And I select "Subject Family" from the "Family" field dropdown
		And I select "Subject Genus" from the "Genus" field dropdown
		When I enter "Subject Species" in the "Species" field dropdown
		And I see "New Taxon Species"
		And I press "Create Taxon"
		Then I should see "Subject Species" in the "Species" field

	@javascript
	Scenario:  I should be able to select a taxon with the subject taxon select form
		Given I open the New Interaction form
		And I focus on the "Subject" taxon field
		And I see "Select Subject Taxon"
		And I select "Subject Family" from the "Family" field dropdown
		And I select "Subject Genus" from the "Genus" field dropdown
		And I select "Subject Species" from the "Species" field dropdown
		When I press "Confirm"
		Then I should see "Subject Species" in the "Subject" field

	@javascript
	Scenario:  I should be able to create a taxon Class within the object taxon sub-form
		Given I open the New Interaction form
		And I focus on the "Object" taxon field
		And I see "Select Object Taxon"
		When I select "Arthropod" from the "Realm" field dropdown
		And I enter "Object Class" in the "Class" field dropdown
		And I see "New Taxon Class"
		And I press "Create Taxon"
		Then I should see "Object Class" in the "Class" field

	@javascript
	Scenario:  I should be able to create a taxon Order within the object taxon sub-form
		Given I open the New Interaction form
		And I focus on the "Object" taxon field
		And I see "Select Object Taxon"
		When I select "Arthropod" from the "Realm" field dropdown
		And I select "Object Class" from the "Class" field dropdown
		And I enter "Object Order" in the "Order" field dropdown
		And I see "New Taxon Order"
		And I press "Create Taxon"
		Then I should see "Object Order" in the "Order" field

	@javascript
	Scenario:  I should be able to create a taxon Family within the object taxon sub-form
		Given I open the New Interaction form
		And I focus on the "Object" taxon field
		And I see "Select Object Taxon"
		When I select "Arthropod" from the "Realm" field dropdown
		And I select "Object Class" from the "Class" field dropdown
		And I select "Object Order" from the "Order" field dropdown
		And I enter "Object Family" in the "Family" field dropdown
		And I see "New Taxon Family"
		And I press "Create Taxon"
		Then I should see "Object Family" in the "Family" field

	@javascript
	Scenario:  I should be able to create a taxon Genus within the object taxon sub-form
		Given I open the New Interaction form
		And I focus on the "Object" taxon field
		And I see "Select Object Taxon"
		When I select "Arthropod" from the "Realm" field dropdown
		And I select "Object Class" from the "Class" field dropdown
		And I select "Object Order" from the "Order" field dropdown
		And I select "Object Family" from the "Family" field dropdown
		When I enter "Object Genus" in the "Genus" field dropdown
		And I see "New Taxon Genus"
		And I press "Create Taxon"
		Then I should see "Object Genus" in the "Genus" field

	@javascript
	Scenario:  I should be able to create a taxon Species within the object taxon sub-form
		Given I open the New Interaction form
		And I focus on the "Object" taxon field
		And I see "Select Object Taxon"
		When I select "Arthropod" from the "Realm" field dropdown
		And I select "Object Class" from the "Class" field dropdown
		And I select "Object Order" from the "Order" field dropdown
		And I select "Object Family" from the "Family" field dropdown
		And I select "Object Genus" from the "Genus" field dropdown
		When I enter "Object Species" in the "Species" field dropdown
		And I see "New Taxon Species"
		And I press "Create Taxon"
		Then I should see "Object Species" in the "Species" field

	@javascript
	Scenario:  I should be able to select a taxon with the object taxon select form
		Given I open the New Interaction form
		And I focus on the "Object" taxon field
		And I see "Select Object Taxon"
		When I select "Arthropod" from the "Realm" field dropdown
		And I select "Object Class" from the "Class" field dropdown
		And I select "Object Order" from the "Order" field dropdown
		And I select "Object Family" from the "Family" field dropdown
		And I select "Object Genus" from the "Genus" field dropdown
		And I select "Object Species" from the "Species" field dropdown
		When I press "Confirm"
		Then I should see "Object Species" in the "Object" field

	@javascript
	Scenario:  I should be able to create a new interaction with all fields filled
		Given I open the New Interaction form
		And I select "Test Publication" from the "Publication" field dropdown
		And I select "Test Citation" from the "Citation Title" field dropdown
		And I select "Costa Rica" from the "Country-Region" field dropdown
		And I select "Test Location" from the "Location" field dropdown
		And I focus on the "Subject" taxon field
		And I see "Select Subject Taxon"
		And I select "Subject Species" from the "Species" field dropdown
		And I press "Confirm"
		And I focus on the "Object" taxon field
		And I see "Select Object Taxon"
		And I select "Arthropod" from the "Realm" field dropdown
		And I select "Object Species" from the "Species" field dropdown
		And I press "Confirm"
		When I select "Consumption" from the "Interaction Type" field dropdown
		And I select "Arthropod" from the "Interaction Tags" field dropdown
		And I type "Detailed interaction notes." in the "Note" field "textarea"
		And I press "Create Interaction"
		Then I should see "New Interaction successfully created." in the form header

	@javascript
	Scenario:  Pinned field values should remain after interaction form submission (all others should clear)
		Given I open the New Interaction form
		And I select "Test Publication" from the "Publication" field dropdown
		And I select "Test Citation" from the "Citation Title" field dropdown
		And I pin the "Citation Title" field
		And I select "Costa Rica" from the "Country-Region" field dropdown
		And I select "Test Location" from the "Location" field dropdown
		And I pin the "Location" field
		And I focus on the "Subject" taxon field
		And I see "Select Subject Taxon"
		And I select "Subject Species" from the "Species" field dropdown
		And I press "Confirm"
		And I pin the "Subject" field
		And I focus on the "Object" taxon field
		And I see "Select Object Taxon"
		And I select "Arthropod" from the "Realm" field dropdown
		And I select "Object Species" from the "Species" field dropdown
		And I press "Confirm"
		When I select "Consumption" from the "Interaction Type" field dropdown
		And I pin the "Interaction Type" field
		And I select "Arthropod" from the "Interaction Tags" field dropdown
		And I type "Detailed interaction notes." in the "Note" field "textarea"
		And I press "Create Interaction"
		Then I should see "New Interaction successfully created." in the form header
		And I should see "Test Publication" in the "Publication" field
		And I should see "Test Citation" in the "Citation Title" field
		And I should see "Costa Rica" in the "Country-Region" field
		And I should see "Test Location" in the "Location" field
		And I should see "Subject Species" in the "Subject" field
		And the "Object" select field should be empty
		And I should see "Consumption" in the "Interaction Type" field
		And the "Interaction Tags" select field should be empty
		And the "Note" field should be empty

	@javascript
	Scenario:  The grid should not change views when form closes without submitting 
		Given I open the New Interaction form
		And the database grid is in "Location" view
		When I exit the form window
		Then I should see the grid displayed in "Location" view

	@javascript
	Scenario:  The grid should reload in Source view after creating an interaction.
		Given I open the New Interaction form
		And I fill the new interaction form with the test values
		And I press "Create Interaction"
		And I see "New Interaction successfully created." in the form header
		When I exit the form window
		Then I should see the grid displayed in "Source" view
		And the grid should be filtered to interactions created since "today"
		And I should see "4" row in the grid data tree

	@javascript
	Scenario:  I should see the newly created interactions under the publication source
		Given the database grid is in "Source" view
		And I filter the grid to interactions created since "today"
		When I expand "Test Publication" in the data tree
		Then I should see "3" interactions under "Test Citation"
		And the expected data in the interaction row

	@javascript
	Scenario:  I should see the newly created interactions under the author [Cockel, Joy Karen Jr]
		Given the database grid is in "Source" view
		And I group interactions by "Authors"
		And I filter the grid to interactions created since "today"
		When I expand "Cockel, Joy Karen Jr" in the data tree
		Then I should see "3" interactions under "Test Citation"
		And the expected data in the interaction row

	@javascript
	Scenario:  I should see the newly created interactions under the author [Smith, George Michael Sr]
		Given the database grid is in "Source" view
		And I group interactions by "Authors"
		And I filter the grid to interactions created since "today"
		When I expand "Smith, George Michael Sr" in the data tree
		And I expand "Test Citation" in the data tree
		And I expand "Test Publication" in the data tree
		And I expand "Test Citation" in level "3" of the data tree
		Then I should see "6" interactions attributed
		And the expected data in the interaction row

	@javascript
	Scenario:  I should see the newly created interactions under the location
		Given the database grid is in "Location" view
		And I filter the grid to interactions created since "today"
		When I expand "Central America" in the data tree
		And I expand "Costa Rica" in the data tree
		Then I should see "3" interactions under "Test Location"
		And the expected data in the interaction row

	@javascript
	Scenario:  I should see the newly created interactions under the subject taxon
		Given the database grid is in "Taxon" view
		And I group interactions by "Bats"
		And I filter the grid to interactions created since "today"
		When I expand "Family Subject Family" in the data tree
		And I expand "Genus Subject Genus" in the data tree
		Then I should see "3" interactions under "Subject Species"
		And the expected data in the interaction row

	@javascript
	Scenario:  I should see the newly created interactions under the object taxon
		Given the database grid is in "Taxon" view
		And I group interactions by "Arthropoda"
		And I filter the grid to interactions created since "today"
		When I expand "Class Object Class" in the data tree
		When I expand "Order Object Order" in the data tree
		When I expand "Family Object Family" in the data tree
		And I expand "Genus Object Genus" in the data tree
		Then I should see "3" interactions under "Object Species"
		And the expected data in the interaction row
