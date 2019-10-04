/**
 * Builds an object sorted by geoJsonId with all interaction data at that location.
 * -> geoJsonId: {locs: [{loc}], ints: [{name: [intRcrds]}], ttl: ## } 
 *
 * Export defaut:        Imported by:
 *     buildMapDataObj      db_map
 */
import { accessTableState as tState } from '../db-page.js';
import * as _u from '../util.js';

export default function buildMapDataObj(viewRcrds, rcrds) { 
    const tblState = tState().get(null, ['api', 'curFocus', 'curView', 'rowData']);
    const mapData = { 'none': { ttl: 0, ints: {}, locs: null }}; 
    let curBaseNodeName; //used for Source rows
    tblState.api.forEachNodeAfterFilter(getIntMapData);   
    return mapData;  
    
    function getIntMapData(row) {                         
        if (row.data.treeLvl === 0) { curBaseNodeName = row.data.name; }                         
        if (!row.data.interactions || hasUnspecifiedRow(row.data)) { return; }  
        buildInteractionMapData(row, row.data, _u.getDetachedRcrd(row.data.id, viewRcrds));
    }
    function buildInteractionMapData(row, rowData, rcrd) {  //console.log('buildIntMapData row = %O rowData = %O', rowData)
        const locs = {/*locId: { loc: loc, ints: [rcrd]*/};
        let noLocCnt = 0;
        const data = { 
            intCnt: 0, 
            name: getRowRcrdName(rowData, rcrd, curBaseNodeName),
            rcrd: rcrd
        };
        row.childrenAfterFilter.forEach(addRowData); //interactions
        addToMapDataObj(data, locs, noLocCnt);
        /** Adds to mapData obj by geoJsonId, or tracks if no location data. */
        function addRowData(intRow) {  
            if (!intRow.data.location) { return ++noLocCnt; }  
            const intRcrd = _u.getDetachedRcrd(intRow.data.id, rcrds.ints);       //console.log('----intRow = %O, intRcd = %O, rcrds.locs = %O', intRow, intRcrd, rcrds.locs);
            const loc = _u.getDetachedRcrd(intRcrd.location, rcrds.locs);
            addLocAndIntData(loc, intRcrd);
            ++data.intCnt;
        }
        function addLocAndIntData(newLoc, intRcrd) {
            if (!locs[newLoc.id]) { initLocObj() }
            locs[newLoc.id].ints.push(intRcrd);

            function initLocObj() {
                locs[newLoc.id] = { loc: newLoc, ints: [] }; 
            }
        }
    } /* End buildInteractionMapData */
    function addToMapDataObj(entData, locs, noLocCnt) { 
        mapData.none.ttl += noLocCnt;
        for (let id in locs) {
            addData(locs[id], entData);
        }
    }
    function addData(locObj, entData) {
        const geoId = locObj.loc.geoJsonId;
        if (!geoId) { return mapData.none.ttl += locObj.ints.length; }
        if (!mapData[geoId]) { initDataObj(geoId, locObj.loc); }
        mapData[geoId].ttl += locObj.ints.length;
        addIfNewLoc(locObj.loc, geoId);
        addIntData(locObj, entData, geoId);
    }
    function addIntData(locObj, entData, geoId) {
        const mapDataProp = mapData[geoId].ints[entData.name]
        if (!mapData[geoId].ints[entData.name]) { initIntDataObj(entData, geoId); }
        if (tblState.curView == 'auths') { return sanitizeAndAddInt(); }
        addToIntObj(entData.name)

        function addToIntObj(key) {
            mapData[geoId].ints[key] = mapData[geoId].ints[key].concat(locObj.ints);
        }
        /**
         * When author interactions are displayed, they often duplicate if two 
         * authors attrbuted to the same work are shown. This combines the author
         * names in that case, thus showing the interaction once.
         */
        function sanitizeAndAddInt() { 
            const keyStr = entData.name.split(' - (')[1];
            const curAuth = entData.name.split(' - (')[0];
            const toCombine = Object.keys(mapData[geoId].ints).find(
                key => key.includes(keyStr) && !key.includes(curAuth)); 
            if (!toCombine) { addToIntObj(entData.name); 
            } else { modifyAndCombineInt(toCombine, keyStr, curAuth); }
        }
        function modifyAndCombineInt(keyName, work, curAuth) {  
            let auths = keyName.split(' - (')[0]; 
            auths += `, ${curAuth} - (${work}`; 
            mapData[geoId].ints[auths] = mapData[geoId].ints[keyName];
            delete mapData[geoId].ints[keyName];  
        }
    } /* End addIntData */
    function initIntDataObj(entData, geoId) {
        mapData[geoId].ints[entData.name] = [];
    }
    /** Some locations share geoJson with their parent, eg habitats. */
    function addIfNewLoc(newLoc, geoId) {
        const alreadyAdded = mapData[geoId].locs.find(
            loc => loc.displayName === newLoc.displayName); 
        if (alreadyAdded) { return; }  
        mapData[geoId].locs.push(newLoc);
    }
    function initDataObj(geoId, loc) {
        mapData[geoId] = { ints: {/* name: [rcrds] */}, locs: [loc], ttl: 0 };
    }
    function hasUnspecifiedRow(rowData) {
        return rowData.children[0].name.indexOf('Unspecified') !== -1;
    }
    function getRowRcrdName(rowData, rcrd, baseNode) {
        if (tblState.curFocus === 'srcs') { return getSrcRowName(rowData, rcrd, baseNode)}
        return rowData.name.indexOf('Unspecified') !== -1 ?
            getUnspecifiedRowEntityName(rowData, rcrd) : 
            getRcrdDisplayName(rowData.name, rcrd);
    }
    /** Adds the base entity name before the name of the work, eg Author (work) */
    function getSrcRowName(rowData, rcrd, baseNode) {  
        const work = getRcrdDisplayName(rowData.name, rcrd);
        if (work == baseNode) { return baseNode; }
        return `${baseNode} - (${work})`;
    }
    function getUnspecifiedRowEntityName(row, rcrd) { 
        return tblState.curFocus === 'taxa' ? 
            _u.getTaxonName(rcrd) : getRcrdDisplayName(rcrd.displayName, rcrd);
    }
    function getRcrdDisplayName(name, rcrd) {
        return name === 'Whole work cited.' ? getParentName(rcrd) : name;
    }
    function getParentName(rcrd) {  
        return rcrd.displayName.split('(citation)')[0];
    }
} /* End buildTableLocDataObj */