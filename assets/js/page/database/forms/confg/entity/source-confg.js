/**
 * Source-core configuration. Will be merged with the source detail-entity confg
 */
export default function(entity) {
    return {
        fields: getSourceFieldConfg(),
    };
}

function getSourceFieldConfg() {
    return {   //MERGED AND OVERWRITTEN WITH DETAIL.FIELDS
        Authors: {  // handle merging this and editor and their field trans
            entity: 'Contribution',
            misc: {
                customValueStore: true
            },
            name: 'Authors',
            prop: {
                core: 'Contributor'
            },
            type: 'multiSelect',
        },
        Description: {
            name: 'Description',
            prop: { // TODO DRY
                core: 'Description',
                detail: 'Description'
            },
            type: 'textArea',
        },
        DisplayName: {
            name: 'DisplayName',
            prep: {    // TODO: DRY
                setDisplayName: [],
                setDisplayName: ['detail']
            },
            required: true,
            type: 'text',
        },
        Doi: {
            name: 'Doi',
            type: 'doi',
        },
        Editors: {
            entity: 'Contribution',
            misc: {
                customValueStore: true
            },
            name: 'Editors',
            prop: {
                core: 'Contributor'
            },
            type: 'multiSelect'
        },
        ParentSource: {
            entity: 'Source',
            name: 'ParentSource',
            type: 'text',
        },
        SourceType: {
            entity: 'SourceType',
            name: 'SourceType',
            prep: {
                setCoreType: []
            },
            required: true,
            type: null
        },
        Website: {
            name: 'Website',
            prep: { //func: [args]
                renameField: ['LinkUrl'],
            },
            type: 'url',
        },
        Year: {
            class: 'sml-field',
            name: 'Year',
            required: true,
            type: 'year',
        },
    }
}