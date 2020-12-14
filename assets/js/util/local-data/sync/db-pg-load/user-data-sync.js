/**
 * Updates user specific data in local storage. Useful when the user changes on the
 * same machine, or when the search page is first visited before a user logged in.
 *
 * Export
 *     validateAndUpdateUserData
 */
import * as db from '../../local-data-main.js';

export function validateAndUpdateUserData(dbUser) {
    if (dbUser == $('body').data('user-name')) { return; }
    db.fetchServerData("lists")
    .then(data => replaceUserData($('body').data('user-name'), data));
}
function replaceUserData(userName, data) {                          /*dbug-log*///console.log('replaceUserData. [%s] = %O', userName, data);
    data.lists = data.lists.map(l => JSON.parse(l));
    db.storeUserData(data);
    db.setDataInMemory('user', userName);
}