/**
 * Location form configuration.
 */
export default function(entity) {
	return {
        views: {
            all: [
                ['Latitude', 'Longitude'],
                ['DisplayName', 'Description'],
                ['Country', 'HabitatType'],
                ['Elevation', 'ElevationMax']
            ]
        },
        fields: {
            Country: {
                entity: 'Location',
                name: 'Country',
                prop: {
                    core: 'parentLoc'
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
                required: true,
                type: 'text',
            },
            Description: {
                name: 'Description',
                // required: false,
                type: 'textArea',
            },
            Elevation: {
                info: {
                    tooltip: 'If an elevation range is provided, put the uppermost ' +
                        'elevation here.',
                },
                name: 'Elevation',
                // required: false,
                type: 'num',
            },
            ElevationMax: {
                name: 'ElevationMax',
                // required: false,
                type: 'num',
            },
            HabitatType: {
                entity: 'HabitatType',
                info: {
                    intro: 'See Habitat Type Definitions <a href="/definitions" ' +
                        'target="_blank">here</a>.',
                    tooltip: 'See Habitat Type Definitions under About in the site menu.'
                },
                name: 'HabitatType',
                // required: false,
                type: 'select',
            },
            LocationType: {
                name: 'LocationType',
                entity: 'LocationType',
                required: true
            },
            Longitude: {
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
                // required: false,
                type: 'lng',
            },
            Latitude: {
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
                // required: false,
                type: 'lat',  //merge with lng type?
            },
        },
        // optional: [],
        // order: {
        //     sug: [
        //         ['Latitude', 'Longitude'],
        //         ['DisplayName', 'Description'],
        //         ['Country', 'HabitatType'],
        //         ['Elevation', 'ElevationMax']
        //     ],
        //     opt: false
        // },
        // suggested: [
        //     'Description',
        //     'HabitatType',
        //     'Latitude',
        //     'Longitude',
        //     'Elevation',
        //     'ElevationMax'
        // ]
    };
}