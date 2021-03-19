/**
 * Author/editor form configuration.
 */
export default function(entity) {
	return {
        core: 'source',
        fields: {
            FirstName: {
                label: 'First',
                name: 'FirstName',
                type: 'text',
            },
            MiddleName: {
                label: 'Middle',
                name: 'MiddleName',
                type: 'text',
            },
            LastName: {
                type: 'text',
                name: 'LastName',
                required: true
            },
            Suffix: {
                class: 'w-4',
                type: 'text',
                name: 'Suffix'
            },
            SourceType: {
                value: 'Author'
            }
        },
        name: entity,
        style: 'sml-form',
        views: { //fields added will be built and displayed
            all: [
                ['LastName', 'Suffix'],
                ['FirstName', 'MiddleName'],
                ['Website'],
                ['Description'],
            ],
            simple: [
                ['LastName', 'Suffix'],
                ['FirstName', 'MiddleName']
            ]
        }
    };
}