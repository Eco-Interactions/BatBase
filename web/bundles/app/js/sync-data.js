(function(){
    var eif = ECO_INT_FMWK;
    var _util = eif.util;
    eif.syncData = {
        update: updateStoredData,
    };

    getServerDataLastUpdatedTimes();
    /** Gets an object with the lastUpdated datetimes for the system and each entity class.*/
    function getServerDataLastUpdatedTimes() {
        sendAjaxQuery({}, "ajax/data-state", storeDataUpdatedTimes);
    }
    /** Stores the datetime object. Checks for updated data @addNewDataToStorage. */
    function storeDataUpdatedTimes(ajaxData) {
        storeData('dataUpdatedAt', ajaxData.dataState);                         //console.log("dataState = %O", ajaxData.dataState);
        addNewDataToStorage(ajaxData.dataState);
    }
    /** Returns the current date time in the format: Y-m-d H:i:s */
    function getCurrentDate() {
        return new Date().today() + " " + new Date().timeNow();
    }
/*-------------- Stored Data Methods -----------------------------------------*/
    /*------------------Sync Updated Data ------------------------------------*/
    /**
     * On search page load, the system updatedAt flag is compared against the page's. 
     * If there they system data has updates more recent than the last sync, the 
     * updated data is ajaxed and stored @syncUpdatedData. 
     * On a browser's first visit to the page, all data is downloaded and the 
     * search page ui is initialized @initStoredData.
     */
    function addNewDataToStorage(dataUpdatedAt) {  
        var pgUpdatedAt = _util.getDataFromStorage('pgDataUpdatedAt');          //console.log("pgUpdatedAt = ", pgUpdatedAt)
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
        });
        if (!withUpdates) { console.log("No updated entities found when system flagged as updated."); return; }
        ajaxNewData(withUpdates, pgUpdatedAt);
    }
    /** 
     * Sends an ajax call for each entity with updates. On return, the new data 
     * is stored @processUpdatedData. 
     */
    function ajaxNewData(entities, lastUpdated) {
        var data = { updatedAt: lastUpdated };
        entities.forEach(function(entity) {
            data.entity = entity;
            sendAjaxQuery(data, "ajax/update", processUpdatedData);
        });
    } /* End ajaxNewData */
    /**
     * Parses and sends the returned data to @storeUpdatedData. The stored data's 
     * lastUpdated flag, 'pgDataUpdatedAt', is updated and the search-page grid
     * is reinitialized with the updated data @initSearchGrid.
     */
    function processUpdatedData(results) {                                      console.log("updated data returned from server = %O", arguments);
        var entity = Object.keys(results)[0];
        var data = parseData(results[entity]);
        storeUpdatedData(data, entity);
        storeData('pgDataUpdatedAt', getCurrentDate());
        eif.search.initSearchGrid();
    }
    /** Sends the each updated record to the update handler for the entity. */
    function storeUpdatedData(rcrds, entity) {
        var coreEntities = ['Interaction', 'Location', 'Source', 'Taxon'];
        var entityHndlr = coreEntities.indexOf(entity) !== -1 ? 
            updateCoreEntityData : updateDetailEntityData;
        for (var id in rcrds) {
            entityHndlr(_util.lcfirst(entity), rcrds[id]);
        }
    }
    /*------------------ Update Form-Data  -----------------------------------*/
    /**
     * On crud-form submit success, the returned data is added to, or updated in, 
     * all relevant stored data. The core-entity data is processed @updateCoreEntityData. 
     * Then any detail-entity data is processed @updateDetailEntityData. 
     * The stored data's lastUpdated flag, 'pgDataUpdatedAt', is updated. 
     */
    function updateStoredData(data) {                                           console.log("updateStoredData data recieved = %O", data);
        updateCoreEntityData(data.core, data.coreEntity);
        if (data.detailEntity) { 
            updateDetailEntityData(data.detail, data.detailEntity);
        }
        storeData('pgDataUpdatedAt', getCurrentDate());
    }
    /*------------------ Entity Storage Methods ------------------------------*/
    /**
     * Updates stored-data props related to a core-entity record with new data.
     */
    function updateCoreEntityData(entity, rcrd) {                               //console.log("Updating Core entity. %s. %O", entity, rcrd);
        var dataProps = getDataProps(entity, rcrd);
        updateDataProps(dataProps, entity, rcrd);
        updateCoreData(entity, rcrd);
    }
    /** Returns an object of related data properties to update. */
    function getDataProps(entity, rcrd) {
        var type = getEntityType(entity, rcrd);                                 //console.log("type = ", type);
        var update = {
            'source': {
                'author': { 'authSources': addToRcrdAryProp },
                'citation': { 'author': addContribData, 'source': addToParentRcrd,
                    'tag': addToTagProp },
                'publication': { 'pubSources': addToRcrdAryProp, 'author': addContribData },
                'publisher': { 'publisherNames': addToNameProp }
            },
            'location': {
                'location': addToParentRcrd, 'habitatType': addToTypeProp, 
                'locationType': addToTypeProp
            },
        };
        return type ? update[entity][type] : update[entity];
    }
    /** 
     * Returns the record's entity'Type', eg SourceType Author or Publication when
     * there are 'type' properties to update. (Currently only source has type-specific updates.)
     */
    function getEntityType(entity, rcrd) {
        if (entity !== "source") { return false; }
        var type = _util.lcfirst(entity)+"Type";
        return _util.lcfirst(rcrd[type].displayName);
    }
    /** Sends entity-record data to each storage property-type handler. */
    function updateDataProps(propHndlrs, entity, rcrd) {                        //console.log("updateDataProps %O. [%s]. %O", propHndlrs, entity, rcrd);
        for (var prop in propHndlrs) {
            propHndlrs[prop](prop, rcrd, entity);
        }
    }
    /** 
     * Updates the stored core-records array and the stored entityType array. 
     * Note: Taxa are the only core entity without 'types'.
     */
    function updateCoreData(entity, rcrd) {                                     //console.log("Updating Core data");
        addToRcrdProp(entity, rcrd);
        if (entity === "taxon") { return; }
        addToTypeProp(entity+"Type", rcrd, entity); 
    } 
    /** Updates stored-data props related to a detail-entity record with new data. */
    function updateDetailEntityData(entity, rcrd) {                             //console.log("Updating Detail entity. %s. %O", entity, rcrd);
        var update = {
            'author': { 'author': addToRcrdProp },
            'citation': {},
            'publication': { 'publication': addToRcrdProp, 'publicationType': addToTypeProp },
            'publisher': { 'publisherNames': addToNameProp }
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
        var parentObj = _util.getDataFromStorage(prop);                         //console.log("addToParentRcrd. [%s] = %O. rcrd = %O", prop, parentObj, rcrd);
        var parent = parentObj[rcrd.parent];
        addIfNewRcrd(parent.children, rcrd.id);
        storeData(prop, parentObj);
    }
    /** Adds a new tagged record to the tag's array of record ids. */
    function addToTagProp(prop, rcrd, entity) {                                 
        var tagObj = _util.getDataFromStorage(prop);                            //console.log("addToTagProp. [%s] = %O. rcrd = %O", prop, tagObj, rcrd);
        if (rcrd.tags.length > 0) {
            rcrd.tags.forEach(function(tag){
                addIfNewRcrd(tagObj[tag.id][entity+'s'], rcrd.id);                
            });
        }
    }
    /*----------------- Entity Specific Update Methods -----------------------*/
    /** When a Publication or Citation have been updated, update contribution data. */
    function addContribData(prop, rcrd, entity) {                               //console.log("addContribData. [%s] rcrd = %O. for %s", prop, rcrd, entity);
        if (rcrd.contributors.length > 0) { 
            addContributionData(rcrd.contributors, rcrd); 
        }
    }
    /** Adds the new work-source to each contributor's contributions array. */
    function addContributionData(contributors, rcrd) {                          //console.log("contributors = %O", contributors);
        var srcObj = _util.getDataFromStorage('source');
        contributors.forEach(function(authId) {
            addIfNewRcrd(srcObj[authId].contributions, rcrd.id);
        });
        storeData('source', srcObj);
    }
    /*------------------Init Stored Data Methods----------------------------*/
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
     *   /taxon - Taxon, Domain, Level 
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
        for (var entity in data) {                                              //console.log("entity = %s, data = %O", entity, rcrdData);
            storeData(entity, parseData(data[entity]));
        }
    }
    /** Stores passed data under the key in localStorage. */
    function storeData(key, data) {
        _util.populateStorage(key, JSON.stringify(data));
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
    /** Adds to localStorage data derived from the serialized entity data. */
    function deriveAndStoreData(data) {
        deriveAndStoreTaxonData(data[0]);
        deriveAndStoreLocationData(data[1]);
        deriveAndStoreSourceData(data[2]);
        // deriveInteractionData(data[3]);
    }
    /** Stores an object of taxon names and ids for each level in each domain. */
    function deriveAndStoreTaxonData(data) {
        var nameData = separateTaxaByLevelAndDomain(data.taxon);                //console.log("taxonym name data = %O", nameData);
        for (var domain in nameData) {  
            storeLevelTaxonData(domain, nameData[domain]);
        }
    }
    function storeLevelTaxonData(domain, taxonObj) {
        for (var level in taxonObj) {                                           //console.log("storing as [%s] = %O", domain+level+'Names', taxonObj[level]);
            storeData(domain+level+'Names', taxonObj[level]);
        }
    }
    /** Each taxon is sorted by domain and then level. Domain taxa are skipped.  */
    function separateTaxaByLevelAndDomain(taxa) {
        var data = { "Bat": {}, "Plant": {}, "Arthropod": {} };
        for (var id = 5; id < Object.keys(taxa).length+1; id++) {               
            addTaxonData(taxa[id]);
        }                         
        return data;                                              
        /** Adds the taxon's name (k) and id to it's level's obj. */
        function addTaxonData(taxon) {
            var domainObj = data[taxon.domain.displayName];
            var level = taxon.level.displayName;  
            if (!domainObj[level]) { domainObj[level] = {}; }; 
            domainObj[level][taxon.displayName] = taxon.id;
        }
    }
    /** [entity]Names - an object with each entity's displayName(k) and id. */
    function deriveAndStoreLocationData(data) {  
        addUnspecifiedLocation(data.noLocIntIds);
        storeData('countryNames', getNameDataObj(data.locationType[2].locations, data.location));
        storeData('regionNames', getRegionNames(data.locationType[1].locations, data.location));
        storeData('topRegionNames', getTopRegionNameData(data));
        storeData('habTypeNames', getTypeNameData(data.habitatType));
        storeData('locTypeNames', getTypeNameData(data.locationType));
    }
    /** Adds a location object for interactions with no location specified. */
    function addUnspecifiedLocation(noLocInts) {
        var locRcrds = _util.getDataFromStorage('location');
        locRcrds[9999] = {
            id: 9999,
            displayName: 'Unspecified',
            children: [],
            interactions: noLocInts,
            locationType: {displayName: 'Region'}
        };
        storeData('location', locRcrds);
    }
    /** Note: Adds a region for interactions with no location specified. */
    function getRegionNames(regionIds, locRcrds) {
        var nameData = getNameDataObj(regionIds, locRcrds);
        nameData['Unspecified'] = 9999;
        return nameData;
    }
    /** Note: Adds a top region for interactions with no location specified. */
    function getTopRegionNameData(locData) {  
        var data = {};
        var regions = locData.locationType[1].locations;
        var rcrds = getEntityRcrds(regions, locData.location);
        for (var id in rcrds) {
            if (!rcrds[id].parent) { data[rcrds[id].displayName] = id; }
        }
        data['Unspecified'] = 9999; 
        return data;
    }
    /**
     * [entity]Names - an object with each entity's displayName(k) and id.
     * [entity]Sources - an array with of all source records for the entity type.
     * [entity]Tags - an object with each entity tag's displayName and id.
     */
    function deriveAndStoreSourceData(data) {                                   //console.log("dervied source data = %O", derivedData);
        storeData('authSources', data.sourceType[3].sources);         
        storeData('pubSources', data.sourceType[2].sources);         
        storeData('publisherNames', getNameDataObj(data.sourceType[1].sources, data.source));
        storeData('citTypeNames', getTypeNameData(data.citationType));        
        storeData('pubTypeNames', getTypeNameData(data.publicationType));        
        storeData('sourceTags', getTagData(data.tag, "Source"));        
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













































    /*----------------- AJAX -------------------------------------------------*/
    function sendAjaxQuery(dataPkg, url, successCb) {                           //console.log("Sending Ajax data =%O arguments = %O", dataPkg, arguments)
        $.ajax({
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