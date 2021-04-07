/**
 * Author/editor form configuration.
 */
export default function(action, entity) {
	return {
        action: action,
        core: 'Source',
        data: {
            edit: ['source', 'author']
        },
        fields: {
            DisplayName: {
                prep: {
                    handleAuthorNames: [],
                },
                prop: {
                    core: 'displayName'
                },
                required: null,
                type: null,
            },
            FirstName: {
                label: 'First',
                name: 'FirstName',
                prop: {
                    detail: 'firstName'
                },
                type: 'text',
            },
            MiddleName: {
                label: 'Middle',
                name: 'MiddleName',
                prop: {
                    detail: 'middleName'
                },
                type: 'text',
            },
            LastName: {
                type: 'text',
                name: 'LastName',
                prop: {
                    detail: 'lastName'
                },
                required: true
            },
            Suffix: {
                class: 'w-4',
                type: 'text',
                name: 'Suffix',
                prop: {
                    detail: 'suffix'
                },
            },
            SourceType: {
                value: 'Author'
            }
        },
        name: entity,
        views: { //fields added will be built and displayed
            all: [
                ['LastName'],
                ['FirstName'],
                ['MiddleName', 'Suffix'],
                ['Website'],
                ['Description'],
            ],
            simple: [
                ['LastName'],
                ['FirstName'],
                ['MiddleName', 'Suffix']
            ]
        }
    };
}