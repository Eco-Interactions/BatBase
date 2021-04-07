/**
 * Publisher form configuration.
 */
export default function(action, entity) {
	return {
        action: action,
        core: 'Source',
        data: {
            edit: ['source', 'publisher']
        },
        fields: {
            City: {
                name: 'City',
                prop: {
                    detail: 'city'
                },
                required: true,
                type: 'text'
            },
            DisplayName: {
                label: 'Name',
                prop: {
                    core: 'displayName'
                },
            },
            Country: {
                name: 'Country',
                prop: {
                    detail: 'country'
                },
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
                ['DisplayName'],
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