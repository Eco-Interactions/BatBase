Feature: Add new data to the database
    In order to have accurate data about bat eco-interactions
    As an editor
    I need to be able to add new data to the database

    ### WHAT IS BEING TESTED ### 
        # INTERACTION CREATE FORM FILL, SUBMISSION, AND TABLE RELOADS 
        # ALL SUB-ENTITY CREATE FORMS
        ## TODO
        # VARIOUS SOURCE TYPE SELECTIONS and their respective UI changes

    Background:
        Given I am on "/login"
        And I fill in "Username" with "TestEditor"
        And I fill in "Password" with "passwordhere"
        And I press the "_submit" button
        And I am on "/search"
        And I should see "TestEditor"
        Given the database has loaded
        And I exit the tutorial

    ## -------------------------- Source ---------------------------------------##
    ## ------------------- PUBLICATION ----------------- ##
    @javascript
    Scenario:  I should be able to create a publisher with its sub-form
        Given I open the New Interaction form
        And I enter "Test Book" in the "Publication" dropdown field
        And I see "New Publication"
        And I select "Book" from the "Publication Type" dropdown field
        When I enter "Test Publisher" in the "Publisher" dropdown field
        And I see "New Publisher"
        And I type "Nice" in the "City" field "input"
        And I type "France" in the "Country" field "input"
        And  I check the "Show all fields" box
        And I type "Publisher Description" in the "Description" field "textarea"
        And I type "www.publisher.com" in the "Link Url" field "input"
        And I type "Test Publisher Webiste" in the "Link Display" field "input"
        And I press the "Create Publisher" button
        Then I should see "Test Publisher" in the "Publisher" dropdown field
    ## ------------------- AUTHOR ----------------- ##
    @javascript
    Scenario:  I should be able to create an author with its sub-form
        Given I open the New Interaction form
        And I enter "Test Book" in the "Publication" dropdown field
        And I see "New publication"
        And I select "Book" from the "Publication Type" dropdown field
        When I enter "Smith, George" in the "Authors" field dynamic dropdown
        And I check the "Show all fields" box
        And I type "Bendry" in the "First Name" field "input"
        And I type "J" in the "Middle Name" field "input"
        And I type "Callaye" in the "Last Name" field "input"
        And I type "Jr" in the "Suffix" field "input"
        And I type "www.author.com" in the "Link Url" field "input"
        And I type "Test Author Website" in the "Link Display" field "input"
        And I press the "Create Author" button
        Then I should see "Callaye, Bendry J. Jr" in the "Authors" field dynamic dropdown
    ## ------------------- BOOKS ----------------- ##
    @javascript
    Scenario:  I should be able to create a [BOOK] publication with its sub-form
        Given I open the New Interaction form
        And I enter "Test Book" in the "Publication" dropdown field
        And I see "New Publication"
        And I select "Book" from the "Publication Type" dropdown field
        When I type "1990" in the "Year" field "input"
        And I select "Callaye, Bendry J. Jr" from the "Authors" field dynamic dropdown
        And I select "Test Publisher" from the "Publisher" dropdown field
        And I check the "Show all fields" box
        And I type "10.1037/rmh0000008" in the "Doi" field "input"
        And I type "Test description" in the "Description" field "textarea"
        And I type "www.publication.com" in the "Link Url" field "input"
        And I type "Test Book Webiste" in the "Link Display" field "input"
        And I press the "Create Publication" button
        Then I should see "Test Book" in the "Publication" dropdown field
        And I should see "Test Book" in the "Src" detail panel
        And I should see "1990" in the "Src" detail panel
        And I should see "Test description" in the "Src" detail panel
        And I should see "Book Title" in the "Src" detail panel
        And I should see "Test Book" in the "Src" detail panel
        And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel
        And I should see "New Citation" in the form header
        And I should see "Callaye, B. J. 1990. Test Book. Test Publisher, Nice, France." in the "Citation Text" field "textarea"

    @javascript
    Scenario:  I should be able to create a [BOOK WITH EDITORS] publication with its sub-form
        Given I open the New Interaction form
        And I enter "Test Book with Editors" in the "Publication" dropdown field
        And I see "New Publication"
        And I select "Book" from the "Publication Type" dropdown field
        When I type "1990" in the "Year" field "input"
        And I select "Callaye, Bendry J. Jr" from the "Editors" field dynamic dropdown
        And I select "Test Publisher" from the "Publisher" dropdown field
        And I check the "Show all fields" box
        And I type "10.1037/rmh0000008" in the "Doi" field "input"
        And I type "Test description" in the "Description" field "textarea"
        And I type "www.publication.com" in the "Link Url" field "input"
        And I type "Test Book Webiste" in the "Link Display" field "input"
        And I press the "Create Publication" button
        Then I should see "Test Book with Editors" in the "Publication" dropdown field
        And I should see "Test Book with Editors" in the "Src" detail panel
        And I should see "1990" in the "Src" detail panel
        And I should see "Book Description" in the "Src" detail panel
        And I should see "Test description" in the "Src" detail panel
        And I should see "Book Title" in the "Src" detail panel
        And I should see "Test Book" in the "Src" detail panel
        And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel
        And I should see "New Citation" in the form header
        And I should see "The citation will display here once all required fields are filled." in the "Citation Text" field "textarea"
    ## -------- CITATION --------- ##
    # TODO: TEST THAT AUTHOR FIELD IS NOT SHOWN.
    @javascript
    Scenario:  I should be able to create a [BOOK] citation with its sub-form
        Given I open the New Interaction form
        And I select "Test Book" from the "Publication" dropdown field
        And I enter "" in the "Citation Title" dropdown field
        And I see "New Citation"
        And I should see "Book" in the "Citation Type" dropdown field
        When I type "29" in the "Edition" field "input"
        And I should see "Callaye, B. J. 1990. Test Book. 29. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
        And I press the "Create Citation" button
        Then I should see "Test Book" in the "Citation Title" dropdown field
        And I should see "Callaye, B. J. 1990. Test Book. 29. Test Publisher, Nice, France." in the "Src" detail panel
        And I should see "Book Title" in the "Src" detail panel
        And I should see "Test Book" in the "Src" detail panel
        And I should see "1990" in the "Src" detail panel
        And I should see "Test description" in the "Src" detail panel
        And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel

    @javascript
    Scenario:  I should be able to create a [CHAPTER] citation with its sub-form
        Given I open the New Interaction form
        And I select "Test Book with Editors" from the "Publication" dropdown field
        And I see "New Citation"
        When I select "Chapter" from the "Citation Type" dropdown field
        And I type "Test Title for Chapter" in the "Title" field "input"
        And I type "666-999" in the "Pages" field "input"
        And I select "Cockle, Anya" from the "Authors" field dynamic dropdown
        And I check the "Show all fields" box
        And I type "Test Abstract Text" in the "Abstract" field "textarea"
        And I see "Cockle, A. 1990. Test Title for Chapter. In: Test Book with Editors (B. J. Callaye, ed.). pp. 666-999. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
        And I press the "Create Citation" button
        Then I should see "Test Title for Chapter" in the "Citation Title" dropdown field

        And I should see "Cockle, A. 1990. Test Title for Chapter. In: Test Book with Editors (B. J. Callaye, ed.). pp. 666-999. Test Publisher, Nice, France." in the "Src" detail panel
        And I should see "Book Title" in the "Src" detail panel
        And I should see "Test Book" in the "Src" detail panel
        And I should see "Chapter Title" in the "Src" detail panel
        And I should see "Test Title for Chapter" in the "Src" detail panel
        And I should see "Test Abstract Text" in the "Src" detail panel
        And I should see "1990" in the "Src" detail panel
        And I should see "Test description" in the "Src" detail panel
        And I should see "Cockle, Anya" in the "Src" detail panel
        And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel
    
    ## ------------------- Journal ----------------- ##

    @javascript
    Scenario:  I should be able to create a [JOURNAL] publication with its sub-form
        Given I open the New Interaction form
        And I enter "Test Journal" in the "Publication" dropdown field
        And I see "New Publication"
        And I select "Journal" from the "Publication Type" dropdown field
        And I check the "Show all fields" box
        And I press the "Create Publication" button
        Then I should see "Test Journal" in the "Publication" dropdown field
        And I should see "Journal Title" in the "Src" detail panel
        And I should see "Test Journal" in the "Src" detail panel
        And I should see "New Citation" in the form header
        And I should see "The citation will display here once all required fields are filled." in the "Citation Text" field "textarea"
    ## -------- CITATION --------- ##
    @javascript
    Scenario:  I should be able to create a [ARTICLE] citation with its sub-form
        Given I open the New Interaction form
        And I select "Test Journal" from the "Publication" dropdown field
        And I see "New Citation"
        And I should see "Article" in the "Citation Type" dropdown field
        And I type "1990" in the "Year" field "input"
        And I type "Test Title for Article" in the "Title" field "input"
        And I check the "Show all fields" box
        And I type "666-999" in the "Pages" field "input"
        And I type "4" in the "Volume" field "input"
        And I type "1" in the "Issue" field "input"
        And I select "Cockle, Anya" from the "Authors" field dynamic dropdown
        And I type "Test Abstract Text" in the "Abstract" field "textarea"
        And I see "Cockle, A. 1990. Test Title for Article. Test Journal 4 (1): 666-999." in the "Citation Text" field "textarea"
        And I press the "Create Citation" button
        Then I should see "Test Title for Article" in the "Citation Title" dropdown field
        And I should see "Cockle, A. 1990. Test Title for Article. Test Journal 4 (1): 666-999." in the "Src" detail panel
        And I should see "Journal Title" in the "Src" detail panel
        And I should see "Test Journal" in the "Src" detail panel
        And I should see "Article Title" in the "Src" detail panel
        And I should see "Test Title for Article" in the "Src" detail panel
        And I should see "Test Abstract Text" in the "Src" detail panel
        And I should see "1990" in the "Src" detail panel
        And I should see "Cockle, Anya" in the "Src" detail panel
    
    ## ------------------- Thesis/Dissertation ----------------- ##
    @javascript
    Scenario:  I should be able to create a [Thesis/Dissertation] publication with its sub-form
        Given I open the New Interaction form
        And I enter "Test Dissertation" in the "Publication" dropdown field
        And I see "New Publication"
        When I select "Thesis/Dissertation" from the "Publication Type" dropdown field
        And I type "1990" in the "Year" field "input"
        And I select "Callaye, Bendry J. Jr" from the "Authors" field dynamic dropdown
        And I select "Test Publisher" from the "Publisher" dropdown field
        And I check the "Show all fields" box
        And I type "10.1037/rmh0000008" in the "Doi" field "input"
        And I type "Test description" in the "Description" field "textarea"
        And I type "www.publication.com" in the "Link Url" field "input"
        And I type "Test Book Webiste" in the "Link Display" field "input"
        And I press the "Create Publication" button
        Then I should see "Test Dissertation" in the "Publication" dropdown field
        And I should see "Thesis/Dissertation Title" in the "Src" detail panel
        And I should see "1990" in the "Src" detail panel
        And I should see "Test description" in the "Src" detail panel
        And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel
        And I should see "New Citation" in the form header
        And I should see "Callaye, B. J. 1990. Test Dissertation. Ph.D. Dissertation. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
    ## -------- CITATION --------- ##
  # Add Master's thesis citation
    @javascript
    Scenario:  I should be able to create a [Ph.D. Dissertation] citation with its sub-form
        Given I open the New Interaction form
        And I select "Test Dissertation" from the "Publication" dropdown field
        And I see "New Citation"
        And I should see "Ph.D. Dissertation" in the "Citation Type" dropdown field
        And I see "Callaye, B. J. 1990. Test Dissertation. Ph.D. Dissertation. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
        And I check the "Show all fields" box
        And I press the "Create Citation" button
        Then I should see "Test Dissertation" in the "Citation Title" dropdown field
        And I should see "Callaye, B. J. 1990. Test Dissertation. Ph.D. Dissertation. Test Publisher, Nice, France." in the "Src" detail panel
        And I should see "Thesis/Dissertation Title" in the "Src" detail panel
        And I should see "Test Dissertation" in the "Src" detail panel
        And I should see "1990" in the "Src" detail panel
        And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel
    ## ------------------- OTHER ----------------- ##
    @javascript
    Scenario:  I should be able to create a [OTHER] publication with its sub-form
        Given I open the New Interaction form
        And I enter "Test Other" in the "Publication" dropdown field
        And I see "New Publication"
        When I select "Other" from the "Publication Type" dropdown field
        And I type "1990" in the "Year" field "input"
        And I select "Callaye, Bendry J. Jr" from the "Authors" field dynamic dropdown
        And I select "Test Publisher" from the "Publisher" dropdown field
        And I check the "Show all fields" box
        And I type "10.1037/rmh0000008" in the "Doi" field "input"
        And I type "Test description" in the "Description" field "textarea"
        And I type "www.publication.com" in the "Link Url" field "input"
        And I type "Test Other Webiste" in the "Link Display" field "input"
        And I press the "Create Publication" button
        Then I should see "Test Other" in the "Publication" dropdown field
        And I should see "Publication Title" in the "Src" detail panel
        And I should see "1990" in the "Src" detail panel
        And I should see "Test description" in the "Src" detail panel
        And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel
        And I should see "New Citation" in the form header
        And I should see "Callaye, B. J. 1990. Test Other. Test Publisher, Nice, France." in the "Citation Text" field "textarea"

    ## TODO: Add for Museum record and report types as well.
    ## -------- CITATION --------- ##
    @javascript
    Scenario:  I should be able to create a [Other] citation with its sub-form
        Given I open the New Interaction form
        And I select "Test Other" from the "Publication" dropdown field
        And I see "New Citation"
        And I should see "Other" in the "Citation Type" dropdown field
        And I see "Callaye, B. J. 1990. Test Other. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
        And I check the "Show all fields" box
        And I press the "Create Citation" button
        Then I should see "Test Other" in the "Citation Title" dropdown field
        And I should see "Callaye, B. J. 1990. Test Other. Test Publisher, Nice, France." in the "Src" detail panel
        And I should see "Publication Title" in the "Src" detail panel
        And I should see "1990" in the "Src" detail panel
        And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel
        And I should see "Publication Description" in the "Src" detail panel

    ## -------------------------- Location -------------------------------------##
    @javascript
    Scenario:  I should be able to create a location with its sub-form
        Given I open the New Interaction form
        And I enter "Test Location" in the "Location" dropdown field
        Then I should see "New Location"
        When I type "Test Description" in the "Description" field "textarea"
        And I select "Costa Rica" from the "Country" dropdown field
        And I select "Savanna" from the "Habitat Type" dropdown field
        And I type "1500" in the "Elevation" field "input"
        And I type "2500" in the "Elevation Max" field "input"
        And I type "-58.864905" in the "Latitude" field "input"
        And I type "3.339844" in the "Longitude" field "input"
        And I press the "Create Location" button
        Then I should see "Test Location" in the "Location" dropdown field
        And I should see "Test Description" in the "Location" detail panel
        And I should see "Savanna" in the "Location" detail panel
        And I should see "1500" in the "Location" detail panel
        And I should see "2500" in the "Location" detail panel
        And I should see "-58.864905" in the "Location" detail panel
        And I should see "3.339844" in the "Location" detail panel
    ## -------------------------- Taxon ----------------------------------------##
    @javascript
    Scenario:  I should be able to create a taxon Family within the subject taxon sub-form
        Given I open the New Interaction form
        And I focus on the "Subject" taxon field
        And I see "Select Subject Taxon"
        When I enter "Subject Family" in the "Family" dropdown field
        And I see "New Taxon Family"
        And I press the "Create Taxon" button
        Then I should see "Subject Family" in the "Family" dropdown field

    @javascript
    Scenario:  I should be able to create a taxon Genus within the subject taxon sub-form
        Given I open the New Interaction form
        And I focus on the "Subject" taxon field
        And I see "Select Subject Taxon"
        And I select "Subject Family" from the "Family" dropdown field
        When I enter "SGenus" in the "Genus" dropdown field
        And I see "New Taxon Genus"
        And I press the "Create Taxon" button
        Then I should see "Subject Family" in the "Family" dropdown field
        And I should see "SGenus" in the "Genus" dropdown field

    @javascript
    Scenario:  I should be able to create a taxon Species within the subject taxon sub-form
        Given I open the New Interaction form
        And I focus on the "Subject" taxon field
        And I see "Select Subject Taxon"
        And I select "SGenus" from the "Genus" dropdown field
        When I enter "SGenus Species" in the "Species" dropdown field
        And I see "New Taxon Species"
        And I press the "Create Taxon" button
        Then I should see "SGenus Species" in the "Species" dropdown field
        And I should see "Subject Family" in the "Family" dropdown field
        And I should see "SGenus" in the "Genus" dropdown field

    @javascript
    Scenario:  I should be able to select a taxon with the subject taxon select form
        Given I open the New Interaction form
        And I focus on the "Subject" taxon field
        And I see "Select Subject Taxon"
        And I select "SGenus Species" from the "Species" dropdown field
        When I press "Confirm"
        Then I should see "SGenus Species" in the "Subject" dropdown field

    @javascript
    Scenario:  I should be able to create a taxon Class within the object taxon sub-form
        Given I open the New Interaction form
        And I focus on the "Object" taxon field
        And I see "Select Object Taxon"
        When I select "Arthropod" from the "Realm" dropdown field
        And I enter "Object Class" in the "Class" dropdown field
        And I see "New Taxon Class"
        And I press the "Create Taxon" button
        Then I should see "Object Class" in the "Class" dropdown field

    @javascript
    Scenario:  I should be able to create a taxon Order within the object taxon sub-form
        Given I open the New Interaction form
        And I focus on the "Object" taxon field
        And I see "Select Object Taxon"
        When I select "Arthropod" from the "Realm" dropdown field
        And I select "Object Class" from the "Class" dropdown field
        And I enter "Object Order" in the "Order" dropdown field
        And I see "New Taxon Order"
        And I press the "Create Taxon" button
        Then I should see "Object Order" in the "Order" dropdown field
        And I should see "Object Class" in the "Class" dropdown field

    @javascript
    Scenario:  I should be able to create a taxon Family within the object taxon sub-form
        Given I open the New Interaction form
        And I focus on the "Object" taxon field
        And I see "Select Object Taxon"
        When I select "Arthropod" from the "Realm" dropdown field
        And I select "Object Order" from the "Order" dropdown field
        And I enter "Object Family" in the "Family" dropdown field
        And I see "New Taxon Family"
        And I press the "Create Taxon" button
        Then I should see "Object Family" in the "Family" dropdown field        
        And I should see "Object Class" in the "Class" dropdown field
        And I should see "Object Order" in the "Order" dropdown field

    @javascript
    Scenario:  I should be able to create a taxon Genus within the object taxon sub-form
        Given I open the New Interaction form
        And I focus on the "Object" taxon field
        And I see "Select Object Taxon"
        When I select "Arthropod" from the "Realm" dropdown field
        And I select "Object Family" from the "Family" dropdown field
        When I enter "OGenus" in the "Genus" dropdown field
        And I see "New Taxon Genus"
        And I press the "Create Taxon" button
        Then I should see "OGenus" in the "Genus" dropdown field     
        And I should see "Object Family" in the "Family" dropdown field
        And I should see "Object Order" in the "Order" dropdown field
        And I should see "Object Class" in the "Class" dropdown field

    @javascript
    Scenario:  I should be able to create a taxon Species within the object taxon sub-form
        Given I open the New Interaction form
        And I focus on the "Object" taxon field
        And I see "Select Object Taxon"
        When I select "Arthropod" from the "Realm" dropdown field
        And I select "OGenus" from the "Genus" dropdown field
        When I enter "OGenus Species" in the "Species" dropdown field
        And I see "New Taxon Species"
        And I press the "Create Taxon" button
        Then I should see "OGenus Species" in the "Species" dropdown field
        And I should see "OGenus" in the "Genus" dropdown field     
        And I should see "Object Family" in the "Family" dropdown field
        And I should see "Object Order" in the "Order" dropdown field
        And I should see "Object Class" in the "Class" dropdown field


    @javascript
    Scenario:  I should be able to select a taxon with the object taxon select form
        Given I open the New Interaction form
        And I focus on the "Object" taxon field
        And I see "Select Object Taxon"
        When I select "Arthropod" from the "Realm" dropdown field
        And I select "OGenus Species" from the "Species" dropdown field
        When I press "Confirm"
        Then I should see "OGenus Species" in the "Object" dropdown field
    ## -------------------------- Interaction ----------------------------------##
    @javascript
    Scenario:  I should be able to create a new interaction with all fields filled
        Given I open the New Interaction form
        And I fill the new interaction form with the test values
        And I press the "Create Interaction" button
        Then I should see "New Interaction successfully created." in the form header

    @javascript
    Scenario:  Pinned field values should remain after interaction form submission (all others should clear)
        Given I open the New Interaction form
        And I fill the new interaction form with the test values
        When I pin the "Citation Title" field
        And I pin the "Location" field
        And I pin the "Subject" field
        And I pin the "Interaction Type" field
        And I press the "Create Interaction" button
        Then I should see "New Interaction successfully created." in the form header
        And I should see "Test Book with Editors" in the "Publication" dropdown field
        And I should see "Test Title for Chapter" in the "Citation Title" dropdown field
        And I should see "Costa Rica" in the "Country-Region" dropdown field
        And I should see "Test Location" in the "Location" dropdown field
        And I should see "Genus SGenus" in the "Subject" dropdown field
        And I should see "Consumption" in the "Interaction Type" dropdown field
        And the "Object" select field should be empty
        And the "Interaction Tags" select field should be empty
        And the "Note" field should be empty

    @javascript
    Scenario:  The table should not change views when form closes without submitting 
        Given I open the New Interaction form
        And the database table is in "Location" view
        When I exit the form window
        Then I should see the table displayed in "Location" view

    @javascript
    Scenario:  The table should reload in Source view after creating an interaction.
        Given I open the New Interaction form
        And I fill the new interaction form with the test values
        And I press the "Create Interaction" button
        And I see "New Interaction successfully created." in the form header
        When I exit the form window
        Then I should see the table displayed in "Source" view
        And the table should be filtered to interactions created since "today"
        And I should see "1" row in the table data tree

    @javascript
    Scenario:  I should see the newly created interactions under the publication source
        Given the database table is in "Source" view
        And I filter the table to interactions created since "today"
        When I expand "Test Book with Editors" in the data tree
        Then I should see "3" interactions under "Test Title for Chapter"
        And the expected data in the interaction row

    @javascript
    Scenario:  I should see the newly created interactions under the author [Cockle, Anya]
        Given the database table is in "Source" view
        And I group interactions by "Authors"
        And I filter the table to interactions created since "today"
        When I expand "Cockle, Anya" in the data tree
        Then I should see "3" interactions under "Test Title for Chapter"
        And the expected data in the interaction row

    @javascript
    Scenario:  I should see the newly created interactions under the author [Smith, George Michael Sr]
        Given the database table is in "Source" view
        And I group interactions by "Authors"
        And I filter the table to interactions created since "today"
        When I expand "Callaye, Bendry J. Jr" in the data tree
        And I expand "Test Book with Editors" in the data tree
        And I expand "Test Title for Chapter" in level "3" of the data tree
        Then I should see "3" interactions attributed
        And the expected data in the interaction row

    @javascript
    Scenario:  I should see the newly created interactions under the location
        Given the database table is in "Location" view
        And I filter the table to interactions created since "today"
        When I expand "Central America" in the data tree
        And I expand "Costa Rica" in the data tree
        Then I should see "3" interactions under "Test Location"
        And the expected data in the location interaction row

    @javascript
    Scenario:  I should see the newly created interactions under the subject taxon
        Given the database table is in "Taxon" view
        And I group interactions by "Bats"
        And I filter the table to interactions created since "today"
        When I expand "Family Subject Family" in the data tree
        And I expand "Genus SGenus" in the data tree
        Then I should see "3" interactions under "Unspecified SGenus Interactions"
        And the expected data in the interaction row

    @javascript
    Scenario:  I should see the newly created interactions under the object taxon
        Given the database table is in "Taxon" view
        And I group interactions by "Arthropoda"
        And I filter the table to interactions created since "today"
        When I expand "Class Object Class" in the data tree
        When I expand "Order Object Order" in the data tree
        When I expand "Family Object Family" in the data tree
        And I expand "Genus OGenus" in the data tree
        Then I should see "3" interactions under "OGenus Species"
        And the expected data in the interaction row
