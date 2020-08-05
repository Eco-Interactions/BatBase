/**
 * Location form configuration.
 */
export default function() {
	return {
        'add': {},
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
        ],
        'optional': [],
        'order': {
            'sug': [
                ['Latitude', 'Longitude'],
                ['DisplayName', 'Description'],
                ['Country', 'HabitatType'],
                ['Elevation', 'ElevationMax']
            ],
            'opt': false
        }
    };
}