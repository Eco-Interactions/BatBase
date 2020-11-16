@db-new-data
Feature: Add new data to the database
    In order to have accurate data about bat eco-interactions
    As an editor
    I need to be able to add new data to the database

    ### WHAT IS BEING TESTED ###
        # INTERACTION CREATE FORM FILL, SUBMISSION, AND TABLE RELOADS
        # ALL SUB-ENTITY CREATE FORMS
        ## TODO
        # VARIOUS SOURCE TYPE SELECTIONS and their respective UI changes
    ### NOTE
        # SOME STEPS ARE COMBINED TO MAKE TESTING FASTER AFTER CONFIRMING EACH
        # SECTION WORKS AS EXPECTED.

    Background:
        Given I am on "/login"
        And I fill in "Username" with "TestEditor"
        And I fill in "Password" with "passwordhere"
        And I press the "_submit" button
        And I am on "/search"
        And i see "TestEditor"
        Given the database has loaded
        And I exit the tutorial

## ======= SINGLE SCENARIO COMBINING THE TESTS COMMENTED BELOW ============== ##
## Creates all sub-entities ##
    @javascript
    Scenario:  I create all possible sub-entities in the interaction form.
        Given I press the "New" button
        And I break "Open console"
        And I see "New Interaction"
        ## Publication Book ##
        And I add "Test Book" to the "Publication" combobox
        And I see "New Publication"
        And I select "Book" from the "Publication Type" combobox
        ## Publisher ##
        And I add "Test Publisher" to the "Publisher" combobox
        And I see "New Publisher"
        And I check the "Show all fields" box
        And I type "Nice" in the "City" field "input"
        And I type "France" in the "Country" field "input"
        And I type "Publisher Description" in the "Description" field "textarea"
        And I type "https://www.publisher.com" in the "Website" field "input"
        And I press the "Create Publisher" button
        And I press submit in the confirmation popup
        And I wait for the "sub2" form to close
        ### Author ##
        And I add "Smith, George" to the "Authors" dynamic combobox
        And I check the "Show all fields" box
        And I type "Bendry" in the "First Name" field "input"
        And I type "J" in the "Middle Name" field "input"
        And I type "Callaye" in the "Last Name" field "input"
        And I type "Jr" in the "Suffix" field "input"
        And I type "https://www.author.com" in the "Website" field "input"
        And I press the "Create Author" button
        And I press submit in the confirmation popup
        And I wait for the "sub2" form to close
        ## Book Details ##
        And I check the "Show all fields" box
        And I type "1990" in the "Year" field "input"
        And I type "https://doi.org/10.1037/rmh0000008" in the "Doi" field "input"
        And I type "Test description" in the "Description" field "textarea"
        And I type "https://www.publication.com" in the "Website" field "input"
        And I press the "Create Publication" button
        And I press submit in the confirmation popup
        ## Book Citation ##
        And I see "New Citation"
        And I should see "Book" in the "Citation Type" combobox
        And I type "29" in the "Edition" field "input"
        And I should see "Callaye, B. J. 1990. Test Book. 29. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
        And I press the "Create Citation" button
        And I wait for the "sub" form to close
        ## Publication Book with Editors ##
        And I add "Test Book with Editors" to the "Publication" combobox
        And I see "New Publication"
        And I select "Book" from the "Publication Type" combobox
        And I type "1990" in the "Year" field "input"
        And I select "Callaye, Bendry J Jr" from the "Editors" dynamic combobox
        And I select "Test Publisher" from the "Publisher" combobox
        And I check the "Show all fields" box
        And I type "https://doi.org/10.1037/rmh0000008" in the "Doi" field "input"
        And I type "Test description" in the "Description" field "textarea"
        And I type "https://www.publication.com" in the "Website" field "input"
        And I press the "Create Publication" button
        And I press submit in the confirmation popup
        ## Chapter Citation ##
        And I see "New Citation"
        And I select "Chapter" from the "Citation Type" combobox
        And I type "Test Title for Chapter" in the "Title" field "input"
        And I type "666-999" in the "Pages" field "input"
        And I select "Cockle, Anya" from the "Authors" dynamic combobox
        And I type "Test Abstract Text" in the "Abstract" field "textarea"
        And I see "Cockle, A. 1990. Test Title for Chapter. In: Test Book with Editors (B. J. Callaye, ed.). pp. 666-999. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
        And I press the "Create Citation" button
        And I wait for the "sub" form to close
        ## Publication Journal ##
        And I add "Test Journal" to the "Publication" combobox
        And I see "New Publication"
        And I select "Journal" from the "Publication Type" combobox
        And I press the "Create Publication" button
        ## Article Citation ##
        And I see "New Citation"
        And I should see "Article" in the "Citation Type" combobox
        And I type "1990" in the "Year" field "input"
        And I type "Test Title for Article" in the "Title" field "input"
        And I type "666-999" in the "Pages" field "input"
        And I type "4" in the "Volume" field "input"
        And I type "1" in the "Issue" field "input"
        And I select "Cockle, Anya" from the "Authors" dynamic combobox
        And I type "Test Abstract Text" in the "Abstract" field "textarea"
        And I see "Cockle, A. 1990. Test Title for Article. Test Journal 4 (1): 666-999." in the "Citation Text" field "textarea"
        And I press the "Create Citation" button
        And I wait for the "sub" form to close
        ## Publication Thesis/Dissertation ##
        And I add "Test Dissertation" to the "Publication" combobox
        And I see "New Publication"
        And I check the "Show all fields" box
        And I select "Thesis/Dissertation" from the "Publication Type" combobox
        And I type "1990" in the "Year" field "input"
        And I select "Callaye, Bendry J Jr" from the "Authors" dynamic combobox
        And I select "Test Publisher" from the "Publisher" combobox
        And I type "https://doi.org/10.1037/rmh0000008" in the "Doi" field "input"
        And I type "Test description" in the "Description" field "textarea"
        And I type "https://www.publication.com" in the "Website" field "input"
        And I press the "Create Publication" button
        And I press submit in the confirmation popup
        ## Dissertation Citation ##
        And I see "New Citation"
        And I should see "Ph.D. Dissertation" in the "Citation Type" combobox
        And I see "Callaye, B. J. 1990. Test Dissertation. Ph.D. Dissertation. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
        And I press the "Create Citation" button
        And I wait for the "sub" form to close
        ## Publication Other ##
        And I add "Test Other" to the "Publication" combobox
        And I see "New Publication"
        And I select "Other" from the "Publication Type" combobox
        And I type "1990" in the "Year" field "input"
        And I select "Callaye, Bendry J Jr" from the "Authors" dynamic combobox
        And I select "Test Publisher" from the "Publisher" combobox
        And I check the "Show all fields" box
        And I type "https://doi.org/10.1037/rmh0000008" in the "Doi" field "input"
        And I type "Test description" in the "Description" field "textarea"
        And I type "https://www.publication.com" in the "Website" field "input"
        And I press the "Create Publication" button
        And I press submit in the confirmation popup
        ## Other Citation ##
        And I see "New Citation"
        And I should see "Other" in the "Citation Type" combobox
        And I see "Callaye, B. J. 1990. Test Other. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
        And I press the "Create Citation" button
        And I wait for the "sub" form to close
        ## ---- Location --- ##
        ## With GPS ##
        And I click on "use the map interface" link
        And I press the "New Location" button in the map
        And i see "New Location"
        # And I press the "Click to select position" button in the map
        And I type "9.79026" in the "Latitude" field "input"
        And I type "-83.91546" in the "Longitude" field "input"
        And I see the "new" location's pin on the map
        And I type "Test Location With GPS" in the "Display Name" field "input"
        And I type "Test Description" in the "Description" field "textarea"
        And I select "Savanna" from the "Habitat Type" combobox
        And I type "1500" in the "Elevation" field "input"
        And I type "2500" in the "Elevation Max" field "input"
        And I break
        # And I see the country's polygon drawn on the map  #(Couldn't identify elem)
        And I press the "Create Location" button
        And I wait for the "sub" form to close
        ## Without GPS ##
        And I add "Test Location Without GPS" to the "Location" combobox
        And i see "New Location"
        And I type "Test Description" in the "Description" field "textarea"
        And I select "Costa Rica" from the "Country" combobox
        And I select "Savanna" from the "Habitat Type" combobox
        And I type "1500" in the "Elevation" field "input"
        And I type "2500" in the "Elevation Max" field "input"
        And I press the "Create Location" button
        And I wait for the "sub" form to close
        ## --- Taxon --- ##
        ### Subject Family ##
        And I focus on the "Subject" taxon field
        And I see "Select Subject Taxon"
        And I add "Subject Family" to the "Family" combobox
        And I see "New Taxon Family"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        ### Subject Genus ##
        And I add "SGenus" to the "Genus" combobox
        And I see "New Taxon Genus"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        ### Subject Species ##
        And I add "SGenus Species" to the "Species" combobox
        And I see "New Taxon Species"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        And I press the "Select Taxon" button
        And I wait for the "sub" form to close
        ### Object Sub-Group ##
        And I focus on the "Object" taxon field
        And I see "Select Object Taxon"
        And I select "Parasite" from the "Group" combobox
        And I should see "Phylum Acanthocephala" in the "Sub-Group" combobox
        And I select "Phylum Nematoda" from the "Sub-Group" combobox
        And I add "O Sub-Group Family" to the "Family" combobox
        And I see "New Taxon Family"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        ### Object Class ##
        And I focus on the "Object" taxon field
        And I see "Select Object Taxon"
        And I select "Arthropod" from the "Group" combobox
        And I add "Object Class" to the "Class" combobox
        And I see "New Taxon Class"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        ### Object Order ##
        And I add "Object Order" to the "Order" combobox
        And I see "New Taxon Order"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        ### Object Family ##
        And I add "Object Family" to the "Family" combobox
        And I see "New Taxon Family"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        ### Object Genus ##
        And I add "OGenus" to the "Genus" combobox
        And I see "New Taxon Genus"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        ### Object Species ##
        And I add "OGenus Species" to the "Species" combobox
        And I see "New Taxon Species"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        And I press the "Select Taxon" button
        And I wait for the "sub" form to close

    ## -------------------------- Interaction ----------------------------------##
    @javascript
    Scenario:  I should be able to create a new interaction with all fields filled
        Given I press the "New" button
        And I see "New Interaction"
        And I fill the new interaction form with the test values
        And I press the "Create Interaction" button
        And I press submit in the confirmation popup
        Then I should see "New Interaction successfully created." in the form header

    @javascript
    Scenario:  Pinned field values should remain after interaction form submission (all others should clear)
        Given I press the "New" button
        And I see "New Interaction"
        And I fill the new interaction form with the test values
        When I pin the "Citation Title" field
        And I pin the "Location" field
        And I pin the "Subject" field
        And I pin the "Interaction Type" field
        And I press the "Create Interaction" button
        And I press submit in the confirmation popup
        Then I should see "New Interaction successfully created." in the form header
        And I should see "Test Book with Editors" in the "Publication" combobox
        And I should see "Test Title for Chapter" in the "Citation Title" combobox
        And I should see "Costa Rica" in the "Country-Region" combobox
        And I should see "Test Location With GPS" in the "Location" combobox
        And I should see "Genus SGenus" in the "Subject" combobox
        And I should see "Host" in the "Interaction Type" combobox
        And the "Object" select field should be empty
        And the "Interaction Tags" select field should be empty
        And the "Note" field should be empty

## ======= SINGLE SCENARIO COMBINING THE TESTS COMMENTED BELOW ============== ##
    @javascript
    Scenario:  I should see the newly created interactions in the grid #COMBO
        ## --- Source --- ##
        Given the database table is grouped by "Sources"
        And I filter the table to interactions created today
        ## Book with Editors ##
        And I expand "Test Book with Editors" in the data tree
        And I should see "2" interactions under "Test Title for Chapter"
        And the expected data in the interaction row
        ## Author [Cockle, Anya] ##
        And I view interactions by "Authors"
        And I filter the table to interactions created today
        And I expand "Cockle, Anya" in the data tree
        And I should see "2" interactions under "Test Title for Chapter"
        And the expected data in the interaction row
        And I collapse "Cockle, Anya" in the data tree
        ## Author [Smith, George Michael Sr] ##
        And I expand "Callaye, Bendry J Jr" in the data tree
        And I expand "Test Book with Editors" in the data tree
        And I expand "Test Title for Chapter" in level "3" of the data tree
        And I should see "2" interactions attributed
        And the expected data in the interaction row
        ## --- Location --- ##
        Given the database table is grouped by "Locations"
        And I filter the table to interactions created today
        When I expand "Central America" in the data tree
        And I expand "Costa Rica" in the data tree
        Then I should see "2" interactions under "Test Location With GPS"
        And the expected data in the location interaction row
        ## --- Taxon --- ##
        ## Subject ##
        Given the database table is grouped by "Taxa"
        And I view interactions by "Bats"
        And I filter the table to interactions created today
        When I expand "Family Subject Family" in the data tree
        And I expand "Genus SGenus" in the data tree
        Then I should see "2" interactions under "Unspecified SGenus Interactions"
        And the expected data in the interaction row
        ## Object ##
        And I view interactions by "Arthropoda"
        And I filter the table to interactions created today
        And I expand "Class Object Class" in the data tree
        And I expand "Order Object Order" in the data tree
        And I expand "Family Object Family" in the data tree
        And I expand "Genus OGenus" in the data tree
        And I expand "OGenus Species" in the data tree
        Then I should see "2" interactions under "OGenus Species"
        And the expected data in the interaction row

    # @javascript
    # Scenario:  I should see the newly created interactions under the publication source
    #     Given the database table is grouped by "Sources"
    #     And I filter the table to interactions created today
    #     When I expand "Test Book with Editors" in the data tree
    #     Then I should see "2" interactions under "Test Title for Chapter"
    #     And the expected data in the interaction row

    # @javascript
    # Scenario:  I should see the newly created interactions under the author [Cockle, Anya]
    #     Given the database table is grouped by "Sources"
    #     And I view interactions by "Authors"
    #     And I filter the table to interactions created today
    #     When I expand "Cockle, Anya" in the data tree
    #     Then I should see "2" interactions under "Test Title for Chapter"
    #     And the expected data in the interaction row

    # @javascript
    # Scenario:  I should see the newly created interactions under the author [Smith, George Michael Sr]
    #     Given the database table is grouped by "Sources"
    #     And I view interactions by "Authors"
    #     And I filter the table to interactions created today
    #     When I expand "Callaye, Bendry J Jr" in the data tree
    #     And I expand "Test Book with Editors" in the data tree
    #     And I expand "Test Title for Chapter" in level "3" of the data tree
    #     Then I should see "2" interactions attributed
    #     And the expected data in the interaction row

    # @javascript
    # Scenario:  I should see the newly created interactions under the location
    #     Given the database table is grouped by "Locations"
    #     And I filter the table to interactions created today
    #     When I expand "Central America" in the data tree
    #     And I expand "Costa Rica" in the data tree
    #     Then I should see "2" interactions under "Test Location With GPS"
    #     And the expected data in the location interaction row

    # @javascript
    # Scenario:  I should see the newly created interactions under the subject taxon
    #     Given the database table is grouped by "Taxa"
    #     And I view interactions by "Bats"
    #     And I filter the table to interactions created today
    #     When I expand "Family Subject Family" in the data tree
    #     And I expand "Genus SGenus" in the data tree
    #     Then I should see "2" interactions under "Unspecified SGenus Interactions"
    #     And the expected data in the interaction row

    # @javascript
    # Scenario:  I should see the newly created interactions under the object taxon
    #     Given the database table is grouped by "Taxa"
    #     And I view interactions by "Arthropoda"
    #     And I filter the table to interactions created today
    #     When I expand "Class Object Class" in the data tree
    #     When I expand "Order Object Order" in the data tree
    #     When I expand "Family Object Family" in the data tree
    #     And I expand "Genus OGenus" in the data tree
    #     And I expand "OGenus Species" in the data tree
    #     Then I should see "2" interactions under "OGenus Species"
    #     And the expected data in the interaction row

## ===================== AFTER INTERACTION FORM SUBMIT ====================== ##
    @javascript
    Scenario:  The table should not change views when form closes without submitting
        Given I press the "New" button
        And I see "New Interaction"
        And the database table is grouped by "Locations"
        When I exit the form window
        Then I should see the table displayed in "Location" view