Feature: Editable data via the Search Database page
	In order to find data about bat eco-interactions
	As a web visitor
	I need to be able to search the database

	Background:
		Given I am on "/login"
		And I fill in "Username" with "TestEditor"
		And I fill in "Password" with "passwordhere"
		And I press "_submit"
		And I am on "/search"
		And I resize browser window
		And I should see "TestEditor"

	# @javascript
	# Scenario:  Setup: Database loads and the welcome tutorial is exited.
	# 	Given the database has loaded
	# 	And I exit the tutorial

	@javascript
	Scenario:  I should be able to edit the name and level of an existing taxon
		Given the database grid is in "Taxon" view
		And I group interactions by "Arthropoda"
		And I click on the edit pencil for the "Order Lepidoptera" row
		And I see "Editing Taxon"
		When I change the "taxon name" field "input" to "Leopardil"
		When I change the "taxon level" dropdown field to "Class"
		And I press "Update Taxon"
		Then I should see "Class Leopardil" in the tree

	@javascript
	Scenario:  I should be able to edit the parent taxon of an existing taxon
		Given the database grid is in "Taxon" view
		And I group interactions by "Bats"
		And I expand "Family Phyllostomidae" in the data tree
		And I expand "Genus Rhinophylla" in the data tree
		And I click on the edit pencil for the "Rhinophylla pumilio" row
		And I see "Editing Taxon"
		When I press "Change Parent"
		And I see "Select New Taxon Parent"
		When I select "Artibeus" from the "Genus" field dropdown
		And I press "Confirm"
		And I press "Update Taxon"
		And I expand "Family Phyllostomidae" in the data tree
		Then I should see "Rhinophylla pumilio" under "Genus Artibeus" in the tree

	@javascript
	Scenario:  I should be able to edit the data of an existing location
		Given the database grid is in "Location" view
		And I expand "Central America" in the data tree
		And I expand "Costa Rica" in the data tree
		And I click on the edit pencil for the "Santa Ana-Forest" row
		And I see "Editing Location"
		When I change the "Display Name" field "input" to "Santa Ana-Captivity"
		When I change the "Description" field "textarea" to "Description..."
		When I change the "Habitat Type" dropdown field to "Captivity"
		When I change the "Elevation" field "input" to "1000"
		When I change the "Elevation Max" field "input" to "2000"
		When I change the "Latitude" field "input" to "9.7489"
		When I change the "Longitude" field "input" to "83.7534"
		And I press "Update Location"
		And I expand "Central America" in the data tree
		And I expand "Costa Rica" in the data tree
		And I click on the edit pencil for the "Santa Ana-Captivity" row
		And I see "Editing Location"
		Then I should see "Santa Ana-Captivity" in the "Display Name" field "input"
		Then I should see "Description..." in the "Description" field "textarea"
		Then I should see "Captivity" in the "Habitat Type" dropdown field
		Then I should see "1000" in the "Elevation" field "input"
		Then I should see "2000" in the "Elevation Max" field "input"
		Then I should see "9.7489" in the "Latitude" field "input"
		Then I should see "83.7534" in the "Longitude" field "input"

	@javascript
	Scenario:  I should be able to change the parent of an existing location
		Given the database grid is in "Location" view
		And I expand "Central America" in the data tree
		And I expand "Costa Rica" in the data tree
		And I click on the edit pencil for the "Santa Ana-Captivity" row
		When I change the "Country" dropdown field to "Panama"
		And I press "Update Location"
		And I expand "Central America" in the data tree
		Then I should see "Santa Ana-Captivity" under "Panama" in the tree
		And I should not see "Santa Ana-Captivity" under "Costa Rica" in the tree

	@javascript
	Scenario:  I should be able to edit the data of an existing publication
		Given the database grid is in "Source" view
		And I click on the edit pencil for the "Journal of Mammalogy" row
		And I see "Editing Publication"
		When I change the "Title" field "input" to "Book of Mammalogy"
		And I change the "Description" field "textarea" to "Description..."
		And I change the "Publication Type" dropdown field to "Book"
		And I change the "Link Url" field "input" to "www.link.com"
		And I change the "Link Display" field "input" to "Book Website"
		And I change the "Doi" field "input" to "10.1037/rmh0000008"
		And I change the "Publisher" dropdown field to "University of Paris VI"
		And I change the "Authors" dynamic dropdown field to "Cockle"
		And I press "Update Publication"
		And I select "Book" from the "Publication Type" dropdown
		And I click on the edit pencil for the "Book of Mammalogy" row
		And I see "Editing Publication"
		Then I should see "Book of Mammalogy" in the "Title" field "input"
		Then I should see "Description..." in the "Description" field "textarea"
		Then I should see "Book" in the "Publication Type" dropdown field
		Then I should see "www.link.com" in the "Link Url" field "input"
		Then I should see "Book Website" in the "Link Display" field "input"
		Then I should see "University of Paris VI" in the "Publisher" dropdown field
		Then I should see "Cockle" in the "Authors" field dynamic dropdown

	@javascript
	Scenario:  I should be able to edit the data of an existing author
		Given the database grid is in "Source" view
		And I group interactions by "Authors"
		And I click on the edit pencil for the "Cockle" row
		And I see "Editing Author"
		When I change the "Display Name" field "input" to "Cockel (K)"
		And I change the "First Name" field "input" to "Joy"
		And I change the "Middle Name" field "input" to "Karen"
		And I change the "Last Name" field "input" to "Cockel"
		And I change the "Link Url" field "input" to "www.link.com"
		And I change the "Link Display" field "input" to "Author Website"
		And I press "Update Author"
		And I click on the edit pencil for the "Cockel (K)" row
		And I see "Editing Author"
		Then I should see "Cockel (K)" in the "Display Name" field "input"
		Then I should see "Joy" in the "First Name" field "input"
		Then I should see "Karen" in the "Middle Name" field "input"
		Then I should see "Cockel" in the "Last Name" field "input"
		Then I should see "www.link.com" in the "Link Url" field "input"
		Then I should see "Author Website" in the "Link Display" field "input"

	@javascript
	Scenario:  I should be able to edit the data of an existing citation
		Given the database grid is in "Source" view
		And I group interactions by "Authors"
		And I expand "Gardner" in the data tree
		And I click on the edit pencil for the "Feeding habits" row
		And I see "Editing Citation"
		And I change the "Citation Text" field "textarea" to "Test Citation Text"
		And I change the "Abstract" field "textarea" to "Test Abstract"
		And I change the "Title" field "input" to "Feeding habits of bats"
		And I change the "Citation Type" dropdown field to "Article"
		And I change the "Year" field "input" to "1996"
		And I change the "Volume" field "input" to "4"
		And I change the "Issue" field "input" to "12"
		And I change the "Pages" field "input" to "333-336"
		And I change the "Link Url" field "input" to "www.link.com"
		And I change the "Link Display" field "input" to "Author Website"
		And I change the "Doi" field "input" to "10.1037/rmh0000008"
		When I change the "Authors" dynamic dropdown field to "Cockel (K)"
		And I press "Update Citation"
		And I should not see "Feeding habits" under "Gardner" in the tree
		And I expand "Cockel (K)" in the data tree
		And I click on the edit pencil for the "Feeding habits of bats" row
		And I see "Editing Citation"
		Then I should see "Test Citation Text" in the "Citation Text" field "textarea"
		And I should see "Test Abstract" in the "Abstract" field "textarea"
		And I should see "Feeding habits of bats" in the "Title" field "input"
		And I should see "Article" in the "Citation Type" dropdown field
		And I should see "1996" in the "Year" field "input"
		And I should see "4" in the "Volume" field "input"
		And I should see "12" in the "Issue" field "input"
		And I should see "333-336" in the "Pages" field "input"
		And I should see "www.link.com" in the "Link Url" field "input"
		And I should see "Author Website" in the "Link Display" field "input"
		And I should see "10.1037/rmh0000008" in the "Doi" field "input"
		And I should see "Cockel (K)" in the "Authors" field dynamic dropdown

	@javascript
	Scenario:  I should be able to change an interaction's publication
		Given the database grid is in "Source" view
		And I group interactions by "Publications"
		And I expand "In Biology of bats of the New World family Phyllostomatidae" in the data tree
		And I click on the edit pencil for the first interaction of "Feeding habits of bats"
		And I see "Editing Interaction"
		When I change the "Publication" dropdown field to "Book of Mammalogy"
		And I change the "Citation Title" dropdown field to "Observations on the life histories of Panama bats"
		And I press "Update Interaction"
		And I uncheck the time-updated filter
		And I expand "In Biology of bats of the New World family Phyllostomatidae" in the data tree
		And I expand "Book of Mammalogy" in the data tree
		Then I should see "3" interactions under "Observations on the life histories of Panama bats"
		And I should see "3" interactions under "Feeding habits of bats"

	# @javascript
	# Scenario:  I should be able to change an interaction's citation  #TODO
	# 	Given the database grid is in "Source" view
	# 	And I group interactions by "Publications"
	# 	And I break
	# 	And I expand "In Biology of bats of the New World family Phyllostomatidae" in the data tree
	# 	And I click on the edit pencil for the first interaction of "Feeding habits of bats"
	# 	And I see "Editing Interaction"
	# 	When I change the "Publication" dropdown field to "Book of Mammalogy"
	# 	And I change the "Citation Title" dropdown field to "Observations on the life histories of Panama bats"
	# 	And I press "Update Interaction"
	# 	And I uncheck the time-updated filter
	# 	And I expand "In Biology of bats of the New World family Phyllostomatidae" in the data tree
	# 	And I expand "Book of Mammalogy" in the data tree
	# 	Then I should see "3" interactions under "Observations on the life histories of Panama bats"
	# 	And I should see "3" interactions under "Feeding habits of bats"

	@javascript
	Scenario:  I should be able to change an interaction's location
		Given the database grid is in "Location" view
		And I expand "Central America" in the data tree
		And I expand "Panama" in the data tree
		And I click on the edit pencil for the first interaction of "Summit Experimental Gardens"
		And I see "Editing Interaction"
		When I change the "Location" dropdown field to "Panama"
		And I press "Update Interaction"
		And I uncheck the time-updated filter
		And I expand "Central America" in the data tree
		And I expand "Panama" in the data tree
		Then I should see "3" interactions under "Unspecified Panama Interactions"
		And I should not see "Summit Experimental Gardens" under "Panama" in the tree

	@javascript
	Scenario:  I should be able to change an interaction's subject taxon
		Given the database grid is in "Taxon" view
		And I group interactions by "Bats"
		And I expand "Family Phyllostomidae" in the data tree
		And I click on the edit pencil for the first interaction of "Unspecified Phyllostomidae Interactions"
		And I see "Editing Interaction"
		And I focus on the "Subject" taxon field
		And I see "Select Subject Taxon"
		When I select "Artibeus lituratus" from the "Species" field dropdown
		And I should see "Artibeus" in the "Genus" dropdown field
		And I press "Confirm"
		And I press "Update Interaction"
		And I uncheck the time-updated filter
		And I expand "Family Phyllostomidae" in the data tree
		And I expand "Genus Artibeus" in the data tree
		Then I should see "2" interactions under "Artibeus lituratus"
		And I should see "1" interactions under "Unspecified Phyllostomidae Interactions"

	@javascript
	Scenario:  I should be able to change an interaction's object taxon
		Given the database grid is in "Taxon" view
		And I group interactions by "Plants"
		And I expand "Family Araceae" in the data tree
		And I click on the edit pencil for the first interaction of "Unspecified Araceae Interactions"
		And I see "Editing Interaction"
		And I focus on the "Object" taxon field
		And I see "Select Object Taxon"
		When I select "Philodendron sphalerum" from the "Species" field dropdown
		And I should see "Philodendron" in the "Genus" dropdown field
		And I press "Confirm"
		And I press "Update Interaction"
		And I uncheck the time-updated filter
		And I expand "Family Araceae" in the data tree
		And I expand "Genus Philodendron" in the data tree
		Then I should see "2" interactions under "Philodendron sphalerum"
		And I should see "1" interactions under "Unspecified Araceae Interactions"

	@javascript
	Scenario:  I should be able to change an interaction's type, tags, and notes
		Given the database grid is in "Taxon" view
		And I group interactions by "Plants"
		And I expand "Family Araceae" in the data tree
		And I click on the edit pencil for the first interaction of "Unspecified Araceae Interactions"
		And I see "Editing Interaction"
		When I change the "Interaction Type" dropdown field to "Consumption"
		And I add the "Seed" interaction tag
		And I remove the "Flower" interaction tag
		And I change the "Note" field "textarea" to "New Test Note Description"
		And I press "Update Interaction"
		And I wait for form to submit successfully
		And I expand "Family Araceae" in the data tree
		And I click on the edit pencil for the first interaction of "Unspecified Araceae Interactions"
		And I see "Editing Interaction"
		Then I should see "Consumption" in the "Interaction Type" dropdown field
		Then I should see the "Seed" interaction tag
		Then I should not see the "Flower" interaction tag
		Then I should see "New Test Note Description" in the "Note" field "textarea"

	#Test form error handling