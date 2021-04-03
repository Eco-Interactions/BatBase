/**
 * Publisher form configuration.
 */
export default function(entity) {
	return {
        core: 'Source',
        data: {
            edit: ['source', 'publisher']
        },
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