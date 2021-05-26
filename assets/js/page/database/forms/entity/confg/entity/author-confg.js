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
                prop: {
                    core: 'displayName'
                },
                type: null,
            },
            FirstName: {
                label: 'First',
                name: 'FirstName',
                prep: {
                    setDetailData: []
                },
                prop: {
                    detail: 'firstName'
                },
                type: 'text',
            },
            MiddleName: {
                label: 'Middle',
                name: 'MiddleName',
                prep: {
                    setDetailData: []
                },
                prop: {
                    detail: 'middleName'
                },
                type: 'text',
            },
            LastName: {
                type: 'text',
                name: 'LastName',
                prep: {
                    handleAuthorNames: [],
                    setDetailData: []
                },
                prop: {
                    detail: 'lastName'
                },
                required: true
            },
            Suffix: {
                class: 'w-4',
                type: 'text',
                name: 'Suffix',
                prep: {
                    setSuffix: []
                },
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