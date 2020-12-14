/**
 * Updates local data after a user-named list is updated, interaction lists or
 * filter sets.
 *
 * Export
 *     updateUserNamedList
 */
import * as db from '../../local-data-main.js';

export function updateUserNamedList(data, action) {                 /*perm-log*/console.log('   --Updating [%s] stored list data. %O', action, data);
    let rcrds, names;
    const list = action == 'delete' ? data : JSON.parse(data.entity);
    const rcrdKey = list.type == 'filter' ? 'savedFilters' : 'dataLists';
    const nameKey = list.type == 'filter' ? 'savedFilterNames' : 'dataListNames';

    return db.getData([rcrdKey, nameKey])
        .then(storedData => syncListData(storedData))
        .then(trackTimeUpdated.bind(null, 'UserNamed', list));

    function syncListData(storedData) {                             /*dbug-log*///console.log('syncListData = %O', storedData);
        rcrds = storedData[rcrdKey];
        names = storedData[nameKey];

        if (action == 'delete') { removeListData();
        } else { updateListData(); }

        db.setData(rcrdKey, rcrds);
        db.setData(nameKey, names);
    }
    function removeListData() {
        delete rcrds[list.id];
        delete names[list.displayName];
    }
    function updateListData() {
        rcrds[list.id] = list;
        names[list.displayName] = list.type !== 'filter' ? list.id :
            {value: list.id, group: getFocusAndViewOptionGroupString(list)};
        if (data.edits && data.edits.displayName) { delete names[data.edits.displayName.old]; }
    }
}
function getFocusAndViewOptionGroupString(list) {
    list.details = JSON.parse(list.details);                        /*dbug-log*///console.log('getFocusAndViewOptionGroupString. list = %O', list)
    const map = {
        'srcs': 'Source', 'auths': 'Author', 'pubs': 'Publication', 'publ': 'Publisher',
        'taxa': 'Taxon', '2': 'Bats', '3': 'Plants', '4': 'Arthropod'
    };
    return list.details.focus === 'locs' ? 'Location' :
        map[list.details.focus] + ' - ' + map[list.details.view];
}

function trackTimeUpdated(entity, rcrd) {
    db.getData('lclDataUpdtdAt').then(stateObj => {
        stateObj[entity] = rcrd.serverUpdatedAt;
        return db.setData('lclDataUpdtdAt', stateObj);
    });
    return Promise.resolve()
}