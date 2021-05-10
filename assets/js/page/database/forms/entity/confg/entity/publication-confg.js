/**
 * Publication form configuration.
 */
export default function(action, entity) {
	return {
        action: action,
        core: 'Source',
        data: {
            edit: ['source', 'publication', 'author', 'publisher']
        },
        fields: getPublicationFieldConfg(),
        name: entity,
        type: null,  //Holds type confg once type selected
        types: getPublicationTypeConfg(),
        views: { //fields added will be built and displayed.
            all: [  //will be merged with type.views  //merge here rather than later?
                ['Title', 'Year', 'PublicationType'],
                [ { fields: ['Doi', 'Website'] }, 'Description'],
            ],
            simple: [
                ['Title', 'Year', 'PublicationType']
            ]
        },
    };
}
function getPublicationFieldConfg() {
    return {
        Author: {
            required: true
        },
        DisplayName: { //Source field
            label: 'Title',
            prep: {
                setDetailData: [],
                setCoreData: []
            },
            prop: {
                core: 'displayName'
            },
        },
        Doi: {//Source field
            info: {
                tooltip: 'Digital Object Identifier provided by the Publisher',
            }
        },
        PublicationType: {
            class: 'no-grow w-12',
            entity: 'PublicationType',
            label: 'Type',
            name: 'PublicationType',
            prep: {
                setDetailEntity: []
            },
            prop: {
                detail: 'publicationType'
            },
            type: 'select',
            required: true
        },
        Publisher: {
            entity: 'Source',
            name: 'Publisher',
            prep: {
                setParent: ['Source']
            },
            prop: {
                core: 'parent'
            },
            type: 'select',
        },
        SourceType: {//Source field
            value: 'Publication'
        },
        Website: {//Source field
            info: {
                tooltip: 'Copy and paste link to publication, if available',
            }
        },
        Year: {
            required: true
        }
    };
}

function getPublicationTypeConfg() {
    return  {
        Book: {
            name: 'Book',
            fields: {
                Editor: {
                    required: true
                },
                Publisher: {
                    required: true
                }
            },
            misc: {
                defaultCitType: null //If publication has authors: 'Book', otherwise: 'Chapter'
            },
            views: {
                all: [
                    ['Author', 'Editor', 'Publisher']
                ]
            }
        },
        Journal: {
            name: 'Journal',
            misc: {
                defaultCitType: 'Article'
            },
            views: {
                all: [
                    ['Publisher', '']
                ],
                simple: [] // No fields added unless 'show all fields' selected
            }
        },
        Other: { //Most broad options available
            name: 'Other',
            misc: {
                defaultCitType: 'Other'
            },
            views:  {
                all: [
                    ['Author', 'Publisher']
                ]
            }
        },
        'Thesis/Dissertation': {
            name: 'Thesis/Dissertation',
            fields:{
                Publisher: {
                    required: true
                },
            },
            misc: {
                defaultCitType: 'Ph.D. Dissertation'
            },
            views:  {
                all: [
                    ['Author', 'Publisher']
                ]
            }
        }
    };
}