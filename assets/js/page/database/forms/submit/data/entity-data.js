/**
 * TODO
 *
 * EXPORTS
 *
 * TOC
 *
 */


    /* ----------- LOCATION/GEOJSON ----------------------------------------- */
function setGeoJsonData(g, fConfg) {                              /*dbug-log*///console.log('               --setGeoJsonData [%s] fConfg[%O]', g, fConfg);
    const displayPoint = getDisplayCoordinates(fConfg.value, ld.confg.fields.Longitude.value);
    setServerData('flat', 'DisplayPoint', displayPoint, 'detail');
    setServerData('flat', 'Type', 'Point', 'detail');
    setServerData('flat', 'Coordinates', getCoordValue(displayPoint), 'detail');
}
function getDisplayCoordinates(lat, lng) {
    return JSON.stringify([ lng, lat ]);
}
function getCoordValue(displayPoint) {
    const geoJson = _state('getFormState', ['top', 'geoJson']);
    return geoJson ? geoJson.coordinates : displayPoint;

}
    /* ----------------------- AUTHOR --------------------------------------- */
function handleAuthorNames(g, fConfg) {
    const names = getAuthNameValues(ld.confg.fields);
    setServerData('flat', 'DisplayName', buildAuthDisplayName(names));
    setServerData('flat', 'DisplayName', buildAuthDisplayName(names), 'detail');
    setServerData('flat', 'FullName', buildAuthFullName(names), 'detail');
}
function getAuthNameValues(fields) {                                /*dbug-log*///console.log('--getAuthNameValues fields[%O]', fields);
    const sufx = fields.Suffix.value;
    return {
        first: fields.FirstName.value,
        middle: fields.MiddleName.value,
        last: fields.LastName.value,
        suffix: sufx && sufx[sufx.length-1] !== '.' ? sufx+'.' : sufx
    };
}
function buildAuthDisplayName(names) {                              /*dbug-log*///console.log('--buildAuthDisplayName names[%O]', names);
    if (!names.first) { return names.last; }
    const name = [names.last+',', names.first, names.middle, names.suffix];
    return name.filter(n => n).join(' ');
}
function buildAuthFullName(names) {                                 /*dbug-log*///console.log('--buildAuthFullName names[%O]', names);
    return Object.values(names).filter(n => n).join(' ');
}
function setSuffix(g, fConfg) {
    const v = fConfg.value;
    const sufx = v && v[v.length-1] == '.' ? v.slice(0, -1) : v;
    setServerData('flat', 'Suffix', sufx, 'detail');
}