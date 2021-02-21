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
                'CitationText',
                'Abstract',
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
        ChapterTitle: {   // MERGE WITH TITLE
            name: 'ChapterTitle',
            prop: {    // TODO: DRY
                core: ['DisplayName'],
                detail: ['DisplayName', 'Title'],
            },
            type: 'text',
        },
        CitationText: {
            name: 'CitationText',
            required: true,
            prop: {    // TODO: DRY
                core: ['Description'],
                detail: ['fullText'],
            },
            type: 'fullTextArea',
        },
        CitationType: {
            entity: 'CitationType',
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
            name: 'Edition',
            prop: {
                detail: 'PublicationVolume'
            },
            type: 'num',
        },
        Issue: {
            name: 'Issue',
            prop: {
                detail: 'PublicationIssue'
            },
            type: 'num',
        },
        Pages: {
            name: 'Pages',
            prop: {
                detail: 'PublicationPages'
            },
            type: 'page',
        },
        ParentSource: {
            required: true, //Publication
        },
        SourceType: {  //MERGES WITH CORE.FIELDS. ADDS/OVERWRITES FIELD PROPS
            value: '' //TODO
        },
        Title: {
            name: 'Title',
            prop: {    // TODO: DRY
                core: ['Description'],
                detail: ['FullText', 'Title'],
            },
            required: true,
            type: 'text',
        },
        Website: {
            info: {
                tooltip: 'Copy and paste link to article, if available',
            }
        },
        Volume: {
            name: 'Volume',
            prop: {
                detail: 'PublicationVolume'
            },
            type: 'num',
        }
    };
}
function getCitationTypeConfg() {
    return {
        Article: {
            name: 'Article',
            fields: {
                Authors: {
                    required: true
                },
                Year: {
                    required: true
                }
            },
            views: {
                all: [
                    ['Year', 'Pages'],
                    ['Volume', 'Issue'],
                    ['Doi', 'Website'],
                    ['Authors']],
            }
        },
        Book: {
            name: 'Book',
            fields: {
                Pages: {
                    required: true
                },
                Authors: {
                    required: true
                }
            },
            views: {
                all: [
                    ['Volume', 'Doi'],
                    ['Website', 'Authors']],
            }
        },
        Chapter: {
            name: 'Chapter',
            fields: {
                Pages: {
                    required: true
                },
                Authors: {
                    required: true
                }
            },
            views: {
                all: [
                    ['Pages', 'Doi'],
                    ['Website', 'Authors']],
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
                    ['Year', 'Pages'],
                    ['Doi', 'Website'],
                    ['Authors']],
            }
        },
        Other: {
            name: 'Other',
            views: {
                all: [
                    ['Year', 'Pages'],
                    ['Volume', 'Issue'],
                    ['Website'],
                    ['Doi', 'Authors']],
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
                    ['Year', 'Pages'],
                    ['Volume', 'Issue'],
                    ['Website','Doi'],
                    ['Doi', 'Authors']],
            }
        }
    };
}