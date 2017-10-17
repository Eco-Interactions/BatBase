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
	Scenario:  I should be able to add a new publication with its sub-form
		Given I open the New Interaction form
		And I enter "Test Publication" in the "Publication" field dropdown
		And I see "New Publication"
		When I type "Test description" in the "Description" field "textarea"
		And I select "Book" from the "Publication Type" field dropdown
		And I type "www.publication.com" in the "Link Url" field "input"
		And I type "Test Publication Webiste" in the "Link Display" field "input"
		And I type "10.1037/rmh0000008" in the "Doi" field "input"
		And I select "University of Paris VI" from the "Publisher" field dropdown
		And I select "Gardner" from the "Authors" field dynamic dropdown
		And I press "Create Publication"
		Then I should see "Test Publication" in the "Publication" field
		And I break
		And I should see "Test Publication" in the "Publication" detail panel
		And I should see "Test description" in the "Publication" detail panel
		And I should see "Book" in the "Publication" detail panel
		And I should see "University of Paris VI" in the "Publication" detail panel
		And I should see "Gardner" in the "Publication" detail panel
