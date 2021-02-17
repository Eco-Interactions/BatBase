/**
 * Publisher form configuration.
 */
export default function(entity) {
	return {
        core: 'source',
        fields: {
            City: {
                name: 'City',
                required: true,
                type: 'text'
            },
            Country: {
                name: 'Country',
                required: true,
                type: 'text'
            },
        },
        views: {
            all: [
                'DisplayName',
                'City',
                'Country',
                'Description',
                'Website',
            ],
            simple: [
                'DisplayName',
                'City',
                'Country'
            ],
        }
    };
}