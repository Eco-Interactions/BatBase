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
 * {
 *    add: { FieldName: fieldType, ... }
 *    required: [ FieldName, ... ],
 *    basic: [ FieldName, ... ] (always shown)  //todo: rename
 *    optional: [ FieldName, ... ]  //todo: if optional is false, suggested can be emptu here and opt can be removed from order
 *    order: {
 *       'basic': [ FullRowField, [FieldName, SecondFieldInRow, ...], ...]
 *       'opt': [SameFormat, or FALSE]
 *    }
 *    types: {
 *         Type name: {
 *              name:
 *              required:
 *              optional:
 *              order
 *         }
 *    }
 * }
 *
 * Exports
 *     getFormConfg
 *     getCoreFieldDefs
 *     getCoreEntity
 *     getFieldTranslations
 *     getCoreFormEntity
 *
 * TOC
 *     FORM CONFG
 *         TAXON SELECT FORM CONFG
 *         CREATE/EDIT FORM CONFG
 *             CORE-ENTITY CONFG
 *     SERVER FIELD CONFG
 */
import { _state } from '../forms-main.js';

/* *************************** FORM CONFG *********************************** */
export function getFormConfg(entity) {
    if (['subject', 'object'].indexOf(entity) >= 0) { return getRoleConfg(entity); }
    const confgEntity = entity === 'editor' ? 'author' : entity;
    return getEntityConfg(confgEntity);
}
function getEntityConfg(entity) {
    return require(`./entity/${entity}-confg.js`).default();
}
export function getRealmInteractionTypes() {
    return require(`./entity/realm-confg.js`).default(...arguments);
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
    const objFields = {'Realm': 'select', 'Group': 'select'};
    return role === 'subject' || $('#Realm_row').length ? {'Group': 'select'} : objFields;
}
function getTaxonSelectFields(addField) {
    const lvls = _state('getTaxonProp', ['realmLvls']);
    const addedFields = Object.keys(addField);
    return !addedFields.length ? lvls : [...addedFields, ...lvls];
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
            'Elevation': 'num', 'ElevationMax': 'num', 'Longitude': 'lng',
            'Latitude': 'lat', 'HabitatType': 'select', 'Country': 'select',
        },
        'interaction': { 'Publication': 'select', 'CitationTitle': 'select',
            'Country-Region': 'select', 'Location': 'select',
            'Subject': 'select', 'Object': 'select', 'InteractionType': 'select',
            'InteractionTags': 'tags', 'Note': 'fullTextArea'
        },
        'source': { 'DisplayName': 'text', 'Description': 'textArea',
            'Year': 'year', 'Doi': 'doi','Website': 'url',
            'Authors': 'multiSelect', 'Editors': 'multiSelect'
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
            'displayName': { 'source': 'displayName', 'author': 'displayName' },
            'website': { 'source': 'linkUrl' }
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
            'reportType': { 'citation': 'subType' },
            'website': { 'source': 'linkUrl' }
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
            'publisher/University': { 'source': 'parentSource' },
            'website': { 'source': 'linkUrl' }
        },
        'publisher': {
            'displayName': { 'source': 'displayName', 'publisher': 'displayName' },
            'website': { 'source': 'linkUrl' }
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