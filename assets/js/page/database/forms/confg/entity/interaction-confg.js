/**
 * Interaction form configuration.
 */
export default function(entity) {
	return {
        fields: {
            Publication: {
                entity: 'Publication',
                name: 'Publication',
                // required: true,
                type: 'select'
            },
            CitationTitle: {
                entity: 'Source',
                name: 'CitationTitle',
                prop: {
                    core: 'Source',
                },
                required: true,
                type: 'select'
            },
            'Country-Region': {
                name: 'Country-Region',
                // required: true,
                type: 'select'
            },
            Location: {
                entity: 'Publication',
                name: 'Location',
                required: true,
                type: 'select'
            },
            Subject: {
                entity: 'Taxon',
                info: {  //@TODO
                    tooltip: 'Bats are always the subject. Check bat taxonomy and names ' +
                    'at www.batnames.org. ' +
                    'If the name in the publication is no longer accepted, use the currently' +
                    'accepted name and note the name used in the publication in the Notes Field.',
                    intro: 'Bats are always the subject. Check bat taxonomy and names ' +
                    'at <a href="www.batnames.org" target="_blank">www.batnames.org</a>. ' +
                    'If the name in the publication is no longer accepted, use the currently' +
                    'accepted name and note the name used in the publication in the Notes Field.',
                },
                name: 'Subject',
                required: true,
                type: 'select'
            },
            Object: {
                entity: 'Taxon',
                name: 'Object',
                required: true,
                type: 'select'
            },
            InteractionType: {
                entity: 'InteractionType',
                info: {
                    tooltip: 'Read about Interaction Types on the About->Definitions page.',
                    intro: `Read about Interaction Types on the <a href="/definitions"
                        target="_blank">Definitions page</a>.`
                },
                name: 'InteractionType',
                required: true,
                type: 'select'
            },
            InteractionTags: {
                defaultTags: ['Secondary'], //Always valid and available when tags load.
                entity: 'Tag',
                info: {
                    tooltip: 'Tags indicate the part of the object organism in the interaction'
                },
                name: 'InteractionTags',
                // required: true,
                type: 'tags'
            },
            Note: {
                name: 'Note',
                required: true,
                type: 'fullTextArea'
            },
        },
        // 'add': {},
        // 'info': {
        //     'Subject':
        //     'InteractionType':
        //     'InteractionTags':
        // },
        // 'optional': [],
        views: {
            all: [
                ['Publication', 'CitationTitle'],
                ['Country-Region', 'Location'],
                ['Subject', 'Object'],
                ['InteractionType','InteractionTags'],
                'Note'
            ],
            // 'opt': false
        },
        // 'required': [
        //     'Publication',
        //     'CitationTitle',
        //     'Country-Region',
        //     'Location',
        //     'Subject',
        //     'Object',
        //     'InteractionType'
        // ],
        // 'suggested': [
        //     'InteractionTags',
        //     'Note'
        // ]
    };
}