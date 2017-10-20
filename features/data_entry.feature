Feature: Initialize Search Page Database
	In order to add data about bat eco-interactions
	As an editor
	I need to be able to use the create forms

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

	# @javascript
	# Scenario:  I should be able to open the new interaction form
	# 	Given the database has loaded
	# 	And I exit the tutorial
	# 	When I press "New"
	# 	Then I should see "New Interaction"

	@javascript
	Scenario:  I should be able to create a publisher with its sub-form
		Given I open the New Interaction form
		And I enter "Test Publication" in the "Publication" field dropdown
		And I see "New Publication"
		When I enter "Test Publisher" in the "Publisher" field dropdown
		And I see "New Publisher"
		And I type "10.1037/rmh0000008" in the "Description" field "textarea"
		And I type "www.publisher.com" in the "Link Url" field "input"
		And I type "Test Publisher Webiste" in the "Link Display" field "input"
		And I press "Create Publisher"
		Then I should see "Test Publisher" in the "Publisher" field

	@javascript
	Scenario:  I should be able to create an author with its sub-form
		Given I open the New Interaction form
		And I enter "Test Publication" in the "Publication" field dropdown
		And I see "New Publication"
		When I enter "Test Author" in the "Authors" field dynamic dropdown
		And I type "George" in the "First Name" field "input"
		And I type "Michael" in the "Middle Name" field "input"
		And I type "Smith" in the "Last Name" field "input"
		And I type "www.author.com" in the "Link Url" field "input"
		And I type "Test Author Webiste" in the "Link Display" field "input"
		And I press "Create Author"
		And I break
		Then I should see "Test Author" in the "Authors" field dynamic dropdown

	@javascript
	Scenario:  I should be able to add a new publication with its sub-form
		Given I open the New Interaction form
		And I enter "Test Publication" in the "Publication" field dropdown
		And I see "New Publication"
		When I type "Test description" in the "Description" field "textarea"
		And I select "Book" from the "Publication Type" field dropdown
		And I type "www.publication.com" in the "Link Url" field "input"
		And I type "Test Publication Webiste" in the "Link Display" field "input"
		And I type "10.1037/rmh0000008" in the "Doi" field "input"
		And I select "Test Publisher" from the "Publisher" field dropdown
		And I select "Test Author" from the "Authors" field dynamic dropdown
		And I press "Create Publication"
		Then I should see "Test Publication" in the "Publication" field
		And I should see "Test Publication" in the "Publication" detail panel
		And I should see "Test description" in the "Publication" detail panel
		And I should see "Book" in the "Publication" detail panel
		And I should see "Test Publisher" in the "Publication" detail panel
		And I should see "Test Author" in the "Publication" detail panel

	@javascript
	Scenario:  I should be able to add a new citation with its sub-form
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
		And I select "Cockle" from the "Authors" field dynamic dropdown
		And I press "Create Citation"
		Then I should see "Test Citation" in the "Citation Title" field
		And I should see "Test Citation" in the "Citation" detail panel
		And I should see "Test Citation Text" in the "Citation" detail panel
		And I should see "Test Abstract Text" in the "Citation" detail panel
		And I should see "Article" in the "Citation" detail panel
		And I should see "29" in the "Citation" detail panel
		And I should see "3" in the "Citation" detail panel
		And I should see "333-666" in the "Citation" detail panel
		And I should see "Test Author, Cockle" in the "Citation" detail panel