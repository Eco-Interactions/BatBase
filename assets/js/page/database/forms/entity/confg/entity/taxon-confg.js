/**
 * Taxon form configuration.
 *
 * Two form "types": create (name field), edit (name, rank, parent fields)
 */
export default function(action, entity) {
	return {
        action: action,
        data: {
            edit: ['group', 'orderedRanks', 'rankNames', 'taxon']
        },
        fields: {
            DisplayName: {
                label: 'Name',
                name: 'DisplayName',
                prep: {
                    renameField: ['Name'],
                    buildTaxonDisplayName: []
                },
                prop: {
                    core: 'name'
                },
                required: true,
                type: 'text',
            },
            Parent: {
                entity: 'Taxon',
                name: 'Parent',
                prep: {
                    setParent: ['Taxon']
                },
                prop: {
                    core: 'parent'
                },
                required: true,
                type: 'select'
            },
            Group: {
                name: 'Group',
                prep: {},
                prop: {
                    core: 'group'
                }
            },
            'Sub-Group': {
                name: 'Sub-Group',
                prep: {},
            },
            Rank: {
                entity: 'Rank',
                name: 'Rank',
                prop: {
                    core: 'rank'
                },
                required: true,
                type: 'select'
            }
        },
        name: entity,
        types: {
            create: {
                views: {
                    all: [
                        ['Name']
                    ]
                }
            },
            edit: {
                views: {
                    all: [
                        ['Name'],
                        ['Rank'],
                        ['Parent'],
                    ]
                }
            }
        },
        views: {
            all: []
        }
    };
}