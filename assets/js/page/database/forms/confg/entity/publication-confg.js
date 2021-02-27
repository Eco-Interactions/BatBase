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
                ['Title', 'PublicationType']
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
                Authors: {
                    required: true
                },
                Year: {
                    required: true
                },
                Editors: {
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
                    ['Year', 'Doi', 'Website'],
                    ['Publisher', 'Description'],
                    ['Authors', 'Editors']
                ],
                simple: [
                    ['Year', 'Publisher'],
                    ['Authors', 'Editors']
                ],
            }
        },
        Journal: {
            name: 'Journal',
            required: [],
            views: {
                all: [
                    ['Year', 'Doi', 'Website'],
                    ['Publisher', 'Description'],
                ],
                simple: [], //No additional fields shown
            }
        },
        Other: {
            name: 'Other',
            fields: {
                Authors: {
                    required: true
                },
                Year: {
                    required: true
                }
            },
            views:  {
                all: [
                    ['Year', 'Doi', 'Website'],
                    ['Publisher', 'Description'],
                    ['Authors'],
                ],
                simple: [
                    ['Year', 'Publisher'],
                    ['Authors']
                ],
            }
        },
        'Thesis/Dissertation': {
            name: 'Thesis/Dissertation',
            fields:{
                Authors: {
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
                    ['Year', 'Doi', 'Website'],
                    ['Publisher', 'Description'],
                    ['Authors']
                ],
                simple: [
                    ['Year', 'Publisher'],
                    ['Authors']
                ],
            }
        }
    };
}