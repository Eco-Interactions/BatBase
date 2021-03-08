/**
 * Citation form configuration.
 */
export default function(entity) {
	return {
        core: 'source',
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
            type: 'fullTextArea',
        },
        CitationText: {
            name: 'CitationText',
            label: 'Citation',
            required: true,
            prep: {    // TODO: DRY
                renameField: ['Description'],
                renameField: ['FullText', 'detail'],
            },
            type: 'fullTextArea',
        },
        CitationType: {
            class: 'w-12',
            entity: 'CitationType',
            label: 'Type',
            name: 'CitationType',
            required: true,
            type: 'select',
        },
        Doi: {
            info: {
                tooltip: 'Digital Object Identifier provided by the Publisher',
            }
        },
        Edition: {
            class: 'w-8',
            name: 'Edition',
            prep: {    // TODO: DRY
                renameField: ['PublicationVolume', 'detail'],
            },
            type: 'num',
        },
        Issue: {
            class: 'w-8',
            name: 'Issue',
            prep: {    // TODO: DRY
                renameField: ['PublicationIssue', 'detail'],
            },
            type: 'num',
        },
        Pages: {
            name: 'Pages',
            prep: {    // TODO: DRY
                renameField: ['PublicationPages', 'detail'],
            },
            type: 'page',
        },
        ParentSource: {
            prep: {
                setParent: ['Source']
            },
            required: true,
            value: 'Publication'
        },
        SourceType: {  //MERGES WITH CORE.FIELDS. ADDS/OVERWRITES FIELD PROPS
            value: 'Citation'
        },
        DisplayName: {
            label: 'Title'
        },
        Website: {
            info: {
                tooltip: 'Copy and paste link to article, if available',
            }
        },
        Volume: {
            class: 'w-8',
            name: 'Volume',
            prep: {    // TODO: DRY
                renameField: ['PublicationVolume', 'detail'],
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
                    required: true
                },
                Author: {
                    required: true
                }
            },
            views: {
                all: [
                    ['Volume', 'Doi'],
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
                    ['Doi', 'Website']],
            }
        },
        'Museum record': {
            name: 'Museum record',
            views: {
                all: [
                    ['Year', 'Pages', 'Doi'],
                    ['Author', 'Website']
                ]
            }
        },
        Other: {
            name: 'Other',
            views: {
                all: [
                    ['Year', 'Volume', 'Issue', 'Pages'],
                    ['Author', { fields: ['Doi', 'Website'] }]
                ]
            }
        },
        'Ph.D. Dissertation': {
            name: 'Ph.D. Dissertation',
            views: {
                all: [
                    ['Website','Doi']],
            }
        },
        Report: {
            name: 'Report',
            views: {
                all: [
                    ['Year', 'Volume', 'Issue', 'Pages'],
                    ['Author', { fields: ['Doi', 'Website'] }]
                ]
            }
        }
    };
}