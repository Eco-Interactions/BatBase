/**
 * Returns the form-config for the passed entity and current field-display (all|simple).
 * { *: default confg-properties returned
 *    core: entityName,
 *    *display: view, //Defaults to 'simple' display, if defined.
 *    *fields: {  //RETURNED VALUE IS views[display] MAPPED WITH EACH FIELD'S CONFG.
 *         //CORE.FIELDS AND TYPE.FIELDS WILL BE MERGED IN.
 *        FieldName: { //DisplayName
 *            class: "",
 *            combo: true, //set during input build to trigger selectize combobox init
 *            info: { intro: "", *tooltip: ""(req) },
 *            label: Field label text (Name-prop used if absent)
 *            *name: FieldName,  [REQUIRED]
 *            prop: { entityName: [propName, ...], ... } //server entity:prop when different than exactly formEntity:FieldName
 *            required: true, //Set if true
 *            *type: "",  [REQUIRED]
 *        }, ...
 *    },
 *    *group: top|sub|sub2, //SET DURING CONFG BUILD
 *    infoSteps: ##, //Count of fields with steps for the form tutorial, intro.js
 *    misc: {
 *        entityProp: value
 *    },
 *    *name: formName (entity or su|object)
 *    onInvalidInput: Fired when an input fails HTML validation  //TODO
 *    onValidInput: Fired after invalid input validates (perhaps merge with all checkReqFieldsAndToggleSubmitBttn calls?)  //TODO
 *    type: Type name, once selected. Only for entities with subTypes
 *    types: { //ENTITY SUB-TYPES
 *         Type name: {
 *              name: (req)
 *              [confg prop with type-data]
 *         }
 *    }
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
export function getFormConfg(fVals, entity, fLvl, showSimpleView = true) {/*dbug-log*/console.log('getFormConfg [%s][%s] fVals?[%O] showSimpleView?[%s]', fLvl, entity, fVals, showSimpleView);
    confg = getBaseConfg(getConfgName(entity), entity);             /*dbuglog*/console.log('   --baseConfg [%s][%O]', entity, _u('snapshot', [confg]));
    buildFormConfg(fVals, fLvl, showSimpleView);                    /*dbug-log*/console.log('   --formConfg [%s][%O]', entity, _u('snapshot', [confg]));
    removeUnneedConfg();
    _state('setFormProp', [fLvl, 'confg', confg]);
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
function getBaseConfg(name, entity) {                               /*dbuglog*/console.log('getBaseConfg [%s] for [%s]', name, entity);
    return require(`./entity/${name}-confg.js`).default(entity);
}
function buildFormConfg(fVals, fLvl, showSimpleView) {
    handleConfgMerges();
    confg.display = showSimpleView && confg.views.simple ? 'simple' : 'all';
    confg.group = fLvl;
    confg.fields = getDisplayedFieldConfgs(fVals);
    delete confg.views;
}
/* ====================== MERGE CONFG-DATA ================================== */
function handleConfgMerges() {                                      /*dbuglog*/console.log('handleConfgMerges confg[%O]', _u('snapshot', [confg]));
    mergeEntityTypeConfg();
    if (confg.core) { mergeCoreEntityConfg(confg); }
}
function mergeEntityTypeConfg(fLvl) {
    const type = _state('getFormProp', [fLvl, 'type']);            /*dbuglog*/console.log('mergeEntityTypeConfg type?[%s]', type);
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
    const cEntityConfg = getConfg(confg.core);                      /*dbuglog*/console.log('mergeCoreAndDetailConfgs confg[%O], cEntityConfg[%O]', views, cEntityConfg);
    mergeIntoFormConfg(confg, cEntityConfg);
}

/* ==================== BUILD CURRENT FIELD-CONFG =========================== */
/**
 * [getFieldsToDisplay description]
 * @return {[type]}        [description]
 */
function getDisplayedFieldConfgs(fVals) {                           /*dbuglog*/console.log("getDisplayedFieldConfgs confg[%O] vals?[%O]", confg, fVals);
    confg.infoSteps = 0;
    return confg.views[confg.display].map(getFieldConfgs);

    function getFieldConfgs(name) {                                 /*dbuglog*/console.log("getFieldConfg field[%s][%O]", name, confg.fields[name]);
        if (Array.isArray(name)) { return name.map(getFieldConfgs); }
        const fConfg = confg.fields[name];
        if (fConfg.info) { ++confg.infoSteps; }
        fConfg.class = getFieldClass(confg.group);
        fConfg.group = confg.group;
        fConfg.formName = confg.name;
        fConfg.pinnable = confg.pinnable || false;
        // if (fVals[name]) {  }
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


function removeUnneedConfg() {
    delete confg.views;
    delete confg.types;
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