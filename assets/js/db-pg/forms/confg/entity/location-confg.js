/**
 * Location form configuration.
 */
export default function() {
	return {
        'add': {},
        'info': {
            'Latitude': 'Coordinates need to be entered in decimal degrees. Convert' +
                'using the <a href="https://www.fcc.gov/media/radio/dms-decimal"' +
                'target="_blank">FCC converter</a>.',
            'Longitude': 'Coordinates need to be entered in decimal degrees. Convert' +
                'using the <a href="https://www.fcc.gov/media/radio/dms-decimal"' +
                'target="_blank">FCC converter</a>.',
            'DisplayName': 'Use the formal name of the location. If it doesn’t' +
                'have a formal name, use the following format to create a unique' +
                'name using as many descriptors as applicable: [Habitat type],' +
                '[Landmark, or “Near” Landmark], [Town/City, or “Near” Town/City],' +
                '[Province or State]',
            'HabitatType': 'See Habitat Type Definitions <a href="/definitions"' +
                'target="_blank">here</a>.',
            'ElevationMax': 'If an elevation range is provided, put the uppermost' +
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