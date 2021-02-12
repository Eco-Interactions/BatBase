/**
 * Interaction form configuration.
 */
export default function(entity) {
	return {
        'add': {},
        'defaultTags': ['Secondary'], //Always valid and available when tags load.
        'info': {
            'Subject': {
                tooltip: 'Bats are always the subject. Check bat taxonomy and names ' +
                'at www.batnames.org. ' +
                'If the name in the publication is no longer accepted, use the currently' +
                'accepted name and note the name used in the publication in the Notes Field.',
                intro: 'Bats are always the subject. Check bat taxonomy and names ' +
                'at <a href="www.batnames.org" target="_blank">www.batnames.org</a>. ' +
                'If the name in the publication is no longer accepted, use the currently' +
                'accepted name and note the name used in the publication in the Notes Field.',
            },
            'InteractionType': {
                tooltip: 'Read about Interaction Types on the About->Definitions page.',
                intro: `Read about Interaction Types on the <a href="/definitions"
                    target="_blank">Definitions page</a>.`
            },
            'InteractionTags': 'Tags indicate the part of the object organism in the interaction'
        },
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
        },
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
        ]
    };
}