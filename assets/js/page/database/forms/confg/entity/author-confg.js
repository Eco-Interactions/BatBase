/**
 * Author/editor form configuration.
 */
export default function(entity) {
	return {
        core: 'source',
        fields: {
            FirstName: {
                class: 'sml-field',
                label: 'First',
                name: 'FirstName',
                type: 'text',
            },
            MiddleName: {
                class: 'sml-field',
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
                class: 'xsml-field',
                type: 'text',
                name: 'Suffix'
            },
            SourceType: {
                value: 'Author'
            }
        },
        name: entity,
        views: { //fields added will be built and displayed
            all: [
                ['LastName'],
                ['FirstName', 'MiddleName', 'Suffix'],
                ['Website'],
                ['Description'],
            ],
            simple: [
                ['LastName'],
                ['FirstName', 'MiddleName', 'Suffix']
            ]
        }
    };
}