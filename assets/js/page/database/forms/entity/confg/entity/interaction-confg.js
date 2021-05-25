/**
 * Interaction form configuration.
 */
export default function(action, entity) {
	return {
        action: action,
        fields: getInteractionFieldConfg(),
        data: {
            create: ['author', 'citation', 'group', 'interactionType', 'location', 'publication',
                'publisher', 'rankNames', 'source', 'tag', 'taxon', 'validInteraction'],
            edit: ['author', 'citation', 'group', 'interaction', 'interactionType', 'location',
                'publication', 'publisher', 'rankNames', 'source', 'tag', 'taxon', 'validInteraction'],
        },
        name: entity,
        pinnable: action === 'create', // phrasing?
        style: 'lrg-form',
        views: {
            all: [
                ['Publication', 'CitationTitle'],
                ['Country-Region', 'Location'],
                ['Subject', 'Object'],
                ['InteractionType','InteractionTags'],
                ['Note']
            ],
        },
    };
}
function getInteractionFieldConfg() {
    return {
        Publication: {
            entity: 'Publication',
            name: 'Publication',
            prep: {},
            type: 'select'
        },
        CitationTitle: {
            entity: 'Source',
            name: 'CitationTitle',
            prep: { //func: [args]
                renameField: ['Source'],  //TODO: maybe not necessary because refernce values might be set with the entity prop
            },
            prop: {
                core: 'source'
            },
            required: true,
            type: 'select'
        },
        'Country-Region': {
            id: 'Country-Region', //label is used for id, but '/' is an invalid selector character
            label: 'Country/Region',
            name: 'Country-Region',
            prep: {},
            type: 'select'
        },
        Location: {
            entity: 'Location',
            name: 'Location',
            prop: {
                core: 'location'
            },
            type: 'select',
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
            prep: {
                renameField: ['Subject']
            },
            prop: {
                core: 'subject'
            },
            required: true,
            type: 'select'
        },
        Object: {
            entity: 'Taxon',
            name: 'Object',
            prep: {
                renameField: ['Object']
            },
            prop: {
                core: 'object'
            },
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
            label: 'Type',
            misc: {
                customValueStore: true
            },
            name: 'InteractionType',
            prop: {
                core: 'interactionType'
            },
            required: true,
            type: 'select'
        },
        InteractionTags: {
            entity: 'Tag',
            info: {
                tooltip: 'Tags indicate the part of the object organism in the interaction'
            },
            label: 'Tags',
            misc: {
                defaultTags: ['Secondary'], //Always valid and available when tags load.
            },
            name: 'InteractionTags',
            prep: {
                validateTags: []
            },
            prop: {
                core: 'tags'
            },
            type: 'tags'
        },
        Note: {
            clss: 'flex-grow',
            name: 'Note',
            prop: {
                core: 'note'
            },
            type: 'fullTextArea'
        },
    };
}