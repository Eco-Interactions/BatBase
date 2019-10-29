/**
 * Config for all entity forms.
 *
 * Exports:         Imported by:
 *     getFormConfg         db-forms, edit-forms
 *     getCoreFieldDefs     db-forms, edit-forms
 */
import * as db_forms from './db-forms.js';

/**
 * Returns a form-config object for the passed entity. 
 * -- Property descriptions:  
 * > add - Additonal fields for a detail-entity. E.g. Citation is a detail-entity
 *   of Source with a unique combination of fields from Source and itself.
 * > required - Required fields for the entity.
 * > suggested - Suggested fields for the entity.
 *   NOTE: The required and suggested fields will be the default shown in form. 
 * > optional - All remaining available fields for the entity.
 * > order - Order to display the fields in both the default and expanded forms. 
 * > exitHandler - optional Obj with handlers for exiting create/edit forms.
 */
export function getFormConfg(entity) {                                                 //console.log('getFormConfg [%s]', entity);
    const fieldMap = { 
        "arthropod": {
            "add": {},  
            "required": [],
            "suggested": ["Class", "Order", "Family", "Genus", "Species"],
            "optional": [],
            "order": {
                "sug": ["Species", "Genus", "Family", "Order", "Class"],
                "opt": false },
            "exitHandler": { create: db_forms.enableTaxonCombos }
        },
        "author": { 
            "add": { "FirstName": "text", "MiddleName": "text", 
                "LastName": "text", "Suffix": "text"}, 
            "required": ["LastName"], 
            "suggested": ["FirstName", "MiddleName"],
            "optional": ["Suffix", "LinkUrl", "LinkDisplay"],
            "order": {
                "sug": ["FirstName", "MiddleName", "LastName"],
                "opt": ["FirstName", "MiddleName", "LastName", "Suffix", 
                    "LinkUrl", "LinkDisplay"]},
        },
        "bat": {
            "add": {},  
            "required": [],
            "suggested": ["Family", "Genus", "Species"],
            "optional": [],
            "order": {
                "sug": ["Family", "Genus", "Species"],
                "opt": false }, 
            //Because there is only one subject realm, the exithandler lives in the subject confg 
        },
        'citation': {
            'add': { 'Title': 'text', 'Volume': 'text', 'Abstract': 'fullTextArea',
                'Issue': 'text', 'Pages': 'text', 'CitationType': 'select', 
                'CitationText': 'fullTextArea'},
            'required': ['Title', 'CitationType'],  
            'suggested': ['CitationText'], 
            'optional': ['Abstract'],
            'order': {
                'sug': ['CitationText', 'Title', 'CitationType'], 
                'opt': ['CitationText', 'Abstract', 'Title', 'CitationType']},  
            'types': {
                'Article': {                        
                    'name': 'Article',
                    'required': ['Authors', 'Year'],
                    'suggested': ['Issue', 'Pages', 'Volume'],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': ['Year', 'Pages', 'Volume', 'Issue', 'Authors'],
                        'opt': ['Year', 'Pages', 'Volume', 'Issue', 
                            'LinkDisplay', 'LinkUrl', 'Doi', 'Authors']},
                },
                'Book': {
                    'name': 'Book',
                    'required': ['Authors'],
                    'suggested': ['Volume', 'Pages'],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': ['Volume', 'Pages', 'Authors'],
                        'opt': ['Volume', 'Doi', 'LinkDisplay', 'LinkUrl', 'Pages', 'Authors']},
                },
                'Chapter': {
                    'name': 'Chapter',
                    'required': ['Pages', 'Authors'],
                    'suggested': [],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': ['Pages', 'Authors'],
                        'opt': ['Pages', 'Doi', 'LinkDisplay', 'LinkUrl', 
                            'Authors' ]},
                },
                "Master's Thesis": {
                    'name': "Master's Thesis",
                    'required': [],
                    'suggested': [],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': [],
                        'opt': ['LinkDisplay', 'LinkUrl', 'Doi']},
                },
                'Museum record': {
                    'name': 'Museum record',
                    'required': [],
                    'suggested': ['Authors', 'Year', 'Pages'],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': ['Year', 'Pages', 'Authors'],
                        'opt': ['Year', 'Pages', 'LinkDisplay', 'LinkUrl', 
                            'Doi', 'Authors']},
                },
                'Other': {
                    'name': 'Other',
                    'required': [],
                    'suggested': ['Authors', 'Year', 'Issue', 'Pages', 'Volume'],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': ['Year', 'Pages', 'Volume', 'Issue', 'Authors'],
                        'opt': ['Year', 'Pages', 'Volume', 'Issue', 
                            'LinkDisplay', 'LinkUrl', 'Doi', 'Authors']},
                },
                'Ph.D. Dissertation': {
                    'name': 'Ph.D. Dissertation',
                    'required': [],
                    'suggested': [],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': [],
                        'opt': ['LinkDisplay', 'LinkUrl', 'Doi']},
                },
                'Report': {
                    'name': 'Report',
                    'required': [],
                    'suggested': ['Authors', 'Year', 'Pages'],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': ['Year', 'Pages', 'Volume', 'Issue', 'Authors'],
                        'opt': ['Year', 'Pages', 'Volume', 'Issue', 
                            'LinkDisplay', 'LinkUrl', 'Doi', 'Authors']},
                }
            },
            'exitHandler': { create: db_forms.enablePubField }
        },    
        'editor': { 
            "add": { "FirstName": "text", "MiddleName": "text", 
                "LastName": "text", "Suffix": "text"}, 
            "required": ["LastName"], 
            "suggested": ["FirstName", "MiddleName"],
            "optional": ["Suffix", "LinkUrl", "LinkDisplay"],
            "order": {
                "sug": ["FirstName", "MiddleName", "LastName"],
                "opt": ["FirstName", "MiddleName", "LastName", "Suffix", 
                    "LinkUrl", "LinkDisplay"]},
        },                                  
        'interaction': {
            "add": {},  
            "required": ["InteractionType"],
            "suggested": ["InteractionTags", "Note"],
            "optional": [],
            "order": {
                "sug": ["InteractionType","InteractionTags", "Note"],
                "opt": false },
            "exitHandler": { create: db_forms.resetInteractionForm }
        },
        'location': {
            'add': {},  
            'required': ['DisplayName', 'Country'],
            'suggested': ['Description', 'HabitatType', 'Latitude', 'Longitude',
                'Elevation', 'ElevationMax'],
            'optional': [],
            'order': {
                'sug': ['Latitude', 'Longitude', 'DisplayName', 'Description', 
                    'Country', 'HabitatType', 'Elevation', 'ElevationMax' ],
                'opt': false },
            'exitHandler': { create: db_forms.enableCountryRegionField }
        },
        'object': {
            "add": {"Realm": "select"},  
            "required": [],
            "suggested": ["Realm"],
            "optional": [],
            "order": {
                "sug": ["Realm"],
                "opt": false }, 
        },
        'plant': {
            "add": {},  
            "required": [],
            "suggested": ["Family", "Genus", "Species"],
            "optional": [],
            "order": {
                "sug": ["Species", "Genus", "Family"],
                "opt": false},
            "exitHandler": { create: db_forms.enableTaxonCombos }
        },
        'publication': {
            "add": { "Title" : "text", "PublicationType": "select", 
                "Publisher": "select"},  
            "required": ["PublicationType", "Title"],
            "suggested": [],
            "optional": [],
            "order": {
                "sug": ["Title", "PublicationType"],
                "opt": ["Title", "PublicationType"] },
            "types": {
                "Book": {
                    "name": 'Book',
                    "required": ["Authors", 'Editors', "Publisher", "Year"],
                    "suggested": [],
                    "optional": ["Description", "LinkDisplay", "LinkUrl", "Doi"],
                    "order": {
                        "sug": ["Year", "Publisher", "Authors", 'Editors'],
                        "opt": ["Year", "Doi", "LinkDisplay", "LinkUrl", 
                            "Description", "Publisher", "Authors", 'Editors']},
                },
                "Journal": {
                    "name": 'Journal',
                    "required": [],
                    "suggested": [],
                    "optional": ["Year", "Description", "LinkDisplay", "LinkUrl", 
                        "Doi", "Publisher", "Authors" ],
                    "order": {
                        "sug": [],
                        "opt": ["Year", "Doi", "LinkDisplay", "LinkUrl",
                        "Description", "Publisher", "Authors" ]},
                },
                "Other": {
                    "name": 'Other',
                    "required": ["Authors", 'Year'],
                    "suggested": ["Publisher"],
                    "optional": ["Description", "LinkDisplay", "LinkUrl", "Doi"],
                    "order":  {
                        "sug": ["Year", "Publisher", "Authors"],
                        "opt": ["Year", "Doi", "LinkDisplay", "LinkUrl", 
                            "Description", "Publisher", "Authors"]},
                },
                "Thesis/Dissertation": {
                    "name": 'Thesis/Dissertation',
                    "required": ["Authors", "Publisher", "Year"],
                    "suggested": [],
                    "optional": ["Description", "LinkDisplay", "LinkUrl", "Doi"],
                    "order":  {
                        "sug": ["Year", "Publisher", "Authors"],
                        "opt": ["Year", "Description", "LinkDisplay", 
                            "LinkUrl", "Doi", "Publisher", "Authors"]},
                },
            }
        },
        'publisher': { 
            "add": { "City": "text", "Country": "text"}, 
            "required": ["DisplayName", "City", "Country"],
            "suggested": [],
            "optional": ["Description", "LinkUrl", "LinkDisplay"],
            "order": {
                "sug": ["DisplayName", "City", "Country"],
                "opt": ["DisplayName", "City", "Country", "Description", 
                    "LinkUrl", "LinkDisplay"]},
        },
        'subject': {
            "add": {},  
            "required": [],
            "suggested": ["Family", "Genus", "Species"],
            "optional": [],
            "order": {
                "sug": ["Species", "Genus", "Family"],
                "opt": false },
            "exitHandler": { create: db_forms.enableTaxonCombos }
        },
        'taxon': {
            "add": {},  
            "required": ["DisplayName"],
            "suggested": [],
            "optional": [],
            "order": {
                "sug": ["DisplayName"],
                "opt": false },
            "exitHandler": { create: db_forms.enableTaxonCombos }
        },
    };
    return fieldMap[entity];
}
/**
 * Returns an object of fields and field types for the passed entity.
 * Note: Source's have sub-entities that will return the core source fields.
 */
export function getCoreFieldDefs(entity) {  
    const coreEntityMap = {
        "author": "source",         "citation": "source",
        "publication": "source",    "publisher": "source",
        "location": "location",     "subject": "taxonLvls",
        "object": "taxonLvls",      "plant": "taxonLvls",
        "arthropod": "taxonLvls",   "taxon": "taxon",
        "interaction": "interaction","bat": "taxonLvls",          
        'editor': 'source',
    };
    const fields = {
        "location": { "DisplayName": "text", "Description": "textArea", 
            "Elevation": "text", "ElevationMax": "text", "Longitude": "text", 
            "Latitude": "text", "HabitatType": "select", "Country": "select", 
        }, 
        "interaction": { "InteractionType": "select", "Note": "fullTextArea", 
            "InteractionTags": "tags"
        },
        "source": { "DisplayName": "text", "Description": "textArea", 
            "Year": "text", "Doi": "text", "LinkDisplay": "text", 
            "LinkUrl": "text", "Authors": "multiSelect", "Editors": "multiSelect"
        },
        "taxonLvls": {
            "Class": "select", "Order": "select", "Family": "select", 
            "Genus": "select", "Species": "select"
        },
        "taxon": { "DisplayName": "text" }
    };
    return fields[coreEntityMap[entity]];
}    