/**
 * Citation form configuration.
 */
export default function(action, entity) {
	return {
        action: action,
        core: 'Source',
        data: {
            edit: ['source', 'citation', 'author', 'publication', 'publisher']
        },
        fields: getCitationFieldConfg(),
        name: entity,
        type: null,  //Holds type confg once type selected
        types: getCitationTypeConfg(),
        views: { //fields added will be built and displayed.
            all: [  //will be merged with type.views
                ['CitationText'],
                ['Abstract'],
                [ 'Title', 'CitationType' ]
            ],
        }
    };
}
function getCitationFieldConfg() {
    return {
        Abstract: {
            name: 'Abstract',
            prep: {
                setDetailData: []
            },
            prop: {
                detail: 'abstract'
            },
            type: 'fullTextArea',
        },
        CitationText: {
            name: 'CitationText',
            label: 'Citation',
            prep: {    // TODO: DRY
                renameField: ['Description'],
                renameField: ['FullText', 'detail'],
            },
            prop: {
                detail: 'fullText'
            },
            type: 'fullTextArea',
        },
        CitationType: {
            class: 'w-12',
            entity: 'CitationType',
            label: 'Type',
            name: 'CitationType',
            prep: {
                setDetailEntity: []
            },
            prop: {
                detail: 'citationType'
            },
            required: true,
            type: 'select',
        },
        DisplayName: {
            label: 'Title',
            prep: {
                setCitationTitle: []
            },
            required: true,
            prop: {
                detail: 'title'
            },
        },
        Doi: {
            info: {
                tooltip: 'Digital Object Identifier provided by the Publisher',
            }
        },
        Edition: {
            name: 'Edition',
            class: 'w-4 no-grow',
            prep: {    // TODO: DRY
                renameField: ['PublicationVolume', 'detail'],
            },
            prop: {
                detail: 'publicationVolume'
            },
            type: 'num',
        },
        Issue: {
            class: 'w-4 no-grow',
            name: 'Issue',
            prep: {    // TODO: DRY
                renameField: ['PublicationIssue', 'detail'],
            },
            prop: {
                detail: 'publicationIssue'
            },
            type: 'num',
        },
        Pages: {
            class: 'w-8 no-grow',
            name: 'Pages',
            prep: {    // TODO: DRY
                renameField: ['PublicationPages', 'detail'],
            },
            prop: {
                detail: 'publicationPages'
            },
            type: 'page',
        },
        ParentSource: {
            required: true
        },
        SourceType: {  //MERGES WITH CORE.FIELDS. ADDS/OVERWRITES FIELD PROPS
            value: 'Citation'
        },
        Website: {
            info: {
                tooltip: 'Copy and paste link to article, if available',
            }
        },
        Volume: {
            class: 'w-4 no-grow',
            name: 'Volume',
            prep: {    // TODO: DRY
                renameField: ['PublicationVolume', 'detail'],
            },
            prop: {
                detail: 'publicationVolume'
            },
            type: 'num',
        },
        Year: {
            required: true
        }
    };
}
function getCitationTypeConfg() {
    return {
        Article: {
            name: 'Article',
            fields: {
                Author: {
                    required: true
                },
                Year: {
                    required: true
                }
            },
            views: {
                all: [
                    [
                        'Author',
                        {
                            class: 'flex-grow',
                            fields: [
                                ['Year', 'Volume', 'Issue', 'Pages'],
                                'Doi',
                                'Website']
                        }
                    ]
                ]
            }
        },
        Book: {
            name: 'Book',
            fields: {
                Pages: {
                    required: false
                },
                Author: {
                    required: true
                }
            },
            views: {
                all: [
                    ['Edition', 'Doi'],
                    ['Author', 'Website']],
            }
        },
        Chapter: {
            name: 'Chapter',
            fields: {
                // DisplayName: {
                //     label: 'ChapterTitle'
                // }
                Pages: {
                    required: true
                },
                Author: {
                    required: true
                }
            },
            views: {
                all: [
                    ['Pages', 'Doi'],
                    [ 'Author', 'Website']],
            }
        },
        "Master's Thesis": {
            name: "Master's Thesis",
            views: {
                all: [
                    [
                        'Author',
                        {
                            class: 'flex-grow',
                            fields: [
                                'Doi',
                                'Website']
                        }
                    ]
                ]
            }
        },
        'Museum record': {
            name: 'Museum record',
            views: {
                all: [
                    [
                        'Author',
                        {
                            class: 'flex-grow',
                            fields: [
                                ['Year', 'Pages'],
                                'Doi',
                                'Website']
                        }
                    ]
                ]
            }
        },
        Other: {
            fields: {
                'Edition': {
                    label: 'Edition/Volume'
                }
            },
            name: 'Other',
            views: {
                all: [
                    [
                        'Author',
                        {
                            class: 'flex-grow',
                            fields: [
                                ['Year', 'Edition', 'Issue', 'Pages'],
                                'Doi',
                                'Website']
                        }
                    ]
                ]
            }
        },
        'Ph.D. Dissertation': {
            name: 'Ph.D. Dissertation',
            views: {
                all: [
                    [
                        'Author',
                        {
                            class: 'flex-grow',
                            fields: [
                                'Doi',
                                'Website']
                        }
                    ]
                ]
            }
        },
        Report: {
            name: 'Report',
            views: {
                all: [
                    [
                        'Author',
                        {
                            class: 'flex-grow',
                            fields: [
                                ['Year', 'Pages'],
                                'Doi',
                                'Website']
                        }
                    ]
                ]
            }
        }
    };
}