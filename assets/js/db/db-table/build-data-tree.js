/**
 * Builds a data tree out of the records for the selected data view. 
 * 
 * Exports:
 *     buildSrcTree
 *             
 */
import { accessTableState as tState } from '../db-page.js';
import * as _u from '../util.js';

/**
 * curTree - only used here?
 */
let tblState; //Refreshed with each new entry into the module.

function refreshTableState() {
    tblState = tState().get();
}

/* ========================= SOURCE TREE ============================================================================ */
/** (Re)builds source tree for the selected source realm. */
export function buildSrcTree() {
    refreshTableState();
    const dataTree = buildSrcRealmTree(tblState.curRealm, getRealmRcrds(tblState.curRealm));
    return fillTreeWithInteractions(dataTree);
}
/** Returns the records for the source realm currently selected. */
function getRealmRcrds(realm) {
    const valMap = { 'auths': 'authSrcs', 'pubs': 'pubSrcs', 'publ': 'pubSrcs' };
    return getTreeRcrdAry(valMap[realm]);
}
/** Returns an array with all records from the stored record object. */
function getTreeRcrdAry(realm) {
    const srcRcrdIdAry = _u.getDataFromStorage(realm);
    return srcRcrdIdAry.map(function(id) { return _u.getDetachedRcrd(id, tblState.rcrdsById); });
}
/**
 * Builds the source data tree for the selected source realm (source type)
 * NOTE: Sources have three realms and tree-data structures:
 * Authors->Citations/Publications->Interactions
 * Publications->Citations->Interactions. 
 * Publishers->Publications->Citations->Interactions. 
 */
function buildSrcRealmTree(realm, rcrds) {                                            //console.log("initSrcTree realmRcrds = %O", realmRcrds);
    const treeMap = { 'pubs': buildPubTree, 'auths': buildAuthTree, 'publ': buildPublTree };
    let tree = treeMap[realm](rcrds);
    return sortDataTree(tree);
}  
/*-------------- Publication Source Tree -------------------------------------------*/
/**
 * Returns a tree object with Publications as the base nodes of the data tree. 
 * Each interaction is attributed directly to a citation source, which currently 
 * always has a 'parent' publication source.
 * Data structure:
 * ->Publication Title
 * ->->Citation Title
 * ->->->Interactions Records
 */
function buildPubTree(pubSrcRcrds) {                                            //console.log("buildPubSrcTree. Tree = %O", pubSrcRcrds);
    var tree = {};
    pubSrcRcrds.forEach(function(pub) { 
        tree[pub.displayName] = getPubData(pub); 
    });
    return tree;
}
function getPubData(rcrd) {                                                     //console.log("getPubData. rcrd = %O", rcrd);
    rcrd.children = getPubChildren(rcrd);
    if (rcrd.publication) {                                                     //console.log("rcrd with pub = %O", rcrd)
        rcrd.publication = _u.getDetachedRcrd(rcrd.publication, tblState.publication);
    }
    return rcrd;
}
function getPubChildren(rcrd) {                                                 //console.log("getPubChildren rcrd = %O", rcrd)
    if (rcrd.children.length === 0) { return []; }
    return rcrd.children.map(id => getPubData(_u.getDetachedRcrd(id, tblState.rcrdsById)));
}
/*-------------- Publisher Source Tree ---------------------------------------*/
/**
 * Returns a tree object with Publishers as the base nodes of the data tree. 
 * Publications with no publisher are added underneath the "Unspecified" base node.
 * Data structure:
 * ->Publisher Name
 * ->->Publication Title
 * ->->->Citation Title
 * ->->->->Interactions Records
 */
function buildPublTree(pubRcrds) {                                              //console.log("buildPublSrcTree. Tree = %O", pubRcrds);
    let tree = {};
    let noPubl = [];
    pubRcrds.forEach(function(pub) { addPubl(pub); });
    tree["Unspecified"] = getPubsWithoutPubls(noPubl);
    return tree;

    function addPubl(pub) {
        if (!pub.parent) { noPubl.push(pub); return; }
        const publ = _u.getDetachedRcrd(pub.parent, tblState.rcrdsById);
        tree[publ.displayName] = getPublData(publ); 
    }
} /* End buildPublTree */
function getPublData(rcrd) {
    rcrd.children = getPublChildren(rcrd);
    return rcrd;
}
function getPublChildren(rcrd) {                                                //console.log("getPubChildren rcrd = %O", rcrd)
    if (rcrd.children.length === 0) { return []; }
    return rcrd.children.map(id => getPubData(_u.getDetachedRcrd(id, tblState.rcrdsById)));
}
function getPubsWithoutPubls(pubs) {
    let publ = { id: 0, displayName: "Unspecified", parent: null, sourceType: { displayName: 'Publisher' } };
    publ.children = pubs.map(pub => getPubData(pub));
    return publ;
}
/*-------------- Author Source Tree ------------------------------------------*/
/**
 * Returns a tree object with Authors as the base nodes of the data tree, 
 * with their contributibuted works and the interactions they contain nested 
 * within. Authors with no contributions are not added to the tree.
 * Data structure:
 * ->Author Display Name [Last, First M Suff]
 * ->->Citation Title (Publication Title)
 * ->->->Interactions Records
 */
function buildAuthTree(authSrcRcrds) {                                          //console.log("----buildAuthSrcTree");
    var tree = {};
    for (var id in authSrcRcrds) { 
        getAuthData(_u.getDetachedRcrd(id, authSrcRcrds)); 
    }  
    return tree;  

    function getAuthData(authSrc) {                                             //console.log("rcrd = %O", authSrc);
        if (authSrc.contributions.length > 0) {
            authSrc.author = _u.getDetachedRcrd(authSrc.author, tblState.author);
            authSrc.children = getAuthChildren(authSrc.contributions); 
            tree[authSrc.displayName] = authSrc;
        }
    }
} /* End buildAuthTree */
/** For each source work contribution, gets any additional publication children
 * @getPubData and return's the source record.
 */
function getAuthChildren(contribs) {                                            //console.log("getAuthChildren contribs = %O", contribs);
    return contribs.map(wrkSrcid => getPubData(_u.getDetachedRcrd(wrkSrcid, tblState.rcrdsById)));
}
/* ====================== Interaction Fill Methods ========================== */
/**
 * Replaces interaction IDs in the data tree with the interaction records.    
 */
function fillTreeWithInteractions(dataTree) {                                           //console.log("getInteractionsAndFillTable called. Tree = %O", tblState.curTree);
    const entityData = _u.getDataFromStorage('interaction');
    _u.fadeTable();
    if (entityData) { 
        return fillTree(tblState.curFocus, dataTree, entityData); 
    } else { console.log("Error loading interaction data from storage."); }
}
/** Replaces all interaction ids with records for every node in the tree.  */
function fillTree(focus, curTree, intRcrds) {  
    const intEntities = ['taxon', 'location', 'source'];
    const entityData = _u.getDataFromStorage(intEntities);
    const fillMethods = { taxa: fillTaxonTree, locs: fillLocTree, srcs: fillSrcTree };
    fillMethods[focus](curTree, intRcrds);
    return curTree;

    function fillTaxonTree(curTree) {                                           //console.log("fillingTaxonTree. curTree = %O", curTree);
        fillTaxaInteractions(curTree);  
        fillHiddenTaxonColumns(curTree, intRcrds);

        function fillTaxaInteractions(treeLvl) {                                //console.log("fillTaxonInteractions called. taxonTree = %O", curTree) 
            for (let taxon in treeLvl) {   
                fillTaxonInteractions(treeLvl[taxon]);
                if (treeLvl[taxon].children !== null) { 
                    fillTaxaInteractions(treeLvl[taxon].children); }
            }
        }
        function fillTaxonInteractions(taxon) {                                 //console.log("fillTaxonInteractions. taxon = %O", taxon);
            const roles = ['subjectRoles', 'objectRoles'];
            for (let r in roles) {
                taxon[roles[r]] = replaceInteractions(taxon[roles[r]]); 
            }
        }
    } /* End fillTaxonTree */
    /**
     * Recurses through each location's 'children' property and replaces all 
     * interaction ids with the interaction records.
     */
    function fillLocTree(treeBranch) {                                          //console.log("fillLocTree called. taxonTree = %O", treeBranch) 
        for (let curNode in treeBranch) {                                       //console.log("curNode = %O", treeBranch[curNode]);
            if (treeBranch[curNode].interactions.length > 0) { 
                treeBranch[curNode].interactions = replaceInteractions(treeBranch[curNode].interactions); }
            if (treeBranch[curNode].children) { 
                fillLocTree(treeBranch[curNode].children); }
        }
    }
    /**
     * Recurses through each source's 'children' property until finding the
     * direct source, then replacing its interaction id's with their records.
     */
    function fillSrcTree(curTree) { 
        for (let srcName in curTree) {                                          //console.log("-----processing src %s = %O. children = %O", srcName, curTree[srcName], curTree[srcName].children);
            fillSrcInteractions(curTree[srcName]);
        }
        /**
         * Recurses through each source's 'children' property until all sources 
         * have any interaction ids replaced with the interaction records. 
         */
        function fillSrcInteractions(curSrc) {                                  //console.log("fillSrcInteractions. curSrc = %O. parentSrc = %O", curSrc, parentSrc);
            const srcChildren = [];
            if (curSrc.isDirect) { replaceSrcInts(curSrc); }
            curSrc.children.forEach(function(childSrc){
                fillSrcInteractions(childSrc); 
            });
        }
        function replaceSrcInts(curSrc) {
            curSrc.interactions = replaceInteractions(curSrc.interactions); 
        }

    } /* End fillSrcTree */
    /** Replace the interaction ids with their interaction records. */
    function replaceInteractions(interactionsAry) {                             //console.log("replaceInteractions called. interactionsAry = %O", interactionsAry);
        return interactionsAry.map(function(intId){
            if (typeof intId === "number") {                                    //console.log("new record = %O",  _u.snapshot(intRcrds[intId]));
                return fillIntRcrd(_u.getDetachedRcrd(intId, intRcrds)); 
            }  console.log("####replacing interactions a second time? Ary = %O", interactionsAry);
        });
    }
    /** Returns a filled record with all references replaced with entity records. */
    function fillIntRcrd(intRcrd) {
        for (let prop in intRcrd) { 
            if (prop in entityData) { 
                intRcrd[prop] = entityData[prop][intRcrd[prop]];
            } else if (prop === "subject" || prop === "object") {
                intRcrd[prop] = entityData.taxon[intRcrd[prop]];
            } else if (prop === "tags") {
                intRcrd[prop] = intRcrd[prop].length > 0 ? 
                    getIntTags(intRcrd[prop]) : null;
            }
        }
        return intRcrd;
    }
    function getIntTags(tagAry) { 
        const tags = tagAry.map(function(tag){ return tag.displayName; });
        return tags.join(", ");
    }
} /* End fillTree */
// /** Calls the start of the table-building method chain for the current focus. */
// function buildTable(focus, curTree) {
//     const tblBuilderMap = { 
//         locs: buildLocSearchUiAndTable,  srcs: buildSrcSearchUiAndTable,
//         taxa: buildTaxonSearchUiAndTable 
//     };    
//     tblBuilderMap[focus](curTree);
// }
function getTaxonName(taxon) {                                           
    var lvl = taxon.level.displayName;  
    return lvl === "Species" ? taxon.displayName : lvl+' '+taxon.displayName;
}  
/* ================================ UTILITY ================================= */
/** Sorts the all levels of the data tree alphabetically. */
function sortDataTree(tree) {
    var sortedTree = {};
    var keys = Object.keys(tree).sort();    

    for (var i=0; i<keys.length; i++){ 
        sortedTree[keys[i]] = sortNodeChildren(tree[keys[i]]);
    }
    return sortedTree;

    function sortNodeChildren(node) { 
        if (node.children) {  
            node.children = node.children.sort(alphaEntityNames);
            node.children.forEach(sortNodeChildren);
        }
        return node;
    } 
} /* End sortDataTree */
/** Alphabetizes array via sort method. */
function alphaEntityNames(a, b) {                                               //console.log("alphaSrcNames a = %O b = %O", a, b);
    var x = a.displayName.toLowerCase();
    var y = b.displayName.toLowerCase();
    return x<y ? -1 : x>y ? 1 : 0;
}
