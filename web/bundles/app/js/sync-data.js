(function(){
    var dataLastUpdated;
    var eif = ECO_INT_FMWK;
    var _util = eif.util;
    eif.syncData = {
        initStoredData: initStoredData,
        update: updateStoredData,
        // sync: syncStoredData
    };
    /*------------------Current Data State Methods ----------------------------*/
    getServerDataLastUpdatedTimes();
    /** Gets an object with the lastUpdated datetimes for the system and each entity class.*/
    function getServerDataLastUpdatedTimes() {
        sendAjaxQuery({}, "ajax/data-state", storeDataUpdatedTimes);
    }
    /** Stores the datetime object in the global ECO_ECO_INT_FMWK object. */
    function storeDataUpdatedTimes(ajaxData) {
        dataLastUpdated = ajaxData.dataState;                                   //console.log("dataState = %O", eif.data_state);
    }

/*-------------- Stored Data Methods -----------------------------------------*/
    /*------------------Update Stored Data Methods----------------------------*/
    /**
     * On crud-form submit success, the returned data is added to, or updated in, 
     * all relevant stored data. The main-entity data is processed @updateCoreEntityData. 
     * Then any detail-entity data is processed @updateDetailEntityData. 
     */
    function updateStoredData(data) {                                           console.log("updateStoredData data recieved = %O", data);
        updateCoreEntityData(data.main, data.detail, JSON.parse(data.mainEntity));
        if (data.detailEntity) { 
            updateDetailEntityData(data.detail, JSON.parse(data.detailEntity))
        }
    }
    /**
     * Updates stored-data props related to a core-entity record with new data.
     * NOTE: Only including source for now, as only source returns data atm.  
     */
    function updateCoreEntityData(entity, type, rcrd) {                         //console.log("Updating Core entity. %s. [%s]. %O", entity, type, rcrd);
        var update = {
            'source': {
                'author': { 'authSources': addToRcrdAryProp },
                'citation': { 'author': addContribData },
                'publication': { 'pubSources': addToRcrdAryProp, 'author': addContribData },
                'publisher': { 'publisherNames': addToNameProp }
            },
        };
        updateDataProps(update[entity][type], entity, rcrd);
        updateCoreData(entity, rcrd);
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
        var typeId = rcrd[prop].id;                                             
        typeObj[typeId][entity+'s'].push(rcrd.id);
        storeData(prop, typeObj);
    }
    function addIfNewRcrd(ary, id) {
        if (ary.indexOf(id) === -1) { ary.push(id); }                           //console.log("Pushing id %s to array.", id);
    }
    /*----------------- Entity Specific Update Methods -----------------------*/
    /** When a Publication or Citation have been updated, update contribution data. */
    function addContribData(prop, rcrd, entity) {                               //console.log("addContribData. [%s] rcrd = %O. for %s", prop, rcrd, entity);
        if (rcrd.contributors.length > 0) { 
            addContributionData(rcrd.contributors, rcrd); 
        }
    }
    /** Adds the new work-source to each contributor's contributions array. */
    function addContributionData(contributors, rcrd) {
        var srcObj = _util.getDataFromStorage('source');
        contributors.forEach(function(authId) {
            addIfNewRcrd(srcObj[authId].contributions, rcrd.id);
        });
        storeData('source', srcObj);
    }
    /*------------------Init Stored Data Methods----------------------------*/
    function initStoredData() {
        ajaxAndStoreAllEntityData();
    }
    /**
     * The first time a browser visits the search page, all entity data is downloaded
     * from the server and stored locally @storeEntityData. The Search page grid-build 
     * begins @initSearchPage.
     * Entities downloaded with each ajax call:
     *   /taxon - Taxon, Domain, Level 
     *   /location - HabitatType, Location, LocationType, 'noLocIntIds' 
     *   /source - Author, Citation, CitationType, Publication, PublicationType, 
     *       Source, SourceType, Tag
     *   /interaction - Interaction, InteractionType  
     */
    function ajaxAndStoreAllEntityData() {                                      console.log("ajaxAndStoreAllEntityData");
        $.when(
            $.ajax("search/taxon"), $.ajax("search/location"), 
            $.ajax("search/source"), $.ajax("search/interaction")
        ).then(function(a1, a2, a3, a4) {                                       console.log("Ajax success: a1 = %O, a2 = %O, a3 = %O, a4 = %O", a1, a2, a3, a4) 
            $.each([a1, a2, a3, a4], function(idx, a) { storeServerData(a[0]); });
            deriveAndStoreData([a1[0], a2[0], a3[0], a4[0]]);
            _util.populateStorage("storedData", true); 
            eif.search.initSearchPage();
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
    /** levels - an array of all Taxon level names - Kingdom, Family, Order, etc. */
    function deriveAndStoreTaxonData(data) {
        var levels = [];
        for (var lvl in data.level) { 
            levels.push(data.level[lvl].displayName); 
        }
        storeData('levels', levels);
    }
    /** [entity]Names - an object with each entity's displayName (key) and id. */
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
     * [entity]Names - an object with each entity's displayName (key) and id.
     * [entity]Sources - an array with of all source records for the entity type.
     * [entity]Tags - an object with each entity tag's displayName (key) and id.
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