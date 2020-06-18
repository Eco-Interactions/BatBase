/**
 * Config for all entity forms.
 *
 * Exports:             Imported by:
 *     getFormConfg             db-forms, edit-forms
 *     getCoreFieldDefs         db-forms, edit-forms
 *     getCoreEntity          db-forms, edit-forms
 *     getFieldTranslations     validate-data
 *     getCoreFormEntity        validate-data
 *
 * CODE SECTIONS:
 *     FORM CONFG
 *         TAXON SELECT FORM CONFG
 *         CREATE/EDIT FORM CONFG
 *             CORE-ENTITY CONFG
 *     SERVER FIELD CONFG
 */
import * as _f from '../forms-main.js';

/* *************************** FORM CONFG *********************************** */
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
 */
export function getFormConfg(entity) {                                          
    if (['subject', 'object'].indexOf(entity) >= 0) { return getRoleConfg(entity); }
    return getEntityConfg(entity);
}
/* ------------------ TAXON SELECT FORM CONFG ------------------------------- */
function getRoleConfg(role) {
    const addField = ifObjectFormAddRealmSelect(role);
    const fields = getTaxonSelectFields(addField);
    return {
        'add': addField,  
        'required': [],
        'suggested': fields,
        'optional': [],
        'order': {
            'sug': fields,
            'opt': false },
    };
}
function ifObjectFormAddRealmSelect(role) {
    return role === 'subject' || $('#Realm_row').length ? {} : {'Realm': 'select'};
}
function getTaxonSelectFields(addField) {
    const lvls = _f.state('getTaxonProp', ['realmLvls']);
    return Object.keys(addField).length  ? ['Realm', ...lvls] : lvls;
}
/* ------------------ CREATE/EDIT FORM CONFG ------------------------------- */
function getEntityConfg(entity) {
    const fieldMap = { 
        'author': { 
            'add': { 'FirstName': 'text', 'MiddleName': 'text', 
                'LastName': 'text', 'Suffix': 'text'}, 
            'required': ['LastName'], 
            'suggested': ['FirstName', 'MiddleName', 'Suffix'],
            'optional': ['LinkUrl', 'LinkDisplay'],
            'order': {
                'sug': ['FirstName', 'MiddleName', 'LastName', 'Suffix'],
                'opt': ['FirstName', 'MiddleName', 'LastName', 'Suffix', 
                    'LinkUrl', 'LinkDisplay']},
        },
        'citation': {
            'add': { 'Title': 'text', 'Volume': 'text', 'Abstract': 'fullTextArea',
                'Issue': 'text', 'Pages': 'text', 'CitationType': 'select', 
                'CitationText': 'fullTextArea'},
            'required': ['Title', 'CitationType'],  
            'suggested': ['CitationText', 'Abstract', 'Doi', 'LinkDisplay', 'LinkUrl'], 
            'optional': [],
            'order': {
                'sug': ['CitationText', 'Abstract', ['Title', 'CitationType']],  
                'opt': false, 
            },
            'types': {
                'Article': {                        
                    'name': 'Article',
                    'required': ['Authors', 'Year'],
                    'suggested': ['Issue', 'Pages', 'Volume'],
                    'optional': [],
                    'order': {
                        'sug': [['Year', 'Pages'], ['Volume', 'Issue'], 
                            ['LinkDisplay', 'LinkUrl'], ['Doi', 'Authors']]},
                        'opt': false,
                },
                'Book': {
                    'name': 'Book',
                    'required': ['Authors'],
                    'suggested': ['Volume'],
                    'optional': [],
                    'order': {
                        'sug': [['Volume', 'Doi'], ['LinkDisplay', 'LinkUrl'], 
                            ['Authors']]},
                        'opt': false,
                },
                'Chapter': {
                    'name': 'Chapter',
                    'required': ['Pages', 'Authors'],
                    'suggested': [],
                    'optional': [],
                    'order': {
                        'sug': [['Pages', 'Doi'], ['LinkDisplay', 'LinkUrl'], 
                            'Authors' ]},
                        'opt': false,
                },
                "Master's Thesis": {
                    'name': "Master's Thesis",
                    'required': [],
                    'suggested': [],
                    'optional': [],
                    'order': {
                        'sug': [['LinkDisplay', 'LinkUrl'], 'Doi']},
                        'opt': false,
                },
                'Museum record': {
                    'name': 'Museum record',
                    'required': [],
                    'suggested': ['Authors', 'Year', 'Pages'],
                    'optional': [],
                    'order': {
                        'sug': [['Year', 'Pages'], ['LinkDisplay', 'LinkUrl'], 
                            ['Doi', 'Authors']]},
                        'opt': false,
                },
                'Other': {
                    'name': 'Other',
                    'required': [],
                    'suggested': ['Authors', 'Year', 'Issue', 'Pages', 'Volume'],
                    'optional': [],
                    'order': {
                        'sug': [['Year', 'Pages'], ['Volume', 'Issue'], 
                            ['LinkDisplay', 'LinkUrl'], ['Doi', 'Authors']]},
                        'opt': false,
                },
                'Ph.D. Dissertation': {
                    'name': 'Ph.D. Dissertation',
                    'required': [],
                    'suggested': [],
                    'optional': [],
                    'order': {
                        'sug': [['LinkDisplay', 'LinkUrl'], 'Doi']},
                        'opt': false,
                },
                'Report': {
                    'name': 'Report',
                    'required': [],
                    'suggested': ['Authors', 'Year', 'Pages', 'Volume', 'Issue'],
                    'optional': [],
                    'order': {
                        'sug': [['Year', 'Pages'], ['Volume', 'Issue'], 
                            ['LinkDisplay', 'LinkUrl'], ['Doi', 'Authors']]},
                        'opt': false,
                }
            },
        },    
        'editor': { 
            'add': { 'FirstName': 'text', 'MiddleName': 'text', 
                'LastName': 'text', 'Suffix': 'text'}, 
            'required': ['LastName'], 
            'suggested': ['FirstName', 'MiddleName', 'Suffix'],
            'optional': ['LinkUrl', 'LinkDisplay'],
            'order': {
                'sug': ['FirstName', 'MiddleName', 'LastName', 'Suffix'],
                'opt': ['FirstName', 'MiddleName', 'LastName', 'Suffix', 
                    'LinkUrl', 'LinkDisplay']},
        },                                  
        'interaction': {
            'add': {},  
            'required': ['Publication', 'CitationTitle', 'Country-Region', 'Location',
                'Subject', 'Object', 'InteractionType'],
            'suggested': ['InteractionTags', 'Note'],
            'optional': [],
            'order': {
                'sug': [['Publication', 'CitationTitle'], ['Country-Region', 'Location'],
                    ['Subject', 'Object'], ['InteractionType','InteractionTags'], 
                    'Note'],
                'opt': false },
        },
        'location': {
            'add': {},  
            'required': ['DisplayName', 'Country'],
            'suggested': ['Description', 'HabitatType', 'Latitude', 'Longitude',
                'Elevation', 'ElevationMax'],
            'optional': [],
            'order': {
                'sug': [['Latitude', 'Longitude'], ['DisplayName', 'Description'], 
                    ['Country', 'HabitatType'], ['Elevation', 'ElevationMax'] ],
                'opt': false },
        },
        'publication': {
            'add': { 'Title' : 'text', 'PublicationType': 'select', 
                'Publisher': 'select'},  
            'required': ['PublicationType', 'Title'],
            'suggested': [],
            'optional': [],
            'order': {
                'sug': [['Title', 'PublicationType']],
                'opt': [['Title', 'PublicationType']] },
            'types': {
                'Book': {
                    'name': 'Book',
                    'required': ['Authors', 'Editors', 'Publisher', 'Year'],
                    'suggested': [],
                    'optional': ['Description', 'LinkDisplay', 'LinkUrl', 'Doi'],
                    'order': {
                        'sug': [['Year', 'Publisher'], ['Authors', 'Editors']],
                        'opt': [['Year', 'Doi'], ['LinkDisplay', 'LinkUrl'], 
                            ['Description', 'Publisher'], ['Authors', 'Editors']]},
                },
                'Journal': {
                    'name': 'Journal',
                    'required': [],
                    'suggested': [],
                    'optional': ['Year', 'Description', 'LinkDisplay', 'LinkUrl', 
                        'Doi', 'Publisher'],
                    'order': {
                        'sug': [],
                        'opt': [['Year', 'Doi'], ['LinkDisplay', 'LinkUrl'],
                        ['Description', 'Publisher']]},
                },
                'Other': {
                    'name': 'Other',
                    'required': ['Authors', 'Year'],
                    'suggested': ['Publisher'],
                    'optional': ['Description', 'LinkDisplay', 'LinkUrl', 'Doi'],
                    'order':  {
                        'sug': [['Year', 'Publisher'], 'Authors'],
                        'opt': [['Year', 'Doi'], ['LinkDisplay', 'LinkUrl'], 
                            ['Description', 'Publisher'], 'Authors']},
                },
                'Thesis/Dissertation': {
                    'name': 'Thesis/Dissertation',
                    'required': ['Authors', 'Publisher', 'Year'],
                    'suggested': [],
                    'optional': ['Description', 'LinkDisplay', 'LinkUrl', 'Doi'],
                    'order':  {
                        'sug': [['Year', 'Publisher'], 'Authors'],
                        'opt': [['Year', 'Doi'], ['LinkDisplay', 'LinkUrl'], 
                        ['Description', 'Publisher'], 'Authors']},
                },
            }
        },
        'publisher': { 
            'add': { 'City': 'text', 'Country': 'text'}, 
            'required': ['DisplayName', 'City', 'Country'],
            'suggested': [],
            'optional': ['Description', 'LinkUrl', 'LinkDisplay'],
            'order': {
                'sug': ['DisplayName', 'City', 'Country'],
                'opt': ['DisplayName', 'City', 'Country', 'Description', 
                    'LinkUrl', 'LinkDisplay']},
        },
        'taxon': {
            'add': {},  
            'required': ['DisplayName'],
            'suggested': [],
            'optional': [],
            'order': {
                'sug': ['DisplayName'],
                'opt': false },
        },
    };
    return fieldMap[entity];
}
/* --------------- CORE-ENTITY CONFG ----------------- */
/**
 * Returns an object of fields and field types for the passed entity.
 * Note: Source's have sub-entities that will return the core source fields.
 */
export function getCoreFieldDefs(entity) {  
    const coreEntityMap = {
        'author': 'source',         'citation': 'source',
        'publication': 'source',    'publisher': 'source',
        'location': 'location',     'subject': 'taxonLvls',
        'object': 'taxonLvls',      'plant': 'taxonLvls',
        'arthropod': 'taxonLvls',   'taxon': 'taxon',
        'interaction': 'interaction','bat': 'taxonLvls',          
        'editor': 'source',
    };
    const fields = {
        'location': { 'DisplayName': 'text', 'Description': 'textArea', 
            'Elevation': 'text', 'ElevationMax': 'text', 'Longitude': 'text', 
            'Latitude': 'text', 'HabitatType': 'select', 'Country': 'select', 
        }, 
        'interaction': { 'Publication': 'select', 'CitationTitle': 'select', 
            'Country-Region': 'select', 'Location': 'select',
            'Subject': 'select', 'Object': 'select', 'InteractionType': 'select', 
            'InteractionTags': 'tags', 'Note': 'fullTextArea'
        },
        'source': { 'DisplayName': 'text', 'Description': 'textArea', 
            'Year': 'text', 'Doi': 'text', 'LinkDisplay': 'text', 
            'LinkUrl': 'text', 'Authors': 'multiSelect', 'Editors': 'multiSelect'
        },
        'taxonLvls': {
            'Class': 'select', 'Order': 'select', 'Family': 'select', 
            'Genus': 'select', 'Species': 'select'
        },
        'taxon': { 'DisplayName': 'text' }
    };                                                                          //console.log('---------getCoreFieldDefs [%s] fields = %O', coreEntityMap[entity], fields[coreEntityMap[entity]]);
    return fields[coreEntityMap[entity]];
}    

/** Returns the core entity. (eg, Source is returned for author, citation, etc.) */
export function getCoreFormEntity(entity) {
    var coreEntities = {
        'author': 'source',         'citation': 'source', 
        'publication': 'source',    'publisher': 'source', 
        'location': 'location',     'taxon': 'taxon', 
        'interaction': 'interaction', 'editor': 'source'
    };
    return coreEntities[entity];
}
export function getCoreEntity(entity) {                                          
    const details = ['author', 'citation', 'publication', 'publisher'];         //console.log('hasParentEntity? [%s]. Entity = %s', details.indexOf(entity) !== -1, entity);
    return details.indexOf(entity) !== -1 ? 'source' : entity;
}
/* *********************** SERVER FIELD CONFG ******************************* */
/**
 * Returns the fields that need to be renamed and the entity they belong to. 
 * A 'false' field will not be added to the final form data. An array of 
 * fields will add the form value to each field for the specified entity.
 */
export function getFieldTranslations(entity) {                                  //console.log('entity = ', entity)
    const fieldTrans = {
        'author': {
            'displayName': { 'source': 'displayName', 'author': 'displayName' }
        },
        'citation': { 
            'authors': { 'source': false },
            'contributor': { 'source': 'contributor' },
            'citationText': { 'source': 'description', 'citation': 'fullText' }, 
            'publication': { 'source': 'parentSource' },
            'title': { 'source': 'displayName', 'citation': ['displayName', 'title'] },
            'chapterTitle': { 'source': 'displayName', 
                'citation': ['displayName', 'title'] },
            'volume': { 'citation': 'publicationVolume' },
            'edition': { 'citation': 'publicationVolume' },
            'issue': { 'citation': 'publicationIssue' },
            'pages': { 'citation': 'publicationPages' },
            'reportType': { 'citation': 'subType' }
            // 'tags': { 'source': 'tags' }
        },
        'interaction': {
            'citationTitle': { 'interaction': 'source' },
            'country/Region': { 'interaction': false },
            'interactionTags': { 'interaction': 'tags' },
            'notes': { 'interaction': 'note' }, 
            'publication': { 'interaction': false }
        },
        'location': {
            'country': { 'location': 'parentLoc' }
        },
        'publication': { 
            'authors': { 'source': false },
            'editors': { 'source': false }, 
            'contributor': { 'source': 'contributor' },
            'publisher': { 'source': 'parentSource' }, 
            'description': { 'source': 'description', 'publication': 'description' },
            'title': { 'source': 'displayName', 'publication': 'displayName' },
            'publisher/University': { 'source': 'parentSource' }
        },
        'publisher': {
            'displayName': { 'source': 'displayName', 'publisher': 'displayName' }
        },
        'taxon': {
            'displayName': { 'taxon': 'name' }
        }
    };
    return fieldTrans[entity] || {};
}
/**
 * Returns an array of fields that are relationships with other entities. 
 * Note: use field names before field translations/renamings.
 */
export function getRelationshipFields(entity) {
    const relationships = {
        'author': ['sourceType'], 
        'citation': ['citationType', 'contributor', 'publication'], 
        'location': ['locationType', 'habitatType', 'country'],
        'publication': ['publicationType', 'contributor', 'publisher', 
            'publisher/University'],
        'publisher': [],
        'taxon': ['level', 'parentTaxon', 'realm'],
        'interaction': ['citationTitle', 'location', 'subject', 'object', 
            'interactionTags', 'interactionType' ]
    };
    return relationships[entity];
}