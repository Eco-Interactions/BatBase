/**
 * Author form configuration.
 */
export default function() {
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
            'LinkUrl',
            'LinkDisplay'
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
                'LinkUrl',
                'LinkDisplay'
            ]
        }
    };
}