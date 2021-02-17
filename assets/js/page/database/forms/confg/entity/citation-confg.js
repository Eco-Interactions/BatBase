/**
 * Citation form configuration.
 */
export default function(entity) {
	return {
        core: 'source',
        views: { //fields added will be built and displayed.
            all: [  //will be merged with type.views
                'CitationText',
                'Abstract',
                [ 'Title', 'CitationType' ]
            ],
        },
        fields: {
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
                // entity: 'SourceType'
                // name: 'SourceType',
                // required: true,
                // type: 'text',
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
        },
        types: {
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
                // 'required': [
                // 	'Authors',
                // 	'Year'],
                // 'suggested': [
                // 	'Issue',
                // 	'Pages',
                // 	'Volume'], //todo: change suggested to 'deafult'
                // 'optional': [],
                views: {
                    all: [
                    	['Year', 'Pages'],
                    	['Volume', 'Issue'],
                        ['Doi', 'Website'],
                        ['Authors']],
                    // 'opt': false,
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
                // 'suggested': [
                // 	'Volume'],
                // 'optional': [],
                views: {
                    all: [
                    	['Volume', 'Doi'],
                        ['Website', 'Authors']],
                    // 'opt': false,
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
                // 'required': [
                // 	'Pages',
                // 	'Authors'],
                // 'suggested': [],
                // 'optional': [],
                views: {
                    all: [
                    	['Pages', 'Doi'],
                        ['Website', 'Authors']],
                    // 'opt': false,
                }
            },
            "Master's Thesis": {
                name: "Master's Thesis",
                // 'required': [],
                // 'suggested': [],
                // 'optional': [],
                views: {
                    all: [
                    	['Doi', 'Website']],
                }
            },
            'Museum record': {
                name: 'Museum record',
                // 'required': [],
                // 'suggested': [
                // 	'Authors',
                // 	'Year',
                // 	'Pages'],
                // 'optional': [],
                views: {
                    all: [
                    	['Year', 'Pages'],
                        ['Doi', 'Website'],
                        ['Authors']],
                    // 'opt': false,
                }
            },
            Other: {
                name: 'Other',
                // 'required': [],
                // 'suggested': [
                // 	'Authors',
                // 	'Year',
                // 	'Issue',
                // 	'Pages',
                // 	'Volume'],
                // 'optional': [],
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
                // 'required': [],
                // 'suggested': [],
                // 'optional': [],
                views: {
                    all: [
                    	['Website','Doi']],
                    // 'opt': false,
                }
            },
            Report: {
                name: 'Report',
                // 'required': [],
                // 'suggested': [
                // 	'Authors',
                // 	'Year',
                // 	'Pages',
                // 	'Volume',
                // 	'Issue'],
                // 'optional': [],
                views: {
                    all: [
                    	['Year', 'Pages'],
                    	['Volume', 'Issue'],
                        ['Website','Doi'],
                        ['Doi', 'Authors']],
                    // 'opt': false,
                }
            }
        }
    }
}