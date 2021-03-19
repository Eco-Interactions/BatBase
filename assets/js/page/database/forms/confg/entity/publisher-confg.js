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
        style: 'sml-form',
        views: {
            all: [
                ['DisplayName',]
                ['City'],
                ['Country'],
                ['Website'],
                ['Description']
            ],
            simple:[
                ['DisplayName'],
                ['City'],
                ['Country'],
            ],
        }
    };
}