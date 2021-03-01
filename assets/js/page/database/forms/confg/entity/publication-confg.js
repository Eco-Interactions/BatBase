/**
 * Publication form configuration.
 */
export default function(entity) {
	return {
        core: 'source',
        fields: getPublicationFieldConfg(),
        name: entity,
        type: null,  //Holds type confg once type selected
        types: getPublicationTypeConfg(),
        views: { //fields added will be built and displayed.
            all: [  //will be merged with type.views  //merge here rather than later?
                ['Title', 'Year', 'PublicationType'],
                [ 'Description', { fields: ['Doi', 'Website'] }],
            ],
            simple: [
                ['Title', 'Year', 'PublicationType']
            ]
        },
    };
}
function getPublicationFieldConfg() {
    return {
        Doi: {//Source field
            info: {
                tooltip: 'Digital Object Identifier provided by the Publisher',
            }
        },
        PublicationType: {
            entity: 'PublicationType',
            name: 'PublicationType',
            type: 'select',
            required: true
        },
        Publisher: {
            entity: 'Source',
            name: 'Publisher',
            type: 'select',
        },
        SourceType: {//Source field
            value: 'Publisher'
        },
        DisplayName: { //Source field
            label: 'Title',
            // type: 'text',
        },
        Website: {//Source field
            info: {
                tooltip: 'Copy and paste link to publication, if available',
            }
        }
    };
}

function getPublicationTypeConfg() {
    return  {
        Book: {
            name: 'Book',
            fields: {
                Author: {
                    required: true
                },
                Year: {
                    required: true
                },
                Editor: {
                    required: true
                },
                Publisher: {
                    prep: {
                        setParent: ['Source']
                    },
                    required: true
                }
            },
            views: {
                all: [
                    ['Publisher', 'Author', 'Editor']
                ]
            }
        },
        Journal: {
            name: 'Journal',
            required: [],
            views: {
                all: [
                    ['Publisher']
                ],
                simple: [] // No fields added unless 'show all fields' selected
            }
        },
        Other: {
            name: 'Other',
            fields: {
                Author: {
                    required: true
                },
                Year: {
                    required: true
                }
            },
            views:  {
                all: [
                    ['Publisher', 'Author', 'Editor']
                ],
                simple: [
                    ['Author', 'Editor']
                ],
            }
        },
        'Thesis/Dissertation': {
            name: 'Thesis/Dissertation',
            fields:{
                Author: {
                    required: true
                },
                Publisher: {
                    prep: {
                        setParent: ['Source']
                    },
                    required: true
                },
                Year: {
                    required: true
                }
            },
            views:  {
                all: [
                    ['Publisher', 'Author'],
                ]
            }
        }
    };
}