/**
 * Taxon form configuration.
 */
export default function(entity) {
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