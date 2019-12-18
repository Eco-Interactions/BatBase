/**
 * Adds export-only data columns to the table:
 *     Taxon - A column is added for each realm level and filled with the 
 *         ancestry for the selected taxon in each role
 *     Location - Elevation, Elevation Max, Latitude, and Longitude
 *
 *  Exports:
 *      fillExportOnlyColumns
 */

export default function fillExportOnlyColumns(focus, tree, rcrds) {
    // fill taxon data
    // fill location data
}




/**
 * A column is added for each realm level and filled with the ancestry for the 
 * taxon in each interaction role.
 */
function fillHiddenTaxonColumns(curTaxonTree, lvls) {                           //console.log('fillHiddenTaxonColumns. curTaxonTree = %O', curTaxonTree);
    const curTaxonHeirarchy = {};
    getTaxonDataAtTreeLvl(curTaxonTree);

    function getTaxonDataAtTreeLvl(treeLvl) {
        for (var topTaxon in treeLvl) {                                         //console.log('curTaxon = %O', treeLvl[topTaxon])
            syncTaxonHeir( treeLvl[topTaxon] ); 
            fillInteractionRcrdsWithTaxonTreeData( treeLvl[topTaxon] );
            if (treeLvl[topTaxon].children) { 
                getTaxonDataAtTreeLvl( treeLvl[topTaxon].children ); }             
        }
    }
    /**
     * This method keeps the curTaxonChain obj in sync with the taxon being processed.  
     * For each taxon, all level more specific that the parent lvl are cleared.
     * Note: The top taxon for the realm inits the taxon chain obj. 
     */
    function syncTaxonHeir(taxon) {                        
        var lvl = taxon.level.displayName;
        var prntId = taxon.parent;                                              //console.log("syncTaxonHeir TAXON = [%s], LVL = [%s] prntId = ",taxonName, lvl, prntId);
        if (!prntId || prntId === 1) { fillInAvailableLevels(lvl);
        } else { clearLowerLvls(focusRcrds[prntId].level.displayName); }
        curTaxonHeirarchy[lvl] = taxon.displayName;
    }
    /**
     * Inits the taxonomic-rank object that will be used to track the parent
     * chain of each taxon being processed. 
     */
    function fillInAvailableLevels(topLvl) { 
        var topIdx = lvls.indexOf(topLvl);
        for (var i = topIdx; i < lvls.length; i++) { 
            curTaxonHeirarchy[lvls[i]] = null;
        }  
    }
    function clearLowerLvls(parentLvl) {
        var topIdx = lvls.indexOf(parentLvl);
        for (var i = ++topIdx; i < lvls.length; i++) { curTaxonHeirarchy[lvls[i]] = null; }
    }
    function fillInteractionRcrdsWithTaxonTreeData(taxon) {                     //console.log('curTaxonHeirarchy = %O', _u.snapshot(curTaxonHeirarchy));
        $(['subjectRoles', 'objectRoles']).each(function(i, role) {             
            if (taxon[role].length > 0) { 
                taxon[role].forEach(addTaxonTreeFields.bind(null, role)) 
            }
        });
    } 
    function addTaxonTreeFields(roleProp, intRcrdObj) {     
        const role = _u.ucfirst(roleProp.split('Roles')[0]);
        for (var lvl in curTaxonHeirarchy) {
            var colName = role + ' ' + lvl; 
            intRcrdObj[colName] = lvl === 'Species' ? 
                getSpeciesName(curTaxonHeirarchy[lvl]) : curTaxonHeirarchy[lvl];
        }                                                                       //console.log('intRcrd after taxon fill = %O', intRcrdObj);
    }
    function getSpeciesName(speciesName) {
        return speciesName === null ? null : _u.ucfirst(curTaxonHeirarchy['Species'].split(' ')[1]);
    }
} /* End fillHiddenColumns */