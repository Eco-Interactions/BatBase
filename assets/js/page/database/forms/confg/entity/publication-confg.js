/**
 * Publication form configuration.
 */
export default function(entity) {
	return {
        core: 'source',
        views: { //fields added will be built and displayed.
            all: [  //will be merged with type.views
                ['Title', 'PublicationType']
            ],
        },
        fields: {
            Doi: {
                info: {
                    tooltip: 'Digital Object Identifier provided by the Publisher',
                }
            },
            ParentSource: {
                required: true, //Publisher
            },
            PublicationType: {
                entity: 'PublicationType',
                name: 'PublicationType',
                type: 'select',
                required: true
            },
            Publisher: {   // MERGE WITH TITLE
                entity: 'Source',
                name: 'Publisher',
                // prop: {    // TODO: DRY
                //     core: ['DisplayName'],
                //     detail: ['DisplayName', 'Title'],
                // },
                type: 'select',
            },
            SourceType: {
                value: '' //TODO
            },
            Title: {
                name: 'Title',
                prop: {    // TODO: DRY
                    core: ['DisplayName'],
                    detail: ['DisplayName'],
                },
                required: true,
                type: 'text',
            },
            Website: {
                info: {
                    tooltip: 'Copy and paste link to publication, if available',
                }
            }
        },
        types: {
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
                        required: true
                    }
                },
                views: {
                    all: [
                        ['Year', 'Doi'],
                        ['Website', 'Description'],
                        ['Publisher'],
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
                        ['Year', 'Doi'],
                        ['Website', 'Description'],
                        ['Publisher'],
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
                        ['Year', 'Doi'],
                        ['Website', 'Description'],
                        ['Publisher', 'Authors'],
                    ],
                    simple: [
                        ['Year', 'Publisher'],
                        'Authors'
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
                        required: true
                    },
                    Year: {
                        required: true
                    }
                },
                views:  {
                    all: [
                        ['Year', 'Doi'],
                        ['Website', 'Description'],
                        ['Publisher', 'Authors'],
                    ],
                    simple: [
                        ['Year', 'Publisher'],
                        'Authors'
                    ],
                }
            }
        }
    };
}