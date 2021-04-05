/**
 * Location form configuration.
 */
export default function(action, entity) {
	return {
        action: action,
        data: {
            edit: ['geoJson', 'location']
        },
        fields: getLocationFieldConfg(),
        name: entity,
        views: {
            all: [
                [   {fields: ['DisplayName', 'Country']},
                    {fields: ['HabitatType', 'Description']}],
                ['Latitude', 'Longitude', 'Elevation', 'ElevationMax'],
            ]
        }
    };
}
function getLocationFieldConfg() {
    return {
        Country: {
            entity: 'Location',
            name: 'Country',
            prep: {
                setParent: ['Location']
            },
            prop: {
                core: 'parent'
            },
            required: true,
            type: 'select',
        },
        DisplayName: {
            info: {
                intro: `Use the formal name of the location. If it doesn’t have a formal
                    name, use the following format to create a unique name using as
                    many descriptors as applicable: <br> [Habitat type], [Landmark, or
                    “Near” Landmark], [Town/City, or “Near” Town/City], [Province or State] `,
                tooltip: 'Use the formal name of the location. If it doesn’t ' +
                    'have a formal name, use the following format to create a unique ' +
                    'name using as many descriptors as applicable: [Habitat type], ' +
                    '[Landmark, or “Near” Landmark], [Town/City, or “Near” Town/City], ' +
                    '[Province or State]',
            },
            name: 'DisplayName',
            prop: {
                core: 'displayName'
            },
            required: true,
            type: 'text',
        },
        Description: {
            name: 'Description',
            prop: {
                core: 'descriptione'
            },
            type: 'textArea',
        },
        Elevation: {
            class: 'w-8',
            info: {
                tooltip: 'If an elevation range is provided, put the uppermost ' +
                    'elevation here.',
            },
            label: 'Elevation(m)',
            name: 'Elevation',
            prop: {
                core: 'elevation'
            },
            type: 'num',
        },
        ElevationMax: {
            class: 'w-8',
            name: 'ElevationMax',
            prop: {
                core: 'elevationMax'
            },
            type: 'num',
        },
        GeoJson: {
            misc: {} // rcrd: geoJsonRcrd used in edit form
        },
        HabitatType: {
            entity: 'HabitatType',
            info: {
                intro: 'See Habitat Type Definitions <a href="/definitions" ' +
                    'target="_blank">here</a>.',
                tooltip: 'See Habitat Type Definitions under About in the site menu.'
            },
            name: 'HabitatType',
            prop: {
                core: 'habitatType'
            },
            type: 'select',
        },
        LocationType: {
            name: 'LocationType',
            entity: 'LocationType',
            prep: {
                setCoreType: []
            },
            required: true,
            value: 'Point'
        },
        Longitude: {
            class: 'w-8',
            info: {
                intro: `Coordinates need to be entered in decimal degrees. Convert
                    using the <a href="https://www.fcc.gov/media/radio/dms-decimal"
                    target="_blank">FCC converter</a>. <br> Then see the green pin’s
                    popup for name suggestions`,
                tooltip: 'Coordinates need to be entered in decimal degrees. Convert ' +
                   'using the FCC converter at https://www.fcc.gov/media/radio/dms-decimal. ' +
                   'Then see the green pin’s popup for name suggestions',
            },
            name: 'Longitude',
            prop: {
                core: 'longitude'
            },
            type: 'lng',
        },
        Latitude: {
            class: 'w-8',
            info: {
                intro: `Coordinates need to be entered in decimal degrees. Convert
                    using the <a href="https://www.fcc.gov/media/radio/dms-decimal"
                    target="_blank">FCC converter</a>. <br> Then see the green pin’s
                    popup for name suggestions`,
                tooltip: 'Coordinates need to be entered in decimal degrees. Convert ' +
                   'using the FCC converter at https://www.fcc.gov/media/radio/dms-decimal. ' +
                   'Then see the green pin’s popup for name suggestions',
            },
            name: 'Latitude',
            prep: {
                setGeoJsonData: [],
                setCoreData: []
            },
            prop: {
                core: 'latitude'
            },
            type: 'lat',  //merge with lng type?
        }
    };
}