/**
 * Author form configuration.
 */
export default function(entity) {
	return {
        'add': {
            'FirstName': 'text',
            'MiddleName': 'text',
            'LastName': 'text',
            'Suffix': 'text'
        },
        'required': [
            'LastName'
        ],
        'suggested': [
            'FirstName',
            'MiddleName',
            'Suffix'
        ],
        'optional': [
            'Website',
        ],
        'order': {
            'sug': [
                'FirstName',
                'MiddleName',
                'LastName',
                'Suffix'
            ],
            'opt': [
                'FirstName',
                'MiddleName',
                'LastName',
                'Suffix',
                'Website',
            ]
        }
    };
}