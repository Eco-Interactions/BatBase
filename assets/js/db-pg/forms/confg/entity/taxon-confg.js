/**
 * Taxon form configuration.
 */
export default function() {
	return {
        'add': {},
        'required': [
            'DisplayName'
        ],
        'suggested': [],
        'optional': [],
        'order': {
            'sug': [
                'DisplayName'
            ],
            'opt': false
        }
    };
}