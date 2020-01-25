/**
 * Formats the form data to send to server.
 *
 * Export default only.
 */
import * as _f from '../forms-main.js';

export default function(entity, fLvl, formVals) {                        
    if (entity === 'editor') { entity = 'author'; }
    return buildFormData(entity, formVals, fLvl);                               //console.log("formData = %O", formData);
}                
/**
 * Returns an object with the entity names' as keys for their field-val objects, 
 * which are grouped into flat data and related-entity data objects. 
 */
function buildFormData(entity, formVals, fLvl) { 
    var pEntity = _f.confg('getParentEntity', [entity]);                                  
    var parentFields = !pEntity || getParentFields(entity);                     //console.log("buildFormDataObj. [%s] pEntity = %s, formVals = %O, parentFields = %O", entity, pEntity, formVals, parentFields);
    var fieldTrans = _f.confg('getFieldTranslations', [entity]); 
    var rels = _f.confg('getRelationshipFields', [entity]);
    var data = buildFormDataObj();

    for (var field in formVals) { getFormFieldData(field, formVals[field]); }
    if (pEntity === "source") { handleDetailTypeField(); }                      //console.log("formData = %O", data);
    if (entity === "location") { handleGeoJson(); }
    return data;

    function buildFormDataObj() {
        var data = {};
        data[pEntity] = { flat: {}, rel: {} };
        data[entity] = { flat: {}, rel: {} };
        return data;
    }
    /** 
     * Adds the field's value to the appropriate entity's form data-group object. 
     * Field name translations are handled @addTransFormData. 
     */
    function getFormFieldData(field, val) {
        var dataGroup = rels.indexOf(field) !== -1 ? 'rel' : 'flat';
        if (field in fieldTrans) { addTransFormData(); 
        } else { addFormData(); }
        /** Renames the field and stores the value for each entity in the map. */
        function addTransFormData() {  
            var transMap = fieldTrans[field];
            for (var ent in transMap) { 
                addTransFieldData(data[ent][dataGroup], transMap[ent]); 
            }
        }
        /** Adds the value to formData, if the newField name isn't false. */
        function addTransFieldData(formData, newField) {
            if (newField === false) { return; }
            if (Array.isArray(newField)) {
                newField.forEach(fieldName => formData[fieldName] = val);
            } else { formData[newField] = val; }
        }
        /** Adds the field and value to the appropriate entity data-type object. */
        function addFormData() { 
            var ent = (pEntity && parentFields.indexOf(field) !== -1) ? pEntity : entity;
            data[ent][dataGroup][field] = val;
        }
    } /* End getFormFieldData */
    /**
     * If the form entity is a detail entity for a 'parent' entity (e.g. as citation
     * or author are to Source), that entity is added as the 'type' of it's parent and 
     * 'hasDetail' is added to trigger detail entity processing on the server.
     * Note: currently, only sources have detail entities.
     */
    function handleDetailTypeField() { 
        if (pEntity) {
            data[pEntity].rel[pEntity+'Type'] = entity; 
            data[pEntity].hasDetail = true;
        } 
    }
    /**
     * If the location has GPS data, a geoJson detail entity is added to the 
     * form data. If the location already has geoJson, coordinates are only 
     * overwritten if the type is 'Point'. Otherwise, (multi)polygon coords
     * would be overwritten. Once map editing is complete, this will be revised.
     */
    function handleGeoJson() {
        const editing = _f.state('getStateProp', ['editing']);
        if (!editing && (!formVals.latitude || !formVals.longitude)) { return; }
        const displayPoint = JSON.stringify([ formVals.longitude, formVals.latitude ]);
        data.geoJson = {
            flat: { 
                'displayPoint': displayPoint, 
                'coordinates': getCoords(displayPoint), 
                'locationName': formVals.displayName,
                'type': 'Point' },
            rel: {}
        };
        data.location.hasDetail = true;
    }
    function getCoords(displayPoint) {
        const geoJson = _f.state('getFormProp', ['top', 'geoJson']);
        const coords = !geoJson || geoJson.type === 'Point' ? 
            displayPoint : geoJson.coordinates;
    }
} /* End buildFormDataObj */
/** Returns an array of the parent entity's field names. */
function getParentFields(entity) {
    var parentFields = Object.keys(_f.confg('getCoreFieldDefs', [entity]));
    return  parentFields.map(function(field) {
        return _f.util('lcfirst', [field.split(' ').join('')]);
    });
}