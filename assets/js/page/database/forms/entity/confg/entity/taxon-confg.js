/**
 * Taxon form configuration.
 */
export default function(entity) {
	return {
        data: {
            edit: ['group', 'rankNames', 'taxon']
        },
        fields: {
            DisplayName: {
                name: 'DisplayName',
                required: true
            },
            Name: {
                name: 'Name',
                required: true,
                type: 'text',

            },
            ParentTaxon: {
                prep: {
                    setParent: ['Taxon']
                },
                required: true
            },
            Rank: {
                entity: 'Rank',
                required: true
            }
        },
        name: entity,
        style: 'sml-form',
        views: {
            all: [
                ['Name']
            ]
        }
    };
}