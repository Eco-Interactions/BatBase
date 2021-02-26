/**
 * Returns the form-config for the passed entity and current field-display (all|simple).
 * { *: default confg-properties returned
 *    core: EntityName, ucfirst
 *    *display: view, //Defaults to 'simple' display, if defined.
 *    *fields: {
 *         //CORE.FIELDS AND TYPE.FIELDS WILL BE MERGED IN.
 *        FieldName: { //DisplayName
 *            class: "",
 *            combo: true, //set during input build to trigger selectize combobox init
 *            info: { intro: "", *tooltip: ""(req) },
 *            label: Field label text (Name-prop used if absent)
 *            *name: FieldName,  [REQUIRED]
 *            prep: funcNameString //prep data for server when different than exactly formEntity:FieldName
 *            //prop: { entityName: {propName: hdnlr, ...}, ... } //server entity:prop when different than exactly formEntity:FieldName
 *            required: true, //Set if true
 *            *type: "", null if field-data auto-derived [REQUIRED]
 *        }, ...
 *    },
 *    *group: top|sub|sub2, //SET DURING CONFG BUILD
 *    infoSteps: ##, //Count of fields with steps for the form tutorial, intro.js
 *    misc: {
 *        entityProp: value
 *    },
 *    *name: formName (entity or su|object) ucfirst
 *    onInvalidInput: Fired when an input fails HTML validation  //TODO
 *    onValidInput: Fired after invalid input validates (perhaps merge with all checkReqFieldsAndToggleSubmitBttn calls?)  //TODO
 *    prep: [], //server-data handled before form-submit
 *    type: Type name, once selected. Only for entities with subTypes
 *    types: { //ENTITY SUB-TYPES
 *         Type name: {
 *              name: (req)
 *              [confg prop with type-data]
 *         }
 *    },
 *    view: [] //RETURNED VALUE IS views[display] MAPPED WITH EACH FIELD'S CONFG.
 * }
 *
 * Export
 *     getFormConfg  (TODO: only exporting method for confg)
 *     getCoreFieldDefs
 *     getCoreEntity
 *     getFieldTranslations
 *     getCoreFormEntity
 *
 * TOC
 *     FORM CONFG
 *         MERGE CONFG-DATA
 *         BUILD CURRENT FIELD-CONFG
 *     //SERVER FIELD CONFG
 */
import { _u } from '~util';
import { _state } from '../forms-main.js';
import { mergeIntoFormConfg } from './util/merge-confgs.js';

let confg = null;

/* *************************** FORM CONFG *********************************** */
export function getFormConfg(entity, fLvl, showSimpleView = true) { /*dbug-log*/console.log('+--getFormConfg [%s][%s] showSimpleView?[%s]', fLvl, entity, showSimpleView);
    confg = getBaseConfg(getConfgName(entity), entity);             /*dbug-log*/console.log('   --baseConfg [%s][%O]', entity, _u('snapshot', [confg]));
    buildFormConfg(fLvl, showSimpleView);                           /*dbug-log*/console.log('   --formConfg [%s][%O]', entity, _u('snapshot', [confg]));
    return confg;
}
function getConfgName(entity) {
    const map = {
        subject: 'group',
        object: 'group',
        editor: 'author'
    };
    return map[entity] ? map[entity] : _u('lcfirst', [entity]);
}
/**
 * Base form-confg properties:
 * { *: required confg-properties
 *    core: entityName,
 *    *fields: {
 *         //CORE.FIELDS AND TYPE.FIELDS WILL BE MERGED IN.
 *        FieldName: { //DisplayName
 *            info: { intro: "", *tooltip: ""(req) },
 *            label: Field label text (Name-prop used if absent)
 *            *name: FieldName,  [REQUIRED]
 *            prop: { entityName: [propName, ...], ... } //server entity:prop when different than exactly formEntity:FieldName
 *            required: true, //Set if true
 *            *type: "",  [REQUIRED]
 *        }, ...
 *    },
 *    misc: {
 *        entityProp: value
 *    },
 *    *name: formName (entity or su|object)
 *    types: { //ENTITY SUB-TYPES
 *         Type name: {
 *              name: (req)
 *              [confg prop with type-data]
 *         }
 *    },
 *    views: { //fields will be built and displayed according to the view
 *       *all:   [ FullRowFieldName, [FieldName, SecondFieldInRow, ...], ...] [REQUIRED]
 *       simple: [ ...SameFormat ]
 *    }
 * }
 *
 *
 * @param  {[type]} name    [description]
 * @param  {[type]} entity) {                                          console.log('getBaseConfg [%s] for [%s]', name, entity [description]
 * @return {[type]}         [description]
 */
function getBaseConfg(name, entity) {                               /*dbug-log*/console.log('getBaseConfg [%s] for [%s]', name, entity);
    return require(`./entity/${name}-confg.js`).default(entity);
}
function buildFormConfg(fLvl, showSimpleView) {
    if (confg.core) { mergeCoreEntityConfg(confg); }
    confg.display = showSimpleView && confg.views.simple ? 'simple' : 'all';
    confg.group = fLvl;
    confg.view = getDisplayedFieldConfgs();
}
/* ====================== MERGE CONFG-DATA ================================== */
export function mergeEntityTypeConfg(fLvl) {
    const type = _state('getFormState', [fLvl, 'type']);            /*dbug-log*/console.log('mergeEntityTypeConfg type?[%s]', type);
    if (!type) { return; }
    // merge core into types and then into form confg. (handles view concat)
    mergeIntoFormConfg(confg, confg.types[type]);
}
/**
 * [mergeCoreAndDetailConfgs description]
 * @param  {[type]} confg [description]
 * @return {[type]}        [description]
 */
function mergeCoreEntityConfg(confg) {
    const cEntityConfg = getBaseConfg(confg.core);                   /*dbug-log*/console.log('mergeCoreAndDetailConfgs confg[%O], cEntityConfg[%O]', confg, cEntityConfg);
    mergeIntoFormConfg(confg, cEntityConfg);
}

/* ==================== BUILD CURRENT FIELD-CONFG =========================== */
/**
 * [getFieldsToDisplay description]
 * @return {[type]}        [description]
 */
function getDisplayedFieldConfgs() {                                /*dbug-log*/console.log("getDisplayedFieldConfgs confg[%O]", confg);
    confg.infoSteps = 0;
    return confg.views[confg.display].map(getFieldConfgs);

    function getFieldConfgs(name) {                                 /*dbug-log*/console.log("getFieldConfg field[%s][%O]", name, confg.fields[name]);
        if (Array.isArray(name)) { return name.map(getFieldConfgs); }
        const fConfg = confg.fields[name];
        if (fConfg.info) { ++confg.infoSteps; }
        fConfg.class = getFieldClass(confg.group);
        fConfg.group = confg.group;
        fConfg.formName = confg.name;
        fConfg.pinnable = confg.pinnable || false;
        return fConfg;
    }
}
function getFieldClass(fLvl) {
    return {
        top: 'lrg-field',
        sub: 'med-field',
        sub2: 'med-field'
    }[fLvl];
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
    };                                                              /*dbug-log*/console.log('getCoreFieldDefs entity[%s] core?[%s]', entity, coreEntityMap[entity]);
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
    };                                                              /*dbug-log*/console.log('fields = %O', fields[coreEntityMap[entity]]);
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
    const details = ['author', 'citation', 'publication', 'publisher'];/*dbug-log*/console.log('hasParentEntity? [%s]. Entity = %s', details.indexOf(entity) !== -1, entity);
    return details.indexOf(entity) !== -1 ? 'source' : entity;
}
/* *********************** SERVER FIELD CONFG ******************************* */
/**
 * Returns the fields that need to be renamed and the entity they belong to.
 * A 'false' field will not be added to the final form data. An array of
 * fields will add the form value to each field for the specified entity.
 */
export function getFieldTranslations(entity) {                      /*dbug-log*/console.log('getFieldTranslaations [%s] ', entity)
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