Feature: Edit data in the database
    In order to have accurate data about bat eco-interactions
    As an editor
    I need to be able to edit the data in the database

    ### WHAT IS BEING TESTED ### 
        # ENTITY EDITS AND RELATED UPDATES TO STORED DATA AND TABLE DISPLAY
        ## TODO
        # Test form error handling 
        # Test changing an interaction's citation
    
    ## Todo: 
    Background:
        Given the fixtures have been reloaded
        And I am on "/login"
        And I fill in "Username" with "TestEditor"
        And I fill in "Password" with "passwordhere"
        And I press the "_submit" button
        And I am on "/search"
        And I should see "TestEditor"
        Given the database has loaded
        And I exit the tutorial

  ## -------------------------- Interaction ----------------------------------##
    @javascript
    Scenario:  I should be able to change an interaction's location
        Given the database grid is in "Location" view
        And I expand "Central America" in the data tree
        And I expand "Panama" in the data tree
        And I click on the edit pencil for the first interaction of "Summit Experimental Gardens"
        And I see "Editing Interaction"
        When I change the "Location" dropdown field to "Panama"
        And I press the "Update Interaction" button
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
        When I select "Artibeus lituratus" from the "Species" dropdown field
        And I should see "Artibeus" in the "Genus" dropdown field
        And I press the "Confirm" button
        And I press the "Update Interaction" button
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
        When I select "Philodendron sphalerum" from the "Species" dropdown field
        And I should see "Philodendron" in the "Genus" dropdown field
        And I press the "Confirm" button
        And I press the "Update Interaction" button
        And I uncheck the time-updated filter
        And I expand "Family Araceae" in the data tree
        And I expand "Genus Philodendron" in the data tree
        Then I should see "2" interactions under "Philodendron sphalerum"
        And I should see "1" interactions under "Unspecified Araceae Interactions"
        
    # pressing update twice because the first time isn't working and I don't know why #timecrunched *
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
        And I press the "Update Interaction" button
        And I press the "Update Interaction" button
        And I expand "Family Araceae" in the data tree
        And I click on the edit pencil for the first interaction of "Unspecified Araceae Interactions"
        And I see "Editing Interaction"
        Then I should see "Consumption" in the "Interaction Type" dropdown field
        Then I should see the "Seed" interaction tag
        Then I should not see the "Flower" interaction tag
        Then I should see "New Test Note Description" in the "Note" field "textarea"

    # @javascript
    # Scenario:  I should be able to change an interaction's citation  #TODO
      # Given the database grid is in "Source" view
      # And I group interactions by "Publications"
      # And I break
      # And I expand "Biology of bats of the New World family Phyllostomatidae" in the data tree
      # And I click on the edit pencil for the first interaction of "Feeding habits"
      # And I see "Editing Interaction"
      # When I change the "Publication" dropdown field to "Book of Mammalogy"
      # And I change the "Citation Title" dropdown field to "Observations on the life histories of Panama bats"
      # And I press the "Update Interaction" button
      # And I uncheck the time-updated filter
      # And I expand "Biology of bats of the New World family Phyllostomatidae" in the data tree
      # And I expand "Book of Mammalogy" in the data tree
      # Then I should see "3" interactions under "Observations on the life histories of Panama bats"
      # And I should see "3" interactions under "Feeding habits"

  ## -------------------------- Location -------------------------------------##
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
        And I press the "Update Location" button
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
        And I click on the edit pencil for the "Santa Ana-Forest" row
        When I change the "Country" dropdown field to "Panama"
        And I press the "Update Location" button
        And I expand "Central America" in the data tree
        Then I should see "Santa Ana-Forest" under "Panama" in the tree
        And I should not see "Santa Ana-Forest" under "Costa Rica" in the tree

#   ## -------------------------- Source ---------------------------------------##
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
        And I add "Cockle, Anya" to the "Authors" dynamic dropdown field 
        And I press the "Update Publication" button
        And I select "Book" from the "Publication Type" dropdown
        And I click on the edit pencil for the "Book of Mammalogy" row
        And I see "Editing Publication"
        Then I should see "Book of Mammalogy" in the "Title" field "input"
        Then I should see "Description..." in the "Description" field "textarea"
        Then I should see "Book" in the "Publication Type" dropdown field
        Then I should see "www.link.com" in the "Link Url" field "input"
        Then I should see "Book Website" in the "Link Display" field "input"
        Then I should see "University of Paris VI" in the "Publisher" dropdown field
        Then I should see "Cockle, Anya" in the "Authors" field dynamic dropdown

    @javascript
    Scenario:  I should be able to edit the data of an existing author
        Given the database grid is in "Source" view
        And I group interactions by "Authors"
        And I click on the edit pencil for the "Cockle, Anya" row
        And I see "Editing Author"
        When I change the "First Name" field "input" to "Joy"
        And I change the "Middle Name" field "input" to "Karen"
        And I change the "Last Name" field "input" to "Cockel"
        And I change the "Suffix" field "input" to "Jr"
        And I change the "Link Url" field "input" to "www.link.com"
        And I change the "Link Display" field "input" to "Author Website"
        And I press the "Update Author" button
        And I click on the edit pencil for the "Cockel, Joy Karen Jr" row
        And I see "Editing Author"
        Then I should see "Joy" in the "First Name" field "input"
        Then I should see "Karen" in the "Middle Name" field "input"
        Then I should see "Cockel" in the "Last Name" field "input"
        Then I should see "Jr" in the "Suffix" field "input"
        Then I should see "www.link.com" in the "Link Url" field "input"
        Then I should see "Author Website" in the "Link Display" field "input"

    @javascript
    Scenario:  I should be able to edit the data of an existing publisher
        Given the database grid is in "Source" view
        And I group interactions by "Publishers"
        And I click on the edit pencil for the "University of Paris VI" row
        And I see "Editing Publisher"
        When I change the "Display Name" field "input" to "University of Paris V"
        And I change the "City" field "input" to "Nice"
        And I change the "Country" field "input" to "France"
        And I change the "Description" field "textarea" to "Something descriptive"
        And I change the "Link Url" field "input" to "www.link.com"
        And I change the "Link Display" field "input" to "Publisher Website"
        And I press the "Update Publisher" button
        And I click on the edit pencil for the "University of Paris V" row
        And I see "Editing Publisher"
        Then I should see "Nice" in the "City" field "input"
        Then I should see "France" in the "Country" field "input"
        Then I should see "Something descriptive" in the "Description" field "textarea"
        Then I should see "www.link.com" in the "Link Url" field "input"
        Then I should see "Publisher Website" in the "Link Display" field "input"

#todo - test proper removal of citation from authors in tree
    @javascript
    Scenario:  I should be able to edit the data of an existing citation [CHAPTER->BOOK]
        Given the database grid is in "Source" view
        And I group interactions by "Authors"
        And I expand "Gardner, Alfred L" in the data tree
        When I click on the edit pencil for the "Feeding habits" row
        And I see "Editing Citation"
        And I change the "Citation Type" dropdown field to "Book"
        And I change the "Abstract" field "textarea" to "Test Abstract"
        And I change the "Edition" field "input" to "4"
        And I change the "Link Url" field "input" to "www.link.com"
        And I change the "Link Display" field "input" to "Citation Website"
        And I change the "Doi" field "input" to "10.1037/rmh0000008"
        And I change the "Authors" dynamic dropdown field to "Cockle, Anya"
        And I add "Baker, Herbert G" to the "Authors" dynamic dropdown field 
        And I see "Cockle, A. & H. G. Baker. 1977. Biology of bats of the New World family Phyllostomatidae (P. Bloedel, ed.). 4. Britanica Books, Wellingsworth, Britan." in the "Citation Text" field "textarea"
        And I press the "Update Citation" button
        And I should not see "Gardner, Alfred L" in the tree 
        And I expand "Baker, Herbert G" in the data tree
        And I click on the edit pencil for the "Feeding habits" row
        And I see "Editing Citation"
        Then I should see "Cockle, A. & H. G. Baker. 1977. Biology of bats of the New World family Phyllostomatidae (P. Bloedel, ed.). 4. Britanica Books, Wellingsworth, Britan." in the "Citation Text" field "textarea"
        And I should see "Test Abstract" in the "Abstract" field "textarea"
        And I should see "Feeding habits" in the "Title" field "input"
        And I should see "Book" in the "Citation Type" dropdown field
        And I should see "4" in the "Edition" field "input"
        And I should see "www.link.com" in the "Link Url" field "input"
        And I should see "Citation Website" in the "Link Display" field "input"
        And I should see "10.1037/rmh0000008" in the "Doi" field "input"
        And I should see "Baker, Herbert G" in the "Authors" field dynamic dropdown
        And I should see "Cockle, Anya" in the "Authors" field dynamic dropdown

    @javascript
    Scenario:  I should be able to change an interaction's publication
        Given the database grid is in "Source" view
        And I group interactions by "Publications"
        And I expand "Biology of bats of the New World family Phyllostomatidae" in the data tree
        And I click on the edit pencil for the first interaction of "Feeding habits"
        And I see "Editing Interaction"
        When I change the "Publication" dropdown field to "Journal of Mammalogy"
        And I change the "Citation Title" dropdown field to "Observations on the life histories of Panama bats"
        And I press the "Update Interaction" button
        And I uncheck the time-updated filter
        And I expand "Biology of bats of the New World family Phyllostomatidae" in the data tree
        And I expand "Journal of Mammalogy" in the data tree
        Then I should see "3" interactions under "Observations on the life histories of Panama bats"
        And I should see "3" interactions under "Feeding habits"

  ## -------------------------- Taxon ----------------------------------------##
    @javascript
    Scenario:  I should be able to edit the name and level of an existing taxon
        Given the database grid is in "Taxon" view
        And I group interactions by "Arthropoda"
        And I click on the edit pencil for the "Order Lepidoptera" row
        And I see "Editing Taxon"
        When I change the "taxon name" field "input" to "Leopardil"
        When I change the "taxon level" dropdown field to "Class"
        And I press the "Update Taxon" button
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
        When I select "Artibeus" from the "Genus" dropdown field
        And I press the "Confirm" button
        And I press the "Update Taxon" button
        And I expand "Family Phyllostomidae" in the data tree
        Then I should see "Rhinophylla pumilio" under "Genus Artibeus" in the tree