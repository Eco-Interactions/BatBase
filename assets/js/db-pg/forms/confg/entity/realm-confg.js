/**
 * Configuration related to realm display throughout the forms.
 * NOTE: There is no Realm form.
 */
export default function getRealmInteractionTypes() {
	return {
		'Amphibian': [
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
}