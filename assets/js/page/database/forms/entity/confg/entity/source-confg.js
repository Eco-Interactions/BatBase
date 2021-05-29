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
            prep: {
                setContributors: []
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
                setCoreData: [],
            },
            prop: {
                detail: 'description'
            },
            type: 'textArea',
        },
        DisplayName: {
            name: 'DisplayName',
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
            prep: {},
            prop: {
                core: 'editors'
            },
            type: 'multiSelect',
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