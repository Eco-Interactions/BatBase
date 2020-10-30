/**
 * Publisher form configuration.
 */
export default function(entity) {
	return {
        'add': {
            'City': 'text',
            'Country': 'text'
        },
        'required': [
            'DisplayName',
            'City',
            'Country'
        ],
        'suggested': [],
        'optional': [
            'Description',
            'Website',
        ],
        'order': {
            'sug': [
                'DisplayName',
                'City',
                'Country'
            ],
            'opt': [
                'DisplayName',
                'City',
                'Country',
                'Description',
                'Website',
            ]
        }
    };
}