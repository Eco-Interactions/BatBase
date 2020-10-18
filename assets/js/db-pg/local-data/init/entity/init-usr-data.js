/**
 * Modifies and sorts user-data for local storage.
 * - savedFilters - an object with each filter's id (k) and data (v)
 * - savedFiltersNames - an object with each filter's name(k) and { id, focus-view }
 * - dataLists - an object with each list's id (k) and data (v)
 * - dataListNames - an object with each list's name (k) and id (v).
 * - user - current user's name or 'visitor'
 *
 * Export
 *     modifyUsrDataForLocalDb
 */
import * as db from '../../local-data-main.js';
import { getNameObj } from '../init-helpers.js';

export function modifyUsrDataForLocalDb(data) {                     /*dbug-log*///console.log("modifyUsrDataForLocalDb called. data = %O", data);
    const filters = {};
    const filterIds = [];
    const int_sets = {};
    const int_setIds = [];

    data.lists.forEach(addToDataObjs);
    db.setDataInMemory('savedFilters', filters);
    db.setDataInMemory('savedFilterNames', getFilterOptionGroupObj(filterIds, filters));
    db.setDataInMemory('dataLists', int_sets);
    db.setDataInMemory('dataListNames', getNameObj(int_setIds, int_sets));
    db.setDataInMemory('user', getUserName());
    db.deleteMmryData('list');

    function addToDataObjs(l) {
        const entities = l.type == 'filter' ? filters : int_sets;
        const idAry = l.type == 'filter' ? filterIds : int_setIds;
        entities[l.id] = l;
        idAry.push(l.id);
    }
}
function getUserName() {
    return $('body').data('user-name') ? $('body').data('user-name') : 'visitor';
}
function getFilterOptionGroupObj(ids, filters) {                    /*dbug-log*///console.log('getFilterOptionGroupObj ids = %O, filters = %O', ids, filters);
    const data = {};
    ids.forEach(buildOptObj);
    return data;

    function buildOptObj(id) {
        return data[filters[id].displayName] = {
            value: id, group: getFocusAndViewString(filters[id])
        }
    }
}
function getFocusAndViewString(list) {
    list.details = JSON.parse(list.details);                        /*dbug-log*///console.log('getFocusAndViewString. list = %O', list)
    const map = {
        'srcs': 'Source', 'auths': 'Author', 'pubs': 'Publication', 'publ': 'Publisher',
        'taxa': 'Taxon', '2': 'Bats', '3': 'Plants', '4': 'Arthropod'
    };
    return list.details.focus === 'locs' ? 'Location' :
        map[list.details.focus] + ' - ' + map[list.details.view];
}