/**
 * Location form configuration.
 */
export default function(entity) {
	return {
        'add': {},
        'info': {
            'Latitude': {
                intro: `Coordinates need to be entered in decimal degrees. Convert
                    using the <a href="https://www.fcc.gov/media/radio/dms-decimal"
                    target="_blank">FCC converter</a>. <br> Then see the green pin’s
                    popup for name suggestions`,
                tooltip: 'Coordinates need to be entered in decimal degrees. Convert ' +
                   'using the FCC converter at https://www.fcc.gov/media/radio/dms-decimal. ' +
                   'Then see the green pin’s popup for name suggestions',
            },
            'Longitude': {
                intro: `Coordinates need to be entered in decimal degrees. Convert
                    using the <a href="https://www.fcc.gov/media/radio/dms-decimal"
                    target="_blank">FCC converter</a>. <br> Then see the green pin’s
                    popup for name suggestions`,
                tooltip: 'Coordinates need to be entered in decimal degrees. Convert ' +
                   'using the FCC converter at https://www.fcc.gov/media/radio/dms-decimal. ' +
                   'Then see the green pin’s popup for name suggestions',
            },
            'DisplayName': {
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
            'HabitatType': {
                intro: 'See Habitat Type Definitions <a href="/definitions" ' +
                    'target="_blank">here</a>.',
                tooltip: 'See Habitat Type Definitions under About in the site menu.'
            },
            'ElevationMax': 'If an elevation range is provided, put the uppermost ' +
                'elevation here.'
        },
        'optional': [],
        'order': {
            'sug': [
                ['Latitude', 'Longitude'],
                ['DisplayName', 'Description'],
                ['Country', 'HabitatType'],
                ['Elevation', 'ElevationMax']
            ],
            'opt': false
        },
        'required': [
            'DisplayName',
            'Country'
        ],
        'suggested': [
            'Description',
            'HabitatType',
            'Latitude',
            'Longitude',
            'Elevation',
            'ElevationMax'
        ]
    };
}