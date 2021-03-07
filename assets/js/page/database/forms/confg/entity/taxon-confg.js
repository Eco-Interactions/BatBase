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
        views: {
            all: [
                ['DisplayName']
            ]
        }
    };
}