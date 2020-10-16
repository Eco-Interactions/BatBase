/**
 * Taxon form configuration.
 */
export default function() {
	return {
        'add': {},
        'required': [
            'DisplayName'
        ],
        'suggested': [],
        'optional': [],
        'order': {
            'sug': [
                'DisplayName'
            ],
            'opt': false
        },
        'groups': {
            'Amphibian': [ /* Interaction Types */
                'Predation',
                'Prey'
            ],
            'Arthropod': [
                'Transport',
                'Predation',
                'Prey',
                'Host',
                'Cohabitation'
            ],
            'Bacteria': [
                'Host'
            ],
            'Bird': [
                'Predation',
                'Prey',
                'Cohabitation'
            ],
            'Fish': [
                'Predation',
                'Prey'
            ],
            'Fungi': [
                'Host',
                'Consumption'
            ],
            'Mammal': [
                'Predation',
                'Prey',
                'Cohabitation'
            ],
            'Other Parasite': [
                'Host'
            ],
            'Plant': [
                'Visitation',
                'Pollination',
                'Seed Dispersal',
                'Consumption',
                'Transport',
                'Roost'
            ],
            'Reptile': [
                'Predation',
                'Prey'
            ],
            'Virus': [
                'Host'
            ]
        }
    };
}