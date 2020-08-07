/**
 * Publisher form configuration.
 */
export default function() {
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
            'LinkUrl',
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
                'LinkUrl',
            ]
        }
    };
}