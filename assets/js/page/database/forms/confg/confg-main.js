/**
 * Returns a form-config object for the passed entity.
 * { *: default confg properties
 *    core: entityName,
 *    *display: view, //Defaults to 'simple' display, if defined.
 *    *fields: {  //CORE.FIELDS AND TYPE.FIELDS WILL BE MERGED IN
 *        FieldName: { //DisplayName
 *            displayClass: "",
 *            entity: entityName,
 *            info: { intro: "", (req)tooltip: "" },
 *            *name: FieldName,  (req)
 *            prop: { core: [propName, ...], detail: [propName, ...]}
 *            required: true|false,
 *            *type: "",  (req)
 *        }, ... }
 *    misc: {
 *        entityProp: value
 *    },
 *    type: Type name, once selected. Only for entities with subTypes
 *    types: {
 *         Type name: {
 *              name: (req)
 *              [confg prop with type-data]
 *         }
 *    },
 *    *views: { //fields will be built and displayed according to the view
 *       *all:    [ FullRowField, [FieldName, SecondFieldInRow, ...], ...]
 *       simple: [SameFormat]
 *    }
 * }
 *
 * Export
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
import { _u } from '~util';
import { _state } from '../forms-main.js';
import { mergeIntoFormConfg } from './merge-confgs.js';

/* *************************** FORM CONFG *********************************** */
export function getFormConfg(entity, fLvl, showSimpleView = true) { /*dbug-log*///console.log('getFormConfg [%s][%s] showSimpleView?[%s]', fLvl, entity, showSimpleView);
    const confgName = getFormConfgName(entity);
    return getEntityConfg(confgName, entity, showSimpleView);
}
function getFormConfgName(entity) {
    const map = {
        Subject: 'group',
        Object: 'group',
        Editor: 'author'
    };
    return map[entity] ? map[entity] : _u('lcfirst', [entity]);
}
function getConfg(name, entity) {                                   /*dbug-log*///console.log('getConfg [%s] for [%s]', name, entity);
    return require(`./entity/${name}-confg.js`).default(entity);
}
function getEntityConfg(confgName, entity, fLvl, showSimpleView) {
    const fConfg = getConfg(confgName, entity);                     /*dbug-log*///console.log('getEntityConfg [%s][%O]', confgName, _u('snapshot', [fConfg]));
    handleConfgMerges(fConfg, fLvl);
    fConfg.display = showSimpleView && fConfg.view.simple ? 'simple' : 'all';
    // filterUnusedFieldData(fConfg);
    return fConfg;
}
/* ====================== MERGE CONFG-DATA ================================== */
function handleConfgMerges(fConfg) {                                /*dbug-log*///console.log('handleConfgMerges fConfg[%O]', _u('snapshot', [fConfg]));
    mergeEntityTypeConfg(fConfg);
    if (fConfg.core) { mergeCoreEntityConfg(fConfg); }
}
function mergeEntityTypeConfg(fConfg, fLvl) {
    const type = _state('getFormConfg', [fLvl, 'type']);            /*dbug-log*///console.log('mergeEntityTypeConfg type?[%s]', type);
    if (!type) { return; }
    mergeIntoFormConfg(fConfg, fConfg.types[type]);
}
/**
 * [mergeCoreAndDetailConfgs description]
 * @param  {[type]} fConfg [description]
 * @return {[type]}        [description]
 */
function mergeCoreEntityConfg(fConfg) {
    const cEntityConfg = getConfg(fConfg.core);                     /*dbug-log*///console.log('mergeCoreAndDetailConfgs fConfg[%O], cEntityConfg[%O]', views, cEntityConfg);
    mergeIntoFormConfg(fConfg, cEntityConfg);
}

























/* --------------- CORE-ENTITY CONFG ----------------- */
/**
 * Returns an object of fields and field types for the passed entity.
 * Note: Source's have sub-entities that will return the core source fields.
 */
export function getCoreFieldDefs(entity) {
    const coreEntityMap = {
        'author': 'source',
        'citation': 'source',
        'publication': 'source',
        'publisher': 'source',
        'location': 'location',
        'object': 'taxonGroup',
        'subject': 'taxonGroup',
        'taxon': 'taxon',
        'interaction': 'interaction',
        'editor': 'source'
    };                                                              /*dbug-log*///console.log('getCoreFieldDefs entity[%s] core?[%s]', entity, coreEntityMap[entity]);
    const fields = {
        // 'location': { 'DisplayName': 'text', 'Description': 'textArea',
        //     'Elevation': 'num', 'ElevationMax': 'num', 'Longitude': 'lng',
        //     'Latitude': 'lat', 'HabitatType': 'select', 'Country': 'select',
        // },
        // 'interaction': { 'Publication': 'select', 'CitationTitle': 'select',
        //     'Country-Region': 'select', 'Location': 'select',
        //     'Subject': 'select', 'Object': 'select', 'InteractionType': 'select',
        //     'InteractionTags': 'tags', 'Note': 'fullTextArea'
        // },
        // 'source': { 'DisplayName': 'text', 'Description': 'textArea',
        //     'Year': 'year', 'Doi': 'doi','Website': 'url',
        //     'Authors': 'multiSelect', 'Editors': 'multiSelect'
        // },
        // 'taxonGroup': {
        //     'Group': 'select',
        //     'Sub-Group': 'select',
        //     'Class': 'select',
        //     'Order': 'select',
        //     'Family': 'select',
        //     'Genus': 'select',
        //     'Species': 'select'
        // },
        // 'taxon': { 'DisplayName': 'text' }
    };                                                              /*dbug-log*///console.log('fields = %O', fields[coreEntityMap[entity]]);
    return fields[coreEntityMap[entity]];
}

/** Returns the core entity. (eg, Source is returned for author, citation, etc.) */
export function getCoreFormEntity(entity) {
    const coreEntities = {
        'author': 'source',         'citation': 'source',
        'publication': 'source',    'publisher': 'source',
        'location': 'location',     'taxon': 'taxon',
        'interaction': 'interaction', 'editor': 'source'
    };
    return coreEntities[entity];
}
export function getCoreEntity(entity) {
    const details = ['author', 'citation', 'publication', 'publisher'];/*dbug-log*///console.log('hasParentEntity? [%s]. Entity = %s', details.indexOf(entity) !== -1, entity);
    return details.indexOf(entity) !== -1 ? 'source' : entity;
}
/* *********************** SERVER FIELD CONFG ******************************* */
/**
 * Returns the fields that need to be renamed and the entity they belong to.
 * A 'false' field will not be added to the final form data. An array of
 * fields will add the form value to each field for the specified entity.
 */
export function getFieldTranslations(entity) {                      /*dbug-log*///console.log('getFieldTranslaations [%s] ', entity)
    const fieldTrans = {
        // 'author': {
        //     'displayName': { 'source': 'displayName', 'author': 'displayName' },
        //     'website': { 'source': 'linkUrl' }
        // },
//         'citation': {
//             // 'authors': { 'source': false },
//             // 'contributor': { 'source': 'contributor' },
//             // 'citationText': { 'source': 'description', 'citation': 'fullText' },
//             // 'publication': { 'source': 'parentSource' },
//             'title': { 'source': 'displayName', 'citation': ['displayName', 'title'] },
// //TODO- MERGE WITH TITLE ABOVE            'chapterTitle': { 'source': 'displayName',
//                 'citation': ['displayName', 'title'] },
//             'volume': { 'citation': 'publicationVolume' },
//         //    'edition': { 'citation': 'publicationVolume' },
//             'issue': { 'citation': 'publicationIssue' },
//             'pages': { 'citation': 'publicationPages' },
//             // NOT NEEDED? 'reportType': { 'citation': 'subType' },
//             'website': { 'source': 'linkUrl' }
//             // 'tags': { 'source': 'tags' }
//         },
        // 'interaction': {
        //     'citationTitle': { 'interaction': 'source' },
        //     'country/Region': { 'interaction': false },
        //     'interactionTags': { 'interaction': 'tags' },
        //     'notes': { 'interaction': 'note' },
        //     'publication': { 'interaction': false }
        // },
        // 'location': {
        //     'country': { 'location': 'parentLoc' }
        // },
        'publication': {
            'authors': { 'source': false },
            'editors': { 'source': false },
            'contributor': { 'source': 'contributor' },
            // 'publisher': { 'source': 'parentSource' },
            // 'description': { 'source': 'description', 'publication': 'description' },
            // 'title': { 'source': 'displayName', 'publication': 'displayName' },
            // 'publisher/University': { 'source': 'parentSource' },
            // 'website': { 'source': 'linkUrl' }
        },
        // 'publisher': {
        //     'displayName': { 'source': 'displayName', 'publisher': 'displayName' },
        //     'website': { 'source': 'linkUrl' }
        // },
        // 'taxon': {
        //     'displayName': { 'taxon': 'name' }
        // }
    };
    return fieldTrans[entity] || {};
}
/**
 * Returns an array of fields that are relationships with other entities.
 * Note: use field names before field translations/renamings.
 */
export function getRelationshipFields(entity) {
    const relationships = {
        // 'author': ['sourceType'],
        // 'citation': ['citationType', 'contributor', 'publication'],
        // 'location': ['locationType', 'habitatType', 'country'],
        // 'publication': ['publicationType', 'contributor', 'publisher',
        //     'publisher/University'],
        // 'publisher': [],
        // 'taxon': ['rank', 'parentTaxon', 'group'],
        // 'interaction': ['citationTitle', 'location', 'subject', 'object',
        //     'interactionTags', 'interactionType' ]
    };
    // return relationships[entity];
}