(function(){
    const eif = ECO_INT_FMWK;
    const _util = eif.util;
    let failed = { errors: [], updates: {}};
    eif.syncData = {
        update: updateStoredData,
        reset: resetStoredData
    };

    getServerDataLastUpdatedTimes();
    /** Gets an object with the lastUpdated datetimes for the system and each entity class.*/
    function getServerDataLastUpdatedTimes() {
        sendAjaxQuery({}, "ajax/data-state", storeDataUpdatedTimes);
    }
    /** Stores the datetime object. Checks for updated data @addNewDataToStorage. */
    function storeDataUpdatedTimes(ajaxData) {
        storeData('dataUpdatedAt', ajaxData.dataState);                         console.log("dataState = %O", ajaxData.dataState);
        addNewDataToStorage(ajaxData.dataState);
    }
    /** Returns the current date time in the format: Y-m-d H:i:s */
    function getCurrentDate() {
        return new Date().today() + " " + new Date().timeNow();
    }
/*-------------- Stored Data Methods -----------------------------------------*/
    /*------------------ Page Load Data Sync ---------------------------------*/
    /**
     * On search page load, the system updatedAt flag is compared against the page's. 
     * If there they system data has updates more recent than the last sync, the 
     * updated data is ajaxed and stored @syncUpdatedData. 
     * On a browser's first visit to the page, all data is downloaded and the 
     * search page ui is initialized @initStoredData.
     */
    function addNewDataToStorage(dataUpdatedAt) {  
        var pgUpdatedAt = _util.getDataFromStorage('pgDataUpdatedAt');          console.log("pgUpdatedAt = [%s], sysUpdatedAt = [%s]", pgUpdatedAt, dataUpdatedAt.System);
        if (!pgUpdatedAt) { return initStoredData(); } 
        if (!firstTimeIsMoreRecent(dataUpdatedAt.System, pgUpdatedAt)) { console.log("Data up to date.");return; }
        delete dataUpdatedAt.System;  //System updatedAt is no longer needed.
        syncUpdatedData(dataUpdatedAt, pgUpdatedAt);
    }
    /**
     * Returns true if the first datetime is more recent than the second. 
     * Note: for cross-browser date comparisson, dashes must be replaced with slashes.
     */
    function firstTimeIsMoreRecent(timeOne, timeTwo) {  
        var time1 = timeOne.replace(/-/g,'/');  
        var time2 = timeTwo.replace(/-/g,'/');                                  //console.log("firstTimeMoreRecent? ", Date.parse(time1) > Date.parse(time2))
        return Date.parse(time1) > Date.parse(time2);
    }
    /** Filter updatedAt entities and send those with updates to @ajaxNewData. */
    function syncUpdatedData(updatedAt, pgUpdatedAt) {                          console.log("Synching data updated since - ", pgUpdatedAt);
        var withUpdates = Object.keys(updatedAt).filter(function(entity){
            return firstTimeIsMoreRecent(updatedAt[entity], pgUpdatedAt);
        });                                                                     console.log("entities with updates = %O", JSON.parse(JSON.stringify(withUpdates)));
        if (!withUpdates) { console.log("No updated entities found when system flagged as updated."); return; }
        ajaxNewData(withUpdates, pgUpdatedAt);
    }
    /** 
     * Sends an ajax call for each entity with updates. On return, the new data 
     * is stored @processUpdatedData. Interactions are sent after all other entity
     * updates. Finally, any failed updates are retried and then the search page 
     * is reloaded.
     * TODO: Add 'fail' callback for server errors. Send back any errors and 
     * describe them to the user. 
     */ 
    function ajaxNewData(entities, lastUpdated) { 
        const ints = entities.indexOf('Interaction') !== -1 ?  
            entities.splice(entities.indexOf('Interaction'), 1) : false;    
        const promises = entities.map(e => getNewData(e)); 
        $.when(...promises).then(processUpdatedData).then(updateInteractions)
            .done(retryFailedUpdatesAndLoadGrid);
         
        function getNewData(entity, func) {                                     //console.log('getting new data for ', entity); 
            let data = { entity: entity, updatedAt: lastUpdated }; 
            const hndlr = func || null;
            return sendAjaxQuery(data, "ajax/sync-data", hndlr); 
        } 
        function updateInteractions() {                                         
            return ints ? getNewData('Interaction', processUpdatedEntityData) : null;
        }
    } /* End ajaxNewData */ 
    /** Sends each entity's ajax return to be processed and stored. */
    function processUpdatedData() {    
        if (arguments[1] === "success") { return processUpdatedEntityData(...arguments); }
        for (let data in arguments) { 
            processUpdatedEntityData(arguments[data][0]);
        }
    } 
    /** Parses and sends the returned data to @storeUpdatedData. */ 
    function processUpdatedEntityData() { 
        const results = arguments[0]; 
        const entity = Object.keys(results)[0];                                 console.log("[%s] data returned from server = %O", entity, results); 
        const data = parseData(results[entity]); 
        storeUpdatedData(data, entity); 
    }
    /** Sends the each updated record to the update handler for the entity. */ 
    function storeUpdatedData(rcrds, entity) { 
        const coreEntities = ['Interaction', 'Location', 'Source', 'Taxon']; 
        const entityHndlr = coreEntities.indexOf(entity) !== -1 ?  
            addCoreEntityData : addDetailEntityData; 
        for (let id in rcrds) { 
            entityHndlr(_util.lcfirst(entity), rcrds[id]); 
        } 
    } 
    /** Stores interaction data and inits the search-page grid.*/ 
    function storeDataAndRetryFailedUpdates(results) { 
        processUpdatedData(results); 
        retryFailedUpdatesAndLoadGrid();
    } 
    function retryFailedUpdatesAndLoadGrid() {                                  console.log('retryFailedUpdatesAndLoadGrid')
        retryFailedUpdates();
        initSearchGrid(); //TODO: send errors during init update to search page and show error message to user.
    }
    /**
     * Updates the stored data's updatedAt flag, and initializes the search-page 
     * grid with the updated data @eif.search.initSearchGrid. 
     */
    function initSearchGrid() {                                                 console.log('Finished updating! Loading search grid.')
        storeData('pgDataUpdatedAt', getCurrentDate()); 
        eif.search.initSearchGrid(); 
    }
    /*------------------ Update Submitted Form Data --------------------------*/
    /**
     * On crud-form submit success, the returned data is added to, or updated in, 
     * all relevant stored data @updateEntityData. The stored data's lastUpdated 
     * flag, 'pgDataUpdatedAt', is updated. 
     */
    function updateStoredData(data) {                                           console.log("updateStoredData data recieved = %O", data);
        updateEntityData(data);
        storeData('pgDataUpdatedAt', getCurrentDate());                         //console.log('pgDataUpdatedAt = ', getCurrentDate())
        retryFailedUpdates();
        sendDataUpdateStatus(data);
    }
    function sendDataUpdateStatus(data) {                                       //console.log('sendDataUpdateStatus. data = %O, errs = %O', data, failed.errors);  
        const errs = failed.errors;  
        const msg = errs.length ? errs[0][0] : null;
        const tag = errs.length ? errs[0][1] : null;
        data.errors = errs.length ? errs : false;
        eif.form.dataSynced(data, msg, tag);
    }
    /** Stores both core and detail entity data, and updates data affected by edits. */
    function updateEntityData(data) {
        addCoreEntityData(data.core, data.coreEntity);
        if (data.detailEntity) { 
            addDetailEntityData(data.detail, data.detailEntity);
        }
        updateAffectedData(data);
    }
    /*------------------ Add-to-Storage Methods ------------------------------*/
    /** Updates stored-data props related to a core-entity record with new data. */
    function addCoreEntityData(entity, rcrd) {                                  //console.log("Updating Core entity. %s. %O", entity, rcrd);
        var propHndlrs = getAddDataHndlrs(entity, rcrd);
        updateDataProps(propHndlrs, entity, rcrd);
        updateCoreData(entity, rcrd);
    }
    /** Returns an object of related data properties and their update methods. */
    function getAddDataHndlrs(entity, rcrd) {
        var type = getEntityType(entity, rcrd);                                 //console.log("type = ", type);
        var update = {
            'source': {
                'author': { 'authSrcs': addToRcrdAryProp },
                'citation': { 'authors': addContribData, 'source': addToParentRcrd,
                    'tag': addToTagProp },
                'publication': { 'pubSrcs': addToRcrdAryProp, 'authors': addContribData, 
                    'source': addToParentRcrd, 'editors': addContribData },
                'publisher': { 'publSrcs': addToRcrdAryProp },

            },
            'interaction': {
                'location': addInteractionToEntity, 'source': addInteractionToEntity, 
                'subject': addInteractionRole, 'object': addInteractionRole, 
                'interactionType': addToTypeProp, 'tag': addToTagProp
            },
            'location': {
                'location': addToParentRcrd, 'habitatType': addToTypeProp, 
                'locationType': addToTypeProp
            },
            'taxon': { 'taxon': addToParentRcrd, 'taxonNames': addToTaxonNames 
            },
        };
        return type ? update[entity][type] : update[entity];
    }
    /** 
     * Returns the record's entity'Type' for entities with stored data related to 
     * a 'type'. Eg, the sourceTypes author, publication, etc.
     */
    function getEntityType(entity, rcrd) {
        if (entity === "source") { return getSourceType(entity, rcrd); }
        return false;
    }
    /** Returns the records source-type. */
    function getSourceType(entity, rcrd) {
        var type = _util.lcfirst(entity)+"Type";
        return _util.lcfirst(rcrd[type].displayName);
    }
    /** Sends entity-record data to each storage property-type handler. */
    function updateDataProps(propHndlrs, entity, rcrd) {                        //console.log("updateDataProps %O. [%s]. %O", propHndlrs, entity, rcrd);
        var params = { entity: entity, rcrd: rcrd, stage: 'addData' };
        for (var prop in propHndlrs) {
            updateData(propHndlrs[prop], prop, params);
        }
    }
    /** 
     * Updates the stored core-records array and the stored entityType array. 
     * Note: Taxa are the only core entity without 'types'.
     */
    function updateCoreData(entity, rcrd) {                                     //console.log("Updating [%s] Core data", entity);
        addToRcrdProp(entity, rcrd);
        if (entity === "taxon") { return; }
        addToTypeProp(entity+"Type", rcrd, entity); 
    } 
    /** Updates stored-data props related to a detail-entity record with new data. */
    function addDetailEntityData(entity, rcrd) {                                //console.log("Updating Detail entity. %s. %O", entity, rcrd);
        var update = {
            'author': { 'author': addToRcrdProp },
            'citation': { 'citation': addToRcrdProp }, //Not currently necessary to add to citation type object.
            'publication': { 'publication': addToRcrdProp, 'publicationType': addToTypeProp },
            'publisher': { 'publisher': addToRcrdProp } 
        };
        updateDataProps(update[entity], entity, rcrd)
    }
    /** Add the new record to the prop's stored records object.  */
    function addToRcrdProp(prop, rcrd, entity) {  
        var rcrdObj = _util.getDataFromStorage(prop);                           //console.log("addToRcrdProp. [%s] = %O. rcrd = %O", prop, rcrdObj, rcrd);
        rcrdObj[rcrd.id] = rcrd;
        storeData(prop, rcrdObj);
    }
    /** Add the new record to the prop's stored records object.  */
    function addToRcrdAryProp(prop, rcrd, entity) {  
        var rcrdAry = _util.getDataFromStorage(prop);                           //console.log("addToRcrdAryProp. [%s] = %O. rcrd = %O", prop, rcrdAry, rcrd);
        addIfNewRcrd(rcrdAry, rcrd.id);
        storeData(prop, rcrdAry);
    }
    /** Add the new entity's display name and id to the prop's stored names object.  */
    function addToNameProp(prop, rcrd, entity) {
        var nameObj = _util.getDataFromStorage(prop);                           //console.log("addToNameProp. [%s] = %O. rcrd = %O", prop, nameObj, rcrd);
        nameObj[rcrd.displayName] = rcrd.id;
        storeData(prop, nameObj);
    }
    /** Add the new record's id to the entity-type's stored id array.  */
    function addToTypeProp(prop, rcrd, entity) {
        var typeObj = _util.getDataFromStorage(prop);                           //console.log("addToTypeProp. [%s] = %O. rcrd = %O", prop, typeObj, rcrd);
        var typeId = rcrd[prop] ? rcrd[prop].id : false;
        if (!typeId) { return; }
        typeObj[typeId][entity+'s'].push(rcrd.id);
        storeData(prop, typeObj);
    }
    function addIfNewRcrd(ary, id) {
        if (ary.indexOf(id) === -1) { ary.push(id); }                           //console.log("Pushing id %s to array.", id);
    }
    /** Adds a new child record's id to it's parent's 'children' array. */ 
    function addToParentRcrd(prop, rcrd, entity) {                              
        if (!rcrd.parent) { return; }
        var parentObj = _util.getDataFromStorage(prop);                         //console.log("addToParentRcrd. [%s] = %O. rcrd = %O", prop, parentObj, rcrd);
        var parent = parentObj[rcrd.parent];
        addIfNewRcrd(parent.children, rcrd.id);
        storeData(prop, parentObj);
    }
    /** Adds a new tagged record to the tag's array of record ids. */
    function addToTagProp(prop, rcrd, entity) {                                 
        if (rcrd.tags.length > 0) {
            var tagObj = _util.getDataFromStorage(prop);                        //console.log("addToTagProp. [%s] = %O. rcrd = %O", prop, tagObj, rcrd);
            rcrd.tags.forEach(function(tag){
                addIfNewRcrd(tagObj[tag.id][entity+'s'], rcrd.id);                
            });
        }
    }
    /** Adds the Taxon's name to the stored names for it's realm and level.  */
    function addToTaxonNames(prop, rcrd, entity) {
        const realm = rcrd.realm.displayName;
        const level = rcrd.level.displayName;  
        addPropIfNewLevel(level, realm);
        addToNameProp(realm+level+"Names", rcrd, entity);
    }
    /** Creates the level property if no taxa have been saved at this level and realm.  */
    function addPropIfNewLevel(level, realm) {
        var lvlObj = _util.getDataFromStorage(realm+level+"Names");
        if (lvlObj) { return; }                                                 //console.log("creating new level for [", realm+level+"]Names")
        storeData(realm+level+"Names", {});
    }
    /** Adds the Interaction to the stored entity's collection.  */
    function addInteractionToEntity(prop, rcrd, entity) {
        if (!rcrd[prop]) {return;}
        var rcrds = _util.getDataFromStorage(prop);                             //console.log("addInteractionToEntity. [%s] = %O. rcrd = %O", prop, rcrds, rcrd);
        var storedEntity = rcrds[rcrd[prop]];
        addIfNewRcrd(storedEntity.interactions, rcrd.id);
        if (prop === 'source') { storedEntity.isDirect = true; }
        storeData(prop, rcrds);
    }
    /** Adds the Interaction to the taxon's subject/objectRole collection.  */
    function addInteractionRole(prop, rcrd, entity) {  
        var taxa = _util.getDataFromStorage("taxon");                           //console.log("addInteractionRole. [%s] = %O. taxa = %O", prop, taxa, rcrd);
        var taxon = taxa[rcrd[prop]];
        addIfNewRcrd(taxon[prop+"Roles"], rcrd.id);
        storeData("taxon", taxa);        
    }
    /** When a Publication/Citation has been updated, add new author contributions. */
    function addContribData(prop, rcrd, entity) {                               //console.log("-----addContribData. [%s] [%s]. rcrd = %O", prop, entity, rcrd);
        if (!rcrd[prop]) { return; }
        const srcObj = _util.getDataFromStorage('source');
        for (let ord in rcrd[prop]) {
            let authId = rcrd[prop][ord];
            addIfNewRcrd(srcObj[authId].contributions, rcrd.id);
        }
        storeData('source', srcObj);
    }
    /*------------ Remove-from-Storage Methods -------------------------------*/
    /** Updates any stored data that was affected during editing. */
    function updateAffectedData(data) {                                         //console.log("updateAffectedData called. data = %O", data);
        if (data.coreEdits && hasEdits(data.coreEdits)) { 
            updateAffectedDataProps(data.core, data.coreEntity, data.coreEdits);
        }
        if (data.detailEdits && hasEdits(data.detailEdits)) { 
            updateAffectedDataProps(data.detail, data.detailEntity, data.detailEdits);
        }
    }
    function hasEdits(editObj) {
        return Object.keys(editObj).length > 0;
    }
    /** Updates relational storage props for the entity. */
    function updateAffectedDataProps(entity, rcrd, edits) {                     //console.log("updateAffectedDataProps called for [%s]. edits = %O", entity, edits);
        var propHndlrs = getRmvDataPropHndlrs(entity);
        var params = { entity: entity, rcrd: rcrd, stage: 'rmvData' };
        for (var prop in edits) {                                               
            if (prop in propHndlrs) {
                updateData(propHndlrs[prop], prop, params, edits);
            }
        }
    }
    /** Returns an object with relational properties and their removal handlers. */
    function getRmvDataPropHndlrs(entity) {
        var hndlrs = {
            'author': {},
            'citation': { 'citationType': rmvFromTypeProp,  },
            'interaction': {
                'location': rmvIntFromEntity, 'source': rmvIntFromEntity, 
                'subject': rmvIntFromTaxon, 'object': rmvIntFromTaxon, 
                'interactionType': rmvFromTypeProp, 'tag': rmvFromTagProp },
            'publication': { 'publicationType': rmvFromTypeProp },
            'publisher': {},
            'location': { 'parentLoc': rmvFromParent, 'locationType': rmvFromTypeProp  },
            'source': { 'contributor': rmvContrib, 'parentSource': rmvFromParent, 
                'tag': rmvFromTagProp },
            'taxon': { 'parentTaxon': rmvFromParent, 'level': rmvFromNameProp }
        }
        return hndlrs[entity];
    }
    /** Removes the id from the ary. */
    function rmvIdFromAry(ary, id) {
        ary.splice(ary.indexOf(id), 1);  
    }
    /** Removes a record's id from the previous parent's 'children' array. */ 
    function rmvFromParent(prop, rcrd, entity, edits) {  
        if (!edits[prop].old) { return; }
        var rcrds = _util.getDataFromStorage(entity);                           //console.log("rmvFromParent. [%s] = %O. rcrd = %O", prop, rcrds, rcrd);  
        rmvIdFromAry(rcrds[edits[prop].old].children, rcrd.id);                
        storeData(entity, rcrds);
    }
    /** Removes the Interaction from the stored entity's collection. */
    function rmvIntFromEntity(prop, rcrd, entity, edits) {   
        var rcrds = _util.getDataFromStorage(prop);                             //console.log("rmvIntFromEntity. [%s] = %O. rcrd = %O, edits = %O", prop, rcrds, rcrd, edits);
        var storedEntity = rcrds[edits[prop].old];
        rmvIdFromAry(storedEntity.interactions, rcrd.id);
        storeData(prop, rcrds);
    }
    /** Removes the Interaction from the taxon's subject/objectRole collection. */
    function rmvIntFromTaxon(prop, rcrd, entity, edits) {  
        var taxa = _util.getDataFromStorage("taxon");                           //console.log("rmvIntFromTaxon. [%s] = %O. taxa = %O", prop, taxa, rcrd);
        var taxon = taxa[edits[prop].old];   
        rmvIdFromAry(taxon[prop+"Roles"], rcrd.id);
        storeData("taxon", taxa);           
    }
    /** Removes the record from the entity-type's stored array. */
    function rmvFromTypeProp(prop, rcrd, entity, edits) { 
        if (!edits[prop].old) { return; }
        var typeObj = _util.getDataFromStorage(prop);                           //console.log("rmvFromTypeProp. [%s] = %O. rcrd = %O", prop, typeObj, rcrd);
        var type = typeObj[edits[prop].old];
        rmvIdFromAry(type[entity+'s'], rcrd.id);
        storeData(prop, typeObj);
    }
    /** Removes a record from the tag's array of record ids. */
    function rmvFromTagProp(prop, rcrd, entity, edits) {                                 
        if (!edits.tag.removed) { return; }
        var tagObj = _util.getDataFromStorage(prop);                            //console.log("rmvFromTagProp. [%s] = %O. rcrd = %O", prop, tagObj, rcrd);
        edits.tag.removed.forEach(function(tagId){
            rmvIdFromAry(tagObj[tagId][entity+'s'], rcrd.id);                
        });
        storeData(prop, tagObj);
    }
    function rmvContrib(prop, rcrd, entity, edits) {                            //console.log("rmvContrib. edits = %O. rcrd = %O", edits, rcrd)
        const srcObj = _util.getDataFromStorage('source');
        edits.contributor.removed.forEach(id => 
            rmvIdFromAry(srcObj[id].contributions, rcrd.id));
        storeData('source', srcObj);
    }
    function rmvFromNameProp(prop, rcrd, entity, edits) { 
        var lvls = ["Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species"];
        var realm = rcrd.realm.displayName;
        var level = lvls[edits.level.old-1];
        var taxonName = edits.displayName ? edits.displayName.old : rcrd.displayName;
        var nameObj = _util.getDataFromStorage(realm+level+'Names');            //console.log("nameObj [%s] = %O, rcrd = %O, edits = %O",realm+level+'Names', nameObj, rcrd, edits)
        delete nameObj[taxonName];
        storeData(realm+level+'Names', nameObj);
    }
/*------------------ Init Stored Data Methods --------------------------------*/
    /** When there is an error while storing data, all data is redownloaded. */
    function resetStoredData() {
        const prevFocus = window.localStorage.getItem('curFocus');
        window.localStorage.clear();
        ajaxAndStoreAllEntityData();
        eif.search.handleReset(prevFocus);
    }
    /**
     * The first time a browser visits the search page all entity data is downloaded
     * from the server and stored locally @ajaxAndStoreAllEntityData. The stored 
     * data's lastUpdated flag, 'pgDataUpdatedAt', is created. A data-loading 
     * popup message and intro-walkthrough are shown on the Search page @initSearchPage.
     */
    function initStoredData() {
        ajaxAndStoreAllEntityData();
        eif.search.initSearchPage();
    }
    /**
     * The first time a browser visits the search page all entity data is downloaded
     * from the server and stored locally @storeEntityData. The stored data's 
     * lastUpdated flag, 'pgDataUpdatedAt', is created. Then the Search page 
     * grid-build begins @eif.search.initSearchGrid.
     * Entities downloaded with each ajax call:
     *   /taxon - Taxon, Realm, Level 
     *   /location - HabitatType, Location, LocationType, 'noLocIntIds' 
     *   /source - Author, Citation, CitationType, Publication, PublicationType, 
     *       Source, SourceType, Tag
     *   /interaction - Interaction, InteractionType  
     */
    function ajaxAndStoreAllEntityData() {                                      console.log("ajaxAndStoreAllEntityData");
        $.when(
            $.ajax("ajax/taxon"), $.ajax("ajax/location"), 
            $.ajax("ajax/source"), $.ajax("ajax/interaction")
        ).then(function(a1, a2, a3, a4) {                                       console.log("Ajax success: a1 = %O, a2 = %O, a3 = %O, a4 = %O", a1, a2, a3, a4) 
            $.each([a1, a2, a3, a4], function(idx, a) { storeServerData(a[0]); });
            deriveAndStoreData([a1[0], a2[0], a3[0], a4[0]]);
            storeData('pgDataUpdatedAt', getCurrentDate());
            eif.search.initSearchGrid();
        });
    }
    /**
     * Loops through the data object returned from the server, parsing and storing
     * the entity data.
     */
    function storeServerData(data) {                                            //console.log("data received = %O", data);
        for (let entity in data) {                                              //console.log("entity = %s, data = %O", entity, rcrdData);
            storeData(entity, parseData(data[entity]));
        }
    }
    /**
     * Loops through the passed data object to parse the nested objects. This is 
     * because the data comes back from the server having been double JSON-encoded,
     * due to the 'serialize' library and the JSONResponse object. 
     */
    function parseData(data) {
        for (var id in data) { data[id] = JSON.parse(data[id]); }
        return data;
    }
    /** Adds the data derived from the serialized entity data to data storage. */
    function deriveAndStoreData(data) {
        deriveAndStoreTaxonData(data[0]);
        deriveAndStoreLocationData(data[1]);
        deriveAndStoreSourceData(data[2]);
        deriveInteractionData(data[3]);
    }
    /** Stores an object of taxon names and ids for each level in each realm. */
    function deriveAndStoreTaxonData(data) {                                    //console.log("deriveAndStoreTaxonData called. data = %O", data);
        storeData('levelNames', getNameDataObj(Object.keys(data.level), data.level));
        storeData('objectRealmNames', getObjectRealmNames(data.realm));
        storeTaxaByLevelAndRealm(data.taxon);
    }
    function getObjectRealmNames(realms) {                                      //console.log('getObjectRealmNames. [%s] realms = %O',Object.keys(realms).length, realms);
        let data = {};
        for (let i=1; i <= Object.keys(realms).length; i++) { 
            if (realms[i].displayName === 'Bat') { continue; }  
            data[realms[i].displayName] = realms[i].id;
        }
        return data;
    }
    function storeTaxaByLevelAndRealm(taxa) {
        var realmData = separateTaxaByLevelAndRealm(taxa);                      //console.log("taxonym name data = %O", nameData);
        for (var realm in realmData) {  
            storeTaxaByLvl(realm, realmData[realm]);
        }
    }
    function storeTaxaByLvl(realm, taxonObj) {
        for (var level in taxonObj) {                                           //console.log("storing as [%s] = %O", realm+level+'Names', taxonObj[level]);
            storeData(realm+level+'Names', taxonObj[level]);
        }
    }
    /** Each taxon is sorted by realm and then level. 'Animalia' is skipped. */
    function separateTaxaByLevelAndRealm(taxa) {  
        const data = { "Bat": {}, "Plant": {}, "Arthropod": {} };
        for (let id = 1; id <= Object.keys(taxa).length; id++) {
            if (undefined == taxa[id] || 'animalia' == taxa[id].slug) { continue; }
            addTaxonData(taxa[id]);
        }
        return data;
        /** Adds the taxon's name (k) and id to it's level's obj. */
        function addTaxonData(taxon) {
            const realmObj = getRealmObj(taxon);
            const level = taxon.level.displayName;  
            if (!realmObj[level]) { realmObj[level] = {}; }; 
            realmObj[level][taxon.displayName] = taxon.id;
        }
        function getRealmObj(taxon) {
            const realm = taxon.realm.displayName
            const key = realm === 'Animalia' ? 'Bat' : realm;
            return data[key];
        }
    } /* End separateTaxaByLevelAndRealm */
    /** [entity]Names - an object with each entity's displayName(k) and id. */
    function deriveAndStoreLocationData(data) {                                 //console.log('loc data to store = %O', data);
        const regns = getTypeObj(data.locationType, 'region', 'locations');
        const cntrys = getTypeObj(data.locationType, 'country', 'locations');   //console.log('reg = %O, cntry = %O', regns, cntrys);
        storeData('countryNames', getNameDataObj(cntrys, data.location));
        storeData('regionNames', getNameDataObj(regns, data.location));
        storeData('topRegionNames', getTopRegionNameData(data, regns));
        storeData('habTypeNames', getTypeNameData(data.habitatType));
        storeData('locTypeNames', getTypeNameData(data.locationType));
    }
    function getTopRegionNameData(locData, regns) {  
        const data = {};
        const rcrds = getEntityRcrds(regns, locData.location);
        for (const id in rcrds) { 
            if (!rcrds[id].parent) { data[rcrds[id].displayName] = id; }
        }
        return data;
    }
    function getTypeObj(types, type, collection) { 
        for (const t in types) {
            if (types[t].slug === type) { return types[t][collection]; }
        }
    }
    /** Note: Top regions are the trunk of the location data tree. */
    /**
     * [entity]Names - an object with each entity's displayName(k) and id.
     * [entity]Sources - an array with of all source records for the entity type.
     */
    function deriveAndStoreSourceData(data) {                                   //console.log("source data = %O", data);
        const authSrcs = getTypeObj(data.sourceType, 'author', 'sources');
        const pubSrcs = getTypeObj(data.sourceType, 'publication', 'sources');
        const publSrcs = getTypeObj(data.sourceType, 'publisher', 'sources'); 
        storeData('authSrcs', authSrcs);         
        storeData('pubSrcs', pubSrcs);              
        storeData('publSrcs', publSrcs);
        storeData('citTypeNames', getTypeNameData(data.citationType));        
        storeData('pubTypeNames', getTypeNameData(data.publicationType));        
    }
    /**
     * [entity]Names - an object with each entity's displayName(k) and id.
     * [entity]Tags - an object with each entity tag's displayName and id.
     */
    function deriveInteractionData(data) {
        storeData('intTypeNames', getTypeNameData(data.interactionType));
        storeData('interactionTags', getTagData(data.tag, "Interaction"));        
    }   
    /** Returns an object with a record (value) for each id (key) in passed array.*/
    function getEntityRcrds(ids, rcrds) {
        var data = {};
        ids.forEach(function(id) { data[id] = rcrds[id]; });        
        return data;
    }
    /** Returns an object with each entity record's displayName (key) and id. */
    function getNameDataObj(ids, rcrds) {
        var data = {};
        ids.forEach(function(id) { data[rcrds[id].displayName] = id; });        //console.log("nameDataObj = %O", data);
        return data;
    }
    /** Returns an object with each entity types's displayName (key) and id. */
    function getTypeNameData(typeObj) {
        var data = {};
        for (var id in typeObj) {
            data[typeObj[id].displayName] = id;
        }  
        return data;
    }
    /** Returns an object with each entity tag's displayName (key) and id. */
    function getTagData(tags, entity) {
        var data = {};
        for (var id in tags) {
            if ( tags[id].constrainedToEntity === entity ) {
                data[tags[id].displayName] = id;
            }
        }  
        return data;
    }
    /*--------------- Shared Helpers -----------------------------*/
    /** Stores passed data under the key in dataStorage. */
    function storeData(key, data) {
        _util.populateStorage(key, JSON.stringify(data));
    }
    /**
     * Attempts to update the data and catches any errors.
     * @param  {func} updateFunc  To update the entity's data.
     * @param  {str}  prop   Entity prop to update     
     * @param  {obj}  params Has props shown, as well as the current update stage. 
     * @param  {obj}  edits  Edit obj returned from server 
     */
    function updateData(updateFunc, prop, params, edits) {                      //console.log('prop [%s] -> params [%O]', prop, params);
        try {
            updateFunc(prop, params.rcrd, params.entity, edits);
        } catch (e) { 
            handleFailedUpdate(prop, updateFunc, params, edits);
        }
    }
    /*----------------- Errs ---------------------------------------*/
    /**
     * If this is the first failure, it is added to other failed updates to be 
     * retried at the end of the update process. If this is the second error, 
     * the error is reported to the user. (<--todo for onPageLoad sync) 
     */
    function handleFailedUpdate(prop, updateFunc, params, edits) {              console.log('handleFailedUpdate [%s]. params = %O edits = %O, failed = %O',prop, params, edits, failed);
        if (failed.twice) { 
            reportDataUpdateErr(edits, prop, params.rcrd, params.entity, params.stage);
        } else {
            addToFailedUpdates(updateFunc, prop, params, edits);       
        }
    }
    function addToFailedUpdates(updateFunc, prop, params, edits) {              console.log('addToFailedUpdates. edits = %O', edits);
        if (!failed.updates[params.entity]) { failed.updates[params.entity] = {}; }
        failed.updates[params.entity][prop] = {
            edits: edits, entity: params.entity, rcrd: params.rcrd, 
            stage: params.stage, updateFunc: updateFunc
        };
    }
    /** Retries any updates that failed in the first pass. */
    function retryFailedUpdates() {                                             console.log('retryFailedUpdates. failed = %O', failed);
        failed.twice = true;                                                    
        for (let entity in failed.updates) {  
            for (let prop in failed.updates[entity]) {
                let params = failed.updates[entity][prop];   
                updateData(params.updateFunc, prop, params, params.edits);
            }            
        }
        delete failed.twice;
    }
    /** Sends a message and error tag back to the form to be displayed to the user. */
    function reportDataUpdateErr(edits, prop, rcrd, entity, stage) {
        var trans = {
            'addData': 'adding to', 'rmvData': 'removing from'
        };
        var msg = 'There was an error while '+trans[stage]+' the '+ entity +
            '\'s stored data.';
        var errTag = stage + ':' +  prop + ':' + entity + ':' + rcrd.id;
        failed.errors.push([ msg, errTag ]);
    }
    /*----------------- AJAX -------------------------------------------------*/
    function sendAjaxQuery(dataPkg, url, successCb) {                           //console.log("Sending Ajax data =%O arguments = %O", dataPkg, arguments)
        return $.ajax({
            method: "POST",
            url: url,
            success: successCb,
            error: ajaxError,
            data: JSON.stringify(dataPkg)
        });
    }
    function ajaxError(jqXHR, textStatus, errorThrown) {
        console.log("ajaxError. responseText = [%O] - jqXHR:%O", jqXHR.responseText, jqXHR);
    }
}());