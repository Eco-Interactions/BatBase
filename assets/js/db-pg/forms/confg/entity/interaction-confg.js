/**
 * Interaction form configuration.
 */
export default function() {
	return {
        'add': {},
        'required': [
            'Publication',
            'CitationTitle',
            'Country-Region',
            'Location',
            'Subject',
            'Object',
            'InteractionType'
        ],
        'suggested': [
            'InteractionTags',
            'Note'
        ],
        'optional': [],
        'order': {
            'sug': [
                ['Publication', 'CitationTitle'],
                ['Country-Region', 'Location'],
                ['Subject', 'Object'],
                ['InteractionType','InteractionTags'],
                'Note'
            ],
            'opt': false
        }
    };
}