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
            DisplayName: {
                label: 'Name'
            },
            Country: {
                name: 'Country',
                required: true,
                type: 'text'
            },
            SourceType: {
                value: 'Publisher'
            }
        },
        name: entity,
        views: {
            all: [{
                fields: [
                    'DisplayName',
                    'City',
                    'Country',
                    'Website',
                    'Description'
            ]}],
            simple:[{
                fields: [
                    'DisplayName',
                    'City',
                    'Country',
            ]}],
        }
    };
}