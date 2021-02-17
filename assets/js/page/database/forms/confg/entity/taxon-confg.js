/**
 * Taxon form configuration.
 */
export default function(entity) {
	return {
        fields: {
            DisplayName: {
                name: DisplayName,
                required: true
            },
            Name: {
                name: 'Name',
                required: true,
                type: 'text',

            },
            ParentTaxon: {
                required: true
            },
            Rank: {
                entity: 'Rank',
                required: true
            }
            // 'group': relationship... might not be needed
        },
        views: {
            all: [
                'DisplayName'
            ]
        }
    };
}