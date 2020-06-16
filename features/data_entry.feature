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
        And I should see "TestEditor"
        Given the database has loaded
        And I exit the tutorial

## ======= SINGLE SCENARIO COMBINING THE TESTS COMMENTED BELOW ============== ##
## Creates all sub-entities ##
    @javascript
    Scenario:  I enter all previous data to jump to this section #COMBO STEP
        Given I press the "New" button
        And I break "Open console"
        And I see "New Interaction"
        ## Publication Book ##
        And I enter "Test Book" in the "Publication" form dropdown
        And I see "New Publication"
        And I select "Book" from the "Publication Type" form dropdown
        ## Publisher ##
        And I enter "Test Publisher" in the "Publisher" form dropdown
        And I see "New Publisher"
        And I check the "Show all fields" box
        And I type "Nice" in the "City" field "input"
        And I type "France" in the "Country" field "input"
        And I type "Publisher Description" in the "Description" field "textarea"
        And I type "www.publisher.com" in the "Link Url" field "input"
        And I type "Test Publisher Webiste" in the "Link Display" field "input"
        And I press the "Create Publisher" button
        And I wait for the "sub2" form to close
        ### Author ##
        And I enter "Smith, George" in the "Authors" dynamic dropdown
        And I check the "Show all fields" box
        And I type "Bendry" in the "First Name" field "input"
        And I type "J" in the "Middle Name" field "input"
        And I type "Callaye" in the "Last Name" field "input"
        And I type "Jr" in the "Suffix" field "input"
        And I type "www.author.com" in the "Link Url" field "input"
        And I type "Test Author Website" in the "Link Display" field "input"
        And I press the "Create Author" button
        And I wait for the "sub2" form to close
        ## Book Details ##
        And I check the "Show all fields" box
        And I type "1990" in the "Year" field "input"
        And I type "10.1037/rmh0000008" in the "Doi" field "input"
        And I type "Test description" in the "Description" field "textarea"
        And I type "www.publication.com" in the "Link Url" field "input"
        And I type "Test Book Webiste" in the "Link Display" field "input"
        And I press the "Create Publication" button
        ## Book Citation ##
        And I see "New Citation"
        And I should see "Book" in the "Citation Type" form dropdown
        And I type "29" in the "Edition" field "input"
        And I should see "Callaye, B. J. 1990. Test Book. 29. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
        And I press the "Create Citation" button
        And I wait for the "sub" form to close
        ## Publication Book with Editors ##
        And I enter "Test Book with Editors" in the "Publication" form dropdown
        And I see "New Publication"
        And I select "Book" from the "Publication Type" form dropdown
        And I type "1990" in the "Year" field "input"
        And I select "Callaye, Bendry J. Jr" from the "Editors" dynamic dropdown
        And I select "Test Publisher" from the "Publisher" form dropdown
        And I check the "Show all fields" box
        And I type "10.1037/rmh0000008" in the "Doi" field "input"
        And I type "Test description" in the "Description" field "textarea"
        And I type "www.publication.com" in the "Link Url" field "input"
        And I type "Test Book Webiste" in the "Link Display" field "input"
        And I press the "Create Publication" button
        ## Chapter Citation ##
        And I see "New Citation"
        And I select "Chapter" from the "Citation Type" form dropdown
        And I type "Test Title for Chapter" in the "Title" field "input"
        And I type "666-999" in the "Pages" field "input"
        And I select "Cockle, Anya" from the "Authors" dynamic dropdown
        And I type "Test Abstract Text" in the "Abstract" field "textarea"
        And I see "Cockle, A. 1990. Test Title for Chapter. In: Test Book with Editors (B. J. Callaye, ed.). pp. 666-999. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
        And I press the "Create Citation" button
        And I wait for the "sub" form to close
        ## Publication Journal ##
        And I enter "Test Journal" in the "Publication" form dropdown
        And I see "New Publication"
        And I select "Journal" from the "Publication Type" form dropdown
        And I press the "Create Publication" button
        ## Article Citation ##
        And I see "New Citation"
        And I should see "Article" in the "Citation Type" form dropdown
        And I type "1990" in the "Year" field "input"
        And I type "Test Title for Article" in the "Title" field "input"
        And I type "666-999" in the "Pages" field "input"
        And I type "4" in the "Volume" field "input"
        And I type "1" in the "Issue" field "input"
        And I select "Cockle, Anya" from the "Authors" dynamic dropdown
        And I type "Test Abstract Text" in the "Abstract" field "textarea"
        And I see "Cockle, A. 1990. Test Title for Article. Test Journal 4 (1): 666-999." in the "Citation Text" field "textarea"
        And I press the "Create Citation" button
        And I wait for the "sub" form to close
        ## Publication Thesis/Dissertation ##
        And I enter "Test Dissertation" in the "Publication" form dropdown
        And I see "New Publication"
        And I check the "Show all fields" box
        And I select "Thesis/Dissertation" from the "Publication Type" form dropdown
        And I type "1990" in the "Year" field "input"
        And I select "Callaye, Bendry J. Jr" from the "Authors" dynamic dropdown
        And I select "Test Publisher" from the "Publisher" form dropdown
        And I type "10.1037/rmh0000008" in the "Doi" field "input"
        And I type "Test description" in the "Description" field "textarea"
        And I type "www.publication.com" in the "Link Url" field "input"
        And I type "Test Book Webiste" in the "Link Display" field "input"
        And I press the "Create Publication" button
        ## Dissertation Citation ##
        And I see "New Citation"
        And I should see "Ph.D. Dissertation" in the "Citation Type" form dropdown
        And I see "Callaye, B. J. 1990. Test Dissertation. Ph.D. Dissertation. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
        And I press the "Create Citation" button
        And I wait for the "sub" form to close
        ## Publication Other ##
        And I enter "Test Other" in the "Publication" form dropdown
        And I see "New Publication"
        And I select "Other" from the "Publication Type" form dropdown
        And I type "1990" in the "Year" field "input"
        And I select "Callaye, Bendry J. Jr" from the "Authors" dynamic dropdown
        And I select "Test Publisher" from the "Publisher" form dropdown
        And I check the "Show all fields" box
        And I type "10.1037/rmh0000008" in the "Doi" field "input"
        And I type "Test description" in the "Description" field "textarea"
        And I type "www.publication.com" in the "Link Url" field "input"
        And I type "Test Other Webiste" in the "Link Display" field "input"
        And I press the "Create Publication" button
        ## Other Citation ##
        And I see "New Citation"
        And I should see "Other" in the "Citation Type" form dropdown
        And I see "Callaye, B. J. 1990. Test Other. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
        And I press the "Create Citation" button
        And I wait for the "sub" form to close
        ## ---- Location --- ##
        ## With GPS ##
        And I click on "use the map interface" link
        And I press the "New Location" button in the map  
        And I should see "New Location"
        # And I press the "Click to select position" button in the map
        And I type "9.79026" in the "Latitude" field "input"
        And I type "-83.91546" in the "Longitude" field "input"
        And I see the "new" location's pin on the map
        And I type "Test Location With GPS" in the "Display Name" field "input"
        And I type "Test Description" in the "Description" field "textarea"
        And I select "Savanna" from the "Habitat Type" form dropdown
        And I type "1500" in the "Elevation" field "input"
        And I type "2500" in the "Elevation Max" field "input"
        # And I see the country's polygon drawn on the map  #(Couldn't identify elem)
        And I break "Press 'Create Location' in the green pin's popup"
        # And I press "Create Location" in the added green pin's popup (Not clicking reliably)
        And I wait for the "sub" form to close
        ## Without GPS ##
        And I enter "Test Location Without GPS" in the "Location" form dropdown
        And I should see "New Location"
        And I type "Test Description" in the "Description" field "textarea"
        And I select "Costa Rica" from the "Country" form dropdown
        And I select "Savanna" from the "Habitat Type" form dropdown
        And I type "1500" in the "Elevation" field "input"
        And I type "2500" in the "Elevation Max" field "input"
        And I press the "Create without GPS data" button
        And I wait for the "sub" form to close
        ## --- Taxon --- ##
        ### Subject Family ##
        And I focus on the "Subject" taxon field
        And I see "Select Subject Taxon"
        And I enter "Subject Family" in the "Family" form dropdown
        And I see "New Taxon Family"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        ### Subject Genus ##
        And I enter "SGenus" in the "Genus" form dropdown
        And I see "New Taxon Genus"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        ### Subject Species ##
        And I enter "SGenus Species" in the "Species" form dropdown
        And I see "New Taxon Species"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        And I press the "Select Taxon" button
        And I wait for the "sub" form to close
        ### Object Class ##
        And I focus on the "Object" taxon field
        And I see "Select Object Taxon"
        And I select "Arthropod" from the "Realm" form dropdown
        And I enter "Object Class" in the "Class" form dropdown
        And I see "New Taxon Class"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        ### Object Order ##
        And I enter "Object Order" in the "Order" form dropdown
        And I see "New Taxon Order"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        ### Object Family ##
        And I enter "Object Family" in the "Family" form dropdown
        And I see "New Taxon Family"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        ### Object Genus ##
        And I enter "OGenus" in the "Genus" form dropdown
        And I see "New Taxon Genus"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        ### Object Species ##
        And I enter "OGenus Species" in the "Species" form dropdown
        And I see "New Taxon Species"
        And I press the "Create Taxon" button
        And I wait for the "sub2" form to close
        And I press the "Select Taxon" button
        And I wait for the "sub" form to close
    ## -------------------------- Source ---------------------------------------##
  #   # ------------------- PUBLICATION ----------------- ##
  #   @javascript
  #   Scenario:  I should be able to create a publisher with its sub-form
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       And I enter "Test Book" in the "Publication" form dropdown
  #       And I see "New Publication"
  #       And I select "Book" from the "Publication Type" form dropdown
  #       When I enter "Test Publisher" in the "Publisher" form dropdown
  #       And I see "New Publisher"
  #       And I type "Nice" in the "City" field "input"
  #       And I type "France" in the "Country" field "input"
  #       And  I check the "Show all fields" box
  #       And I type "Publisher Description" in the "Description" field "textarea"
  #       And I type "www.publisher.com" in the "Link Url" field "input"
  #       And I type "Test Publisher Webiste" in the "Link Display" field "input"
  #       And I press the "Create Publisher" button
  #       Then I should see "Test Publisher" in the "Publisher" form dropdown
  #   ## ------------------- AUTHOR ----------------- ##
  #   @javascript
  #   Scenario:  I should be able to create an author with its sub-form
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       And I enter "Test Book" in the "Publication" form dropdown
  #       And I see "New publication"
  #       And I select "Book" from the "Publication Type" form dropdown
  #       When I enter "Smith, George" in the "Authors" dynamic dropdown
  #       And I check the "Show all fields" box
  #       And I type "Bendry" in the "First Name" field "input"
  #       And I type "J" in the "Middle Name" field "input"
  #       And I type "Callaye" in the "Last Name" field "input"
  #       And I type "Jr" in the "Suffix" field "input"
  #       And I type "www.author.com" in the "Link Url" field "input"
  #       And I type "Test Author Website" in the "Link Display" field "input"
  #       And I press the "Create Author" button
  #       Then I should see "Callaye, Bendry J. Jr" in the "Authors" dynamic dropdown
  #   ## ------------------- BOOKS ----------------- ##
  #   @javascript
  #   Scenario:  I should be able to create a [BOOK] publication with its sub-form
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       And I enter "Test Book" in the "Publication" form dropdown
  #       And I see "New Publication"
  #       And I select "Book" from the "Publication Type" form dropdown
  #       When I type "1990" in the "Year" field "input"
  #       And I select "Callaye, Bendry J. Jr" from the "Authors" dynamic dropdown
  #       And I select "Test Publisher" from the "Publisher" form dropdown
  #       And I check the "Show all fields" box
  #       And I type "10.1037/rmh0000008" in the "Doi" field "input"
  #       And I type "Test description" in the "Description" field "textarea"
  #       And I type "www.publication.com" in the "Link Url" field "input"
  #       And I type "Test Book Webiste" in the "Link Display" field "input"
  #       And I press the "Create Publication" button
  #       Then I should see "Test Book" in the "Publication" form dropdown
  #       And I should see "Test Book" in the "Src" detail panel
  #       And I should see "1990" in the "Src" detail panel
  #       And I should see "Test description" in the "Src" detail panel
  #       And I should see "Book Title" in the "Src" detail panel
  #       And I should see "Test Book" in the "Src" detail panel
  #       And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel
  #       And I should see "New Citation" in the form header
  #       And I should see "Callaye, B. J. 1990. Test Book. Test Publisher, Nice, France." in the "Citation Text" field "textarea"

  #   @javascript
  #   Scenario:  I should be able to create a [BOOK WITH EDITORS] publication with its sub-form
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       And I enter "Test Book with Editors" in the "Publication" form dropdown
  #       And I see "New Publication"
  #       And I select "Book" from the "Publication Type" form dropdown
  #       When I type "1990" in the "Year" field "input"
  #       And I select "Callaye, Bendry J. Jr" from the "Editors" dynamic dropdown
  #       And I select "Test Publisher" from the "Publisher" form dropdown
  #       And I check the "Show all fields" box
  #       And I type "10.1037/rmh0000008" in the "Doi" field "input"
  #       And I type "Test description" in the "Description" field "textarea"
  #       And I type "www.publication.com" in the "Link Url" field "input"
  #       And I type "Test Book Webiste" in the "Link Display" field "input"
  #       And I press the "Create Publication" button
  #       Then I should see "Test Book with Editors" in the "Publication" form dropdown
  #       And I should see "Test Book with Editors" in the "Src" detail panel
  #       And I should see "1990" in the "Src" detail panel
  #       And I should see "Book Description" in the "Src" detail panel
  #       And I should see "Test description" in the "Src" detail panel
  #       And I should see "Book Title" in the "Src" detail panel
  #       And I should see "Test Book" in the "Src" detail panel
  #       And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel
  #       And I should see "New Citation" in the form header
  #       And I should see "The citation will display here once all required fields are filled." in the "Citation Text" field "textarea"
  #   ## -------- CITATION --------- ##
  #   # TODO: TEST THAT AUTHOR FIELD IS NOT SHOWN.
  #   @javascript
  #   Scenario:  I should be able to create a [BOOK] citation with its sub-form
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       And I select "Test Book" from the "Publication" form dropdown
  #       And I enter "" in the "Citation Title" form dropdown
  #       And I see "New Citation"
  #       And I should see "Book" in the "Citation Type" form dropdown
  #       When I type "29" in the "Edition" field "input"
  #       And I should see "Callaye, B. J. 1990. Test Book. 29. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
  #       And I press the "Create Citation" button
  #       Then I should see "Test Book" in the "Citation Title" form dropdown
  #       And I should see "Callaye, B. J. 1990. Test Book. 29. Test Publisher, Nice, France." in the "Src" detail panel
  #       And I should see "Book Title" in the "Src" detail panel
  #       And I should see "Test Book" in the "Src" detail panel
  #       And I should see "1990" in the "Src" detail panel
  #       And I should see "Test description" in the "Src" detail panel
  #       And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel

  #   @javascript
  #   Scenario:  I should be able to create a [CHAPTER] citation with its sub-form
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       And I select "Test Book with Editors" from the "Publication" form dropdown
  #       And I see "New Citation"
  #       When I select "Chapter" from the "Citation Type" form dropdown
  #       And I type "Test Title for Chapter" in the "Title" field "input"
  #       And I type "666-999" in the "Pages" field "input"
  #       And I select "Cockle, Anya" from the "Authors" dynamic dropdown
  #       And I check the "Show all fields" box
  #       And I type "Test Abstract Text" in the "Abstract" field "textarea"
  #       And I see "Cockle, A. 1990. Test Title for Chapter. In: Test Book with Editors (B. J. Callaye, ed.). pp. 666-999. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
  #       And I press the "Create Citation" button
  #       Then I should see "Test Title for Chapter" in the "Citation Title" form dropdown
  #       And I should see "Cockle, A. 1990. Test Title for Chapter. In: Test Book with Editors (B. J. Callaye, ed.). pp. 666-999. Test Publisher, Nice, France." in the "Src" detail panel
  #       And I should see "Book Title" in the "Src" detail panel
  #       And I should see "Test Book" in the "Src" detail panel
  #       And I should see "Chapter Title" in the "Src" detail panel
  #       And I should see "Test Title for Chapter" in the "Src" detail panel
  #       And I should see "Test Abstract Text" in the "Src" detail panel
  #       And I should see "1990" in the "Src" detail panel
  #       And I should see "Test description" in the "Src" detail panel
  #       And I should see "Cockle, Anya" in the "Src" detail panel
  #       And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel
    
  #   ## ------------------- Journal ----------------- ##

  #   @javascript
  #   Scenario:  I should be able to create a [JOURNAL] publication with its sub-form
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       And I enter "Test Journal" in the "Publication" form dropdown
  #       And I see "New Publication"
  #       And I select "Journal" from the "Publication Type" form dropdown
  #       And I check the "Show all fields" box
  #       And I press the "Create Publication" button
  #       Then I should see "Test Journal" in the "Publication" form dropdown
  #       And I should see "Journal Title" in the "Src" detail panel
  #       And I should see "Test Journal" in the "Src" detail panel
  #       And I should see "New Citation" in the form header
  #       And I should see "The citation will display here once all required fields are filled." in the "Citation Text" field "textarea"
  #   ## -------- CITATION --------- ##
  #   @javascript
  #   Scenario:  I should be able to create a [ARTICLE] citation with its sub-form
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       And I select "Test Journal" from the "Publication" form dropdown
  #       And I see "New Citation"
  #       And I should see "Article" in the "Citation Type" form dropdown
  #       And I type "1990" in the "Year" field "input"
  #       And I type "Test Title for Article" in the "Title" field "input"
  #       And I check the "Show all fields" box
  #       And I type "666-999" in the "Pages" field "input"
  #       And I type "4" in the "Volume" field "input"
  #       And I type "1" in the "Issue" field "input"
  #       And I select "Cockle, Anya" from the "Authors" dynamic dropdown
  #       And I type "Test Abstract Text" in the "Abstract" field "textarea"
  #       And I see "Cockle, A. 1990. Test Title for Article. Test Journal 4 (1): 666-999." in the "Citation Text" field "textarea"
  #       And I press the "Create Citation" button
  #       Then I should see "Test Title for Article" in the "Citation Title" form dropdown
  #       And I should see "Cockle, A. 1990. Test Title for Article. Test Journal 4 (1): 666-999." in the "Src" detail panel
  #       And I should see "Journal Title" in the "Src" detail panel
  #       And I should see "Test Journal" in the "Src" detail panel
  #       And I should see "Article Title" in the "Src" detail panel
  #       And I should see "Test Title for Article" in the "Src" detail panel
  #       And I should see "Test Abstract Text" in the "Src" detail panel
  #       And I should see "1990" in the "Src" detail panel
  #       And I should see "Cockle, Anya" in the "Src" detail panel
    
  #   ## ------------------- Thesis/Dissertation ----------------- ##
  #   @javascript
  #   Scenario:  I should be able to create a [Thesis/Dissertation] publication with its sub-form
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       And I enter "Test Dissertation" in the "Publication" form dropdown
  #       And I see "New Publication"
  #       When I select "Thesis/Dissertation" from the "Publication Type" form dropdown
  #       And I type "1990" in the "Year" field "input"
  #       And I select "Callaye, Bendry J. Jr" from the "Authors" dynamic dropdown
  #       And I select "Test Publisher" from the "Publisher" form dropdown
  #       And I check the "Show all fields" box
  #       And I type "10.1037/rmh0000008" in the "Doi" field "input"
  #       And I type "Test description" in the "Description" field "textarea"
  #       And I type "www.publication.com" in the "Link Url" field "input"
  #       And I type "Test Book Webiste" in the "Link Display" field "input"
  #       And I press the "Create Publication" button
  #       Then I should see "Test Dissertation" in the "Publication" form dropdown
  #       And I should see "Thesis/Dissertation Title" in the "Src" detail panel
  #       And I should see "1990" in the "Src" detail panel
  #       And I should see "Test description" in the "Src" detail panel
  #       And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel
  #       And I should see "New Citation" in the form header
  #       And I should see "Callaye, B. J. 1990. Test Dissertation. Ph.D. Dissertation. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
  #   ## -------- CITATION --------- ##
  # # Add Master's thesis citation
  #   @javascript
  #   Scenario:  I should be able to create a [Ph.D. Dissertation] citation with its sub-form
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       And I select "Test Dissertation" from the "Publication" form dropdown
  #       And I see "New Citation"
  #       And I should see "Ph.D. Dissertation" in the "Citation Type" form dropdown
  #       And I see "Callaye, B. J. 1990. Test Dissertation. Ph.D. Dissertation. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
  #       And I check the "Show all fields" box
  #       And I press the "Create Citation" button
  #       Then I should see "Test Dissertation" in the "Citation Title" form dropdown
  #       And I should see "Callaye, B. J. 1990. Test Dissertation. Ph.D. Dissertation. Test Publisher, Nice, France." in the "Src" detail panel
  #       And I should see "Thesis/Dissertation Title" in the "Src" detail panel
  #       And I should see "Test Dissertation" in the "Src" detail panel
  #       And I should see "1990" in the "Src" detail panel
  #       And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel
  #   ## ------------------- OTHER ----------------- ##
  #   @javascript
  #   Scenario:  I should be able to create a [OTHER] publication with its sub-form
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       And I enter "Test Other" in the "Publication" form dropdown
  #       And I see "New Publication"
  #       When I select "Other" from the "Publication Type" form dropdown
  #       And I type "1990" in the "Year" field "input"
  #       And I select "Callaye, Bendry J. Jr" from the "Authors" dynamic dropdown
  #       And I select "Test Publisher" from the "Publisher" form dropdown
  #       And I check the "Show all fields" box
  #       And I type "10.1037/rmh0000008" in the "Doi" field "input"
  #       And I type "Test description" in the "Description" field "textarea"
  #       And I type "www.publication.com" in the "Link Url" field "input"
  #       And I type "Test Other Webiste" in the "Link Display" field "input"
  #       And I press the "Create Publication" button
  #       Then I should see "Test Other" in the "Publication" form dropdown
  #       And I should see "Publication Title" in the "Src" detail panel
  #       And I should see "1990" in the "Src" detail panel
  #       And I should see "Test description" in the "Src" detail panel
  #       And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel
  #       And I should see "New Citation" in the form header
  #       And I should see "Callaye, B. J. 1990. Test Other. Test Publisher, Nice, France." in the "Citation Text" field "textarea"

  #   ## TODO: Add for Museum record and report types as well.
  #   ## -------- CITATION --------- ##
  #   @javascript
  #   Scenario:  I should be able to create a [Other] citation with its sub-form
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       And I select "Test Other" from the "Publication" form dropdown
  #       And I see "New Citation"
  #       And I should see "Other" in the "Citation Type" form dropdown
  #       And I see "Callaye, B. J. 1990. Test Other. Test Publisher, Nice, France." in the "Citation Text" field "textarea"
  #       And I check the "Show all fields" box
  #       And I press the "Create Citation" button
  #       Then I should see "Test Other" in the "Citation Title" form dropdown
  #       And I should see "Callaye, B. J. 1990. Test Other. Test Publisher, Nice, France." in the "Src" detail panel
  #       And I should see "Publication Title" in the "Src" detail panel
  #       And I should see "1990" in the "Src" detail panel
  #       And I should see "Callaye, Bendry J. Jr" in the "Src" detail panel
  #       And I should see "Publication Description" in the "Src" detail panel

  #   ## -------------------------- Location -------------------------------------##
  #   # Testing within: The "create new location" button.
  #   @javascript
  #   Scenario:  I should be able to create a location with GPS data using the sub-form
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       And I click on "use the map interface" link
  #       And I press the "New Location" button in the map  
  #       And I should see "New Location"
  #       When I press the "Click to select position" button in the map
  #       And I type "9.79026" in the "Latitude" field "input"
  #       And I type "-83.91546" in the "Longitude" field "input"
  #       And I see the "new" location's pin on the map
  #       And I type "Test Location With GPS" in the "Display Name" field "input"
  #       And I type "Test Description" in the "Description" field "textarea"
  #       And I select "Savanna" from the "Habitat Type" form dropdown
  #       And I type "1500" in the "Elevation" field "input"
  #       And I type "2500" in the "Elevation Max" field "input"
  #       # And I see the country's polygon drawn on the map  #(Couldn't identify elem)
  #       And I press "Create Location" in the added green pin's popup
  #       Then I should see "Test Location With GPS" in the "Location" form dropdown
  #       And I should see "Test Description" in the "Location" detail panel
  #       And I should see "Costa Rica" in the "Country-Region" form dropdown
  #       And I should see "Savanna" in the "Location" detail panel
  #       And I should see "1500" in the "Location" detail panel
  #       And I should see "2500" in the "Location" detail panel
  #       And I should see "9.79026" in the "Location" detail panel
  #       And I should see "-83.91546" in the "Location" detail panel

  #   @javascript
  #   Scenario:  I should be able to create a location without GPS data
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       And I enter "Test Location Without GPS" in the "Location" form dropdown
  #       And I should see "New Location"
  #       When I type "Test Description" in the "Description" field "textarea"
  #       And I select "Costa Rica" from the "Country" form dropdown
  #       And I select "Savanna" from the "Habitat Type" form dropdown
  #       And I type "1500" in the "Elevation" field "input"
  #       And I type "2500" in the "Elevation Max" field "input"
  #       And I press the "Create without GPS data" button
  #       Then I should see "Test Location Without GPS" in the "Location" form dropdown
  #       And I should see "Test Description" in the "Location" detail panel
  #       And I should see "Savanna" in the "Location" detail panel
  #       And I should see "1500" in the "Location" detail panel
  #       And I should see "2500" in the "Location" detail panel

  #   @javascript
  #   Scenario:  I should be able to select a location using the form map
  #       Given I press the "New" button
  #       And I see "New Interaction"
  #       When I click on "use the map interface" link
  #       Then I should see the map loaded
  #       And I select "Costa Rica" from the "Country-Region" form dropdown
  #       And I see the country's polygon drawn on the map
  #       And I should see "1" location markers and "1" location clusters
  #       And I click on an existing location marker   
  #       And I press the "Select Existing Location" button
  #       And the map should close
  #       And I should see "Description" in the "Location" detail panel
  #       And I should see "Name" in the "Location" detail panel
  #       And I should see "Habitat Type" in the "Location" detail panel
  #       And I should see "Latitude" in the "Location" detail panel
  #       And I should see "Longitude" in the "Location" detail panel
  #       And I should see "Elevation" in the "Location" detail panel

  #   # Unable to get the click event to happen in the correct area of the map pane
  #   # @javascript
  #   # Scenario:  I should be able to click on map to select location position
  #   #     Given I press the "New" button
  #       # And I see "New Interaction"
  #   #     And I click on "use the map interface" link
  #   #     And I press the "New Location" button in the map  
  #   #     And I should see "New Location"
  #   #     When I press the "Click to select position" button in the map
  #   #     And I click on the map
  #   #     And I break "See the pin anywhere?"
  #   #     Then I see the "new" location's pin on the map
  #   #     And the coordinate fields should be filled
  #   #     And the marker's popup should have a description of the position 

    # ## -------------------------- Taxon ----------------------------------------##
    # @javascript
    # Scenario:  I should be able to create a taxon Family within the subject taxon sub-form
    #     Given I press the "New" button
    #     And I see "New Interaction"
    #     And I focus on the "Subject" taxon field
    #     And I see "Select Subject Taxon"
    #     When I enter "Subject Family" in the "Family" form dropdown
    #     And I see "New Taxon Family"
    #     And I press the "Create Taxon" button
    #     Then I should see "Subject Family" in the "Family" form dropdown

    # @javascript
    # Scenario:  I should be able to create a taxon Genus within the subject taxon sub-form
    #     Given I press the "New" button
    #     And I see "New Interaction"
    #     And I focus on the "Subject" taxon field
    #     And I see "Select Subject Taxon"
    #     And I select "Subject Family" from the "Family" form dropdown
    #     When I enter "SGenus" in the "Genus" form dropdown
    #     And I see "New Taxon Genus"
    #     And I press the "Create Taxon" button
    #     Then I should see "Subject Family" in the "Family" form dropdown
    #     And I should see "SGenus" in the "Genus" form dropdown

    # @javascript
    # Scenario:  I should be able to create a taxon Species within the subject taxon sub-form
    #     Given I press the "New" button
    #     And I see "New Interaction"
    #     And I focus on the "Subject" taxon field
    #     And I see "Select Subject Taxon"
    #     And I select "SGenus" from the "Genus" form dropdown
    #     When I enter "SGenus Species" in the "Species" form dropdown
    #     And I see "New Taxon Species"
    #     And I press the "Create Taxon" button
    #     Then I should see "SGenus Species" in the "Species" form dropdown
    #     And I should see "Subject Family" in the "Family" form dropdown
    #     And I should see "SGenus" in the "Genus" form dropdown

    # @javascript
    # Scenario:  I should be able to select a taxon with the subject taxon select form
    #     Given I press the "New" button
    #     And I see "New Interaction"
    #     And I focus on the "Subject" taxon field
    #     And I see "Select Subject Taxon"
    #     And I select "SGenus Species" from the "Species" form dropdown
    #     When I press the "Confirm" button
    #     Then I should see "SGenus Species" in the "Subject" form dropdown

    # @javascript
    # Scenario:  I should be able to create a taxon Class within the object taxon sub-form
    #     Given I press the "New" button
    #     And I see "New Interaction"
    #     And I focus on the "Object" taxon field
    #     And I see "Select Object Taxon"
    #     When I select "Arthropod" from the "Realm" form dropdown
    #     And I enter "Object Class" in the "Class" form dropdown
    #     And I see "New Taxon Class"
    #     And I press the "Create Taxon" button
    #     Then I should see "Object Class" in the "Class" form dropdown

    # @javascript
    # Scenario:  I should be able to create a taxon Order within the object taxon sub-form
    #     Given I press the "New" button
    #     And I see "New Interaction"
    #     And I focus on the "Object" taxon field
    #     And I see "Select Object Taxon"
    #     When I select "Arthropod" from the "Realm" form dropdown
    #     And I select "Object Class" from the "Class" form dropdown
    #     And I enter "Object Order" in the "Order" form dropdown
    #     And I see "New Taxon Order"
    #     And I press the "Create Taxon" button
    #     Then I should see "Object Order" in the "Order" form dropdown
    #     And I should see "Object Class" in the "Class" form dropdown

    # @javascript
    # Scenario:  I should be able to create a taxon Family within the object taxon sub-form
    #     Given I press the "New" button
    #     And I see "New Interaction"
    #     And I focus on the "Object" taxon field
    #     And I see "Select Object Taxon"
    #     When I select "Arthropod" from the "Realm" form dropdown
    #     And I select "Object Order" from the "Order" form dropdown
    #     And I enter "Object Family" in the "Family" form dropdown
    #     And I see "New Taxon Family"
    #     And I press the "Create Taxon" button
    #     Then I should see "Object Family" in the "Family" form dropdown        
    #     And I should see "Object Class" in the "Class" form dropdown
    #     And I should see "Object Order" in the "Order" form dropdown

    # @javascript
    # Scenario:  I should be able to create a taxon Genus within the object taxon sub-form
    #     Given I press the "New" button
    #     And I see "New Interaction"
    #     And I focus on the "Object" taxon field
    #     And I see "Select Object Taxon"
    #     When I select "Arthropod" from the "Realm" form dropdown
    #     And I select "Object Family" from the "Family" form dropdown
    #     When I enter "OGenus" in the "Genus" form dropdown
    #     And I see "New Taxon Genus"
    #     And I press the "Create Taxon" button
    #     Then I should see "OGenus" in the "Genus" form dropdown     
    #     And I should see "Object Family" in the "Family" form dropdown
    #     And I should see "Object Order" in the "Order" form dropdown
    #     And I should see "Object Class" in the "Class" form dropdown

    # @javascript
    # Scenario:  I should be able to create a taxon Species within the object taxon sub-form
    #     Given I press the "New" button
    #     And I see "New Interaction"
    #     And I focus on the "Object" taxon field
    #     And I see "Select Object Taxon"
    #     When I select "Arthropod" from the "Realm" form dropdown
    #     And I select "OGenus" from the "Genus" form dropdown
    #     When I enter "OGenus Species" in the "Species" form dropdown
    #     And I see "New Taxon Species"
    #     And I press the "Create Taxon" button
    #     Then I should see "OGenus Species" in the "Species" form dropdown
    #     And I should see "OGenus" in the "Genus" form dropdown     
    #     And I should see "Object Family" in the "Family" form dropdown
    #     And I should see "Object Order" in the "Order" form dropdown
    #     And I should see "Object Class" in the "Class" form dropdown

    # @javascript
    # Scenario:  I should be able to select a taxon with the object taxon select form
    #     Given I press the "New" button
    #     And I see "New Interaction"
    #     And I focus on the "Object" taxon field
    #     And I see "Select Object Taxon"
    #     When I select "Arthropod" from the "Realm" form dropdown
    #     And I select "OGenus Species" from the "Species" form dropdown
    #     When I press the "Confirm" button
    #     Then I should see "OGenus Species" in the "Object" form dropdown
    #     

    ## -------------------------- Interaction ----------------------------------##
    @javascript
    Scenario:  I should be able to create a new interaction with all fields filled
        Given I press the "New" button
        And I see "New Interaction"
        And I fill the new interaction form with the test values
        And I press the "Create Interaction" button
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
        Then I should see "New Interaction successfully created." in the form header
        And I should see "Test Book with Editors" in the "Publication" form dropdown
        And I should see "Test Title for Chapter" in the "Citation Title" form dropdown
        And I should see "Costa Rica" in the "Country-Region" form dropdown
        And I should see "Test Location With GPS" in the "Location" form dropdown
        And I should see "Genus SGenus" in the "Subject" form dropdown
        And I should see "Consumption" in the "Interaction Type" form dropdown
        And the "Object" select field should be empty
        And the "Interaction Tags" select field should be empty
        And the "Note" field should be empty

## ======= SINGLE SCENARIO COMBINING THE TESTS COMMENTED BELOW ============== ##
    @javascript
    Scenario:  I should see the newly created interactions in the grid #COMBO
        ## --- Source --- ##
        Given the database table is in "Source" view
        And I filter the table to interactions created today
        ## Book with Editors ##
        And I expand "Test Book with Editors" in the data tree
        And I should see "2" interactions under "Test Title for Chapter"
        And the expected data in the interaction row
        ## Author [Cockle, Anya] ##
        And I group interactions by "Authors"
        And I filter the table to interactions created today
        And I expand "Cockle, Anya" in the data tree
        And I should see "2" interactions under "Test Title for Chapter"
        And the expected data in the interaction row
        And I collapse "Cockle, Anya" in the data tree
        ## Author [Smith, George Michael Sr] ##
        And I expand "Callaye, Bendry J. Jr" in the data tree
        And I expand "Test Book with Editors" in the data tree
        And I expand "Test Title for Chapter" in level "3" of the data tree
        And I should see "2" interactions attributed
        And the expected data in the interaction row
        ## --- Location --- ##
        Given the database table is in "Location" view
        And I filter the table to interactions created today
        When I expand "Central America" in the data tree
        And I expand "Costa Rica" in the data tree
        Then I should see "2" interactions under "Test Location With GPS"
        And the expected data in the location interaction row
        ## --- Taxon --- ##
        ## Subject ##
        Given the database table is in "Taxon" view
        And I group interactions by "Bats"
        And I filter the table to interactions created today
        When I expand "Family Subject Family" in the data tree
        And I expand "Genus SGenus" in the data tree
        Then I should see "2" interactions under "Unspecified SGenus Interactions"
        And the expected data in the interaction row
        ## Object ##
        And I group interactions by "Arthropoda"
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
    #     Given the database table is in "Source" view
    #     And I filter the table to interactions created today
    #     When I expand "Test Book with Editors" in the data tree
    #     Then I should see "2" interactions under "Test Title for Chapter"
    #     And the expected data in the interaction row

    # @javascript
    # Scenario:  I should see the newly created interactions under the author [Cockle, Anya]
    #     Given the database table is in "Source" view
    #     And I group interactions by "Authors"
    #     And I filter the table to interactions created today
    #     When I expand "Cockle, Anya" in the data tree
    #     Then I should see "2" interactions under "Test Title for Chapter"
    #     And the expected data in the interaction row

    # @javascript
    # Scenario:  I should see the newly created interactions under the author [Smith, George Michael Sr]
    #     Given the database table is in "Source" view
    #     And I group interactions by "Authors"
    #     And I filter the table to interactions created today
    #     When I expand "Callaye, Bendry J. Jr" in the data tree
    #     And I expand "Test Book with Editors" in the data tree
    #     And I expand "Test Title for Chapter" in level "3" of the data tree
    #     Then I should see "2" interactions attributed
    #     And the expected data in the interaction row

    # @javascript
    # Scenario:  I should see the newly created interactions under the location
    #     Given the database table is in "Location" view
    #     And I filter the table to interactions created today
    #     When I expand "Central America" in the data tree
    #     And I expand "Costa Rica" in the data tree
    #     Then I should see "2" interactions under "Test Location With GPS"
    #     And the expected data in the location interaction row

    # @javascript
    # Scenario:  I should see the newly created interactions under the subject taxon
    #     Given the database table is in "Taxon" view
    #     And I group interactions by "Bats"
    #     And I filter the table to interactions created today
    #     When I expand "Family Subject Family" in the data tree
    #     And I expand "Genus SGenus" in the data tree
    #     Then I should see "2" interactions under "Unspecified SGenus Interactions"
    #     And the expected data in the interaction row

    # @javascript
    # Scenario:  I should see the newly created interactions under the object taxon
    #     Given the database table is in "Taxon" view
    #     And I group interactions by "Arthropoda"
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
        And the database table is in "Location" view
        When I exit the form window
        Then I should see the table displayed in "Location" view

    @javascript
    Scenario:  The table should reload in Source view after creating an interaction.
        Given I press the "New" button
        And I see "New Interaction"
        And I fill the new interaction form with the test values
        And I press the "Create Interaction" button
        And I see "New Interaction successfully created." in the form header
        When I exit the form window
        Then I should see the table displayed in "Source" view
        And I should see "1" row in the table data tree
