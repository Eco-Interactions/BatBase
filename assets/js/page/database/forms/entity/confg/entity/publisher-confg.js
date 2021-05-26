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
                prep: {
                    setDetailData: []
                },
                prop: {
                    detail: 'city'
                },
                required: true,
                type: 'text'
            },
            DisplayName: {
                label: 'Name',
                prep: {
                    setCoreAndDetail: []
                },
                prop: {
                    core: 'displayName'
                },
                required: true,
            },
            Country: {
                name: 'Country',
                prep: {
                    setDetailData: []
                },
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