/**
 * Source-core configuration. Will be merged with the source detail-entity confg
 */
export default function(entity) {
    return {
        fields: {   //MERGED AND OVERWRITTEN WITH DETAIL.FIELDS
            Authors: {  // handle merging this and editor and their field trans
                entity: 'Contribution',
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
                prop: { // TODO DRY
                    core: 'DisplayName',
                    detail: 'DisplayName'
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
                required: true,
                type: null, //not shown??
            },
            Website: {
                name: 'Website',
                prop: {
                    core: 'LinkUrl'
                },
                type: 'url',
            },
            Year: {
                name: 'Year',
                required: true,
                type: 'year',
            },
        }
    };
}