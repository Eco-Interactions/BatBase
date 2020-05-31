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
    const cEntity = _f.confg('getCoreEntity', [entity]);                                  
    const data = buildBaseFormDataObj({});
    if (cEntity !== entity) { addDetailTypeData(); }                      //console.log("formData = %O", data);
    addDirectFormFieldData(entity, formVals, cEntity, data);
    addAllRemainingData(entity, formVals, data);
    return data;

    function buildBaseFormDataObj(data) {
        data[cEntity] = { flat: {}, rel: {} };
        data[entity] = { flat: {}, rel: {} };
        return data;
    }
    /**
     * If the form entity is a detail entity for a 'parent' entity (e.g. as citation
     * or author are to Source), that entity is added as the 'type' of it's parent and 
     * 'hasDetail' is added to trigger detail entity processing on the server.
     * Note: currently, only sources have detail entities.
     */
    function addDetailTypeData() { 
        data[cEntity].rel[cEntity+'Type'] = entity; 
        data[cEntity].hasDetail = true;
    }
} /* End buildFormData */
function addDirectFormFieldData(entity, formVals, cEntity, data) {
    const fieldTrans = _f.confg('getFieldTranslations', [entity]); 
    const rels = _f.confg('getRelationshipFields', [entity]);
    const parentFields = !cEntity || getParentFields(entity);                     //console.log("buildFormDataObj. [%s] cEntity = %s, formVals = %O, parentFields = %O", entity, cEntity, formVals, parentFields);
    for (let field in formVals) { getFormFieldData(field, formVals[field]); }
    
    /** 
     * Adds the field's value to the appropriate entity's form data-group object. 
     * Field name translations are handled @addTransFormData. 
     */
    function getFormFieldData(field, val) {
        const dataGroup = rels.indexOf(field) !== -1 ? 'rel' : 'flat';
        if (field in fieldTrans) { addDataWithRenamedField(); 
        } else { addFieldData(); }
        /** Renames the field and stores the value for each entity in the map. */
        function addDataWithRenamedField() {  
            const transMap = fieldTrans[field];
            for (let ent in transMap) { 
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
        function addFieldData() { 
            const ent = (cEntity && parentFields.indexOf(field) !== -1) ? cEntity : entity;
            data[ent][dataGroup][field] = val;
        }
    } /* End getFormFieldData */
}
function addAllRemainingData(entity, formVals, data) { 
    const addEntityData = {
        'location': addGeoJson, 'taxon': addTaxonDisplayName, 
        'interaction': ifNoLocationAssignedToUnspecified
    };
    return addEntityData[entity] ? addEntityData[entity]() : {};
    /**
     * If the location has GPS data, a geoJson detail entity is added to the 
     * form data. If the location already has geoJson, coordinates are only 
     * overwritten if the type is 'Point'. Otherwise, (multi)polygon coords
     * would be overwritten. Once map editing is complete, this will be revised.
     */
    function addGeoJson() {
        const editing = _f.state('getStateProp', ['editing']);
        if (!editing && (!formVals.latitude || !formVals.longitude)) { return; }
        const displayPoint = JSON.stringify([ formVals.longitude, formVals.latitude ]);
        data.geoJson = {
            flat: { 
                'displayPoint': displayPoint, 
                'coordinates': editing ? getGeoJsonCoords() : displayPoint,
                'type': 'Point' 
            },
            rel: {}
        };
        data.location.hasDetail = true;
        delete data.false;
        
        function getGeoJsonCoords() {
            const geoJson = _f.state('getFormProp', ['top', 'geoJson']);
            return geoJson ? geoJson.coordinates : displayPoint;
        }
    }
    function addTaxonDisplayName() {                        
        const isSpecies = formVals.level == 'Species';
        data.taxon.flat.displayName = isSpecies ? formVals.displayName : 
            formVals.level + ' ' + formVals.displayName;
    }
    function ifNoLocationAssignedToUnspecified() {
        formVals.location = formVals.location || 439; //Unspecified region
    }
}
/** Returns an array of the parent entity's field names. */
function getParentFields(entity) {
    const parentFields = Object.keys(_f.confg('getCoreFieldDefs', [entity]));
    return parentFields.map(field => _f.util('lcfirst', [field.split(' ').join('')]));
}