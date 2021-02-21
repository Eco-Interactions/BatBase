/**
 * Author/editor form configuration.
 */
export default function(entity) {
	return {
        core: 'source',
        fields: {
            FirstName: {
                type: 'text',
                name: 'FirstName'
            },
            MiddleName: {
                type: 'text',
                name: 'MiddleName'
            },
            LastName: {
                type: 'text',
                name: 'LastName',
                required: true
            },
            Suffix: {
                type: 'text',
                name: 'Suffix'
            },
            SourceType: {
                entity: 'SourceType',
                name: 'SourceType',
                required: true,
                type: 'text',
                value: '' //TOOD
            }
        },
        name: entity,
        views: { //fields added will be built and displayed
            all: [
                'FirstName',
                'MiddleName',
                'LastName',
                'Suffix',
                'Website',
            ],
            simple: [
                'FirstName',
                'MiddleName',
                'LastName',
                'Suffix'
            ]
        }
    };
}