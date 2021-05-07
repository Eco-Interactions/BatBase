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
        Author: {  // handle merging this and editor and their field trans
            count: 1,
            entity: 'Contributor',
            label: false,
            misc: {
                customValueStore: true
            },
            prop: {
                core: 'authors'
            },
            name: 'Author',
            type: 'multiSelect',
        },
        Description: {
            name: 'Description',
            prep: {    // TODO: DRY
                setCoreAndDetail: [],
            },
            prop: {
                detail: 'description'
            },
            type: 'textArea',
        },
        DisplayName: {
            name: 'DisplayName',
            prop: {
                core: 'displayName'
            },
            required: true,
            type: 'text',
        },
        Doi: {
            label: 'DOI',
            name: 'Doi',
            prop: {
                core: 'doi'
            },
            type: 'doi',
        },
        Editor: {
            count: 1,
            entity: 'Contributor',
            label: false,
            misc: {
                customValueStore: true
            },
            name: 'Editor',
            prop: {
                core: 'editors'
            },
            type: 'multiSelect',
        },
        ParentSource: {
            entity: 'Source',
            name: 'ParentSource',
            prep: {
                setParent: ['Source']
            },
            prop: {
                core: 'parent'
            },
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
            prop: {
                core: 'linkUrl'
            },
            type: 'url',
        },
        Year: {
            class: 'w-4 no-grow',
            name: 'Year',
            prop: {
                core: 'year'
            },
            type: 'year',
        },
    }
}