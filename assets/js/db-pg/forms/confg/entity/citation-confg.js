/**
 * Citation form configuration.
 */
export default function() {
	return {
        'add': {
        	'Title': 'text',
        	'Volume': 'text',
        	'Abstract': 'fullTextArea',
            'Issue': 'text',
            'Pages': 'text',
            'CitationType': 'select',
            'CitationText': 'fullTextArea'
        },
        'info': {
        	'Doi': "Digital Object Identifier provided by the Publisher",
        	'LinkUrl': 'Copy and paste link to article, if available'
        },
        'required': [
        	'Title',
        	'CitationType'
        ],
        'suggested': [
        	'CitationText',
        	'Abstract',
        	'Doi',
        	'LinkUrl'],
        'optional': [],
        'order': {  //will be merged with type.order
            'sug': [
            	'CitationText',
            	'Abstract',
            	[ 'Title', 'CitationType' ] ],
            'opt': false,
        },
        'types': {
            'Article': {
                'name': 'Article',
                'required': [
                	'Authors',
                	'Year'],
                'suggested': [
                	'Issue',
                	'Pages',
                	'Volume'], //todo: change suggested to 'deafult'
                'optional': [],
                'order': {
                    'sug': [
                    	['Year', 'Pages'],
                    	['Volume', 'Issue'],
                        ['Doi', 'LinkUrl'],
                        ['Authors']],
                    'opt': false,
                }
            },
            'Book': {
                'name': 'Book',
                'required': [
                	'Authors'],
                'suggested': [
                	'Volume'],
                'optional': [],
                'order': {
                    'sug': [
                    	['Volume', 'Doi'],
                        ['LinkUrl', 'Authors']],
                    'opt': false,
                }
            },
            'Chapter': {
                'name': 'Chapter',
                'required': [
                	'Pages',
                	'Authors'],
                'suggested': [],
                'optional': [],
                'order': {
                    'sug': [
                    	['Pages', 'Doi'],
                        ['LinkUrl', 'Authors']],
                    'opt': false,
                }
            },
            "Master's Thesis": {
                'name': "Master's Thesis",
                'required': [],
                'suggested': [],
                'optional': [],
                'order': {
                    'sug': [
                    	['Doi', 'LinkUrl']],
                    'opt': false,
                }
            },
            'Museum record': {
                'name': 'Museum record',
                'required': [],
                'suggested': [
                	'Authors',
                	'Year',
                	'Pages'],
                'optional': [],
                'order': {
                    'sug': [
                    	['Year', 'Pages'],
                        ['Doi', 'LinkUrl'],
                        ['Authors']],
                    'opt': false,
                }
            },
            'Other': {
                'name': 'Other',
                'required': [],
                'suggested': [
                	'Authors',
                	'Year',
                	'Issue',
                	'Pages',
                	'Volume'],
                'optional': [],
                'order': {
                    'sug': [
                    	['Year', 'Pages'],
                    	['Volume', 'Issue'],
                        ['LinkUrl'],
                        ['Doi', 'Authors']],
                    'opt': false,
                }
            },
            'Ph.D. Dissertation': {
                'name': 'Ph.D. Dissertation',
                'required': [],
                'suggested': [],
                'optional': [],
                'order': {
                    'sug': [
                    	['LinkUrl','Doi']],
                    'opt': false,
                }
            },
            'Report': {
                'name': 'Report',
                'required': [],
                'suggested': [
                	'Authors',
                	'Year',
                	'Pages',
                	'Volume',
                	'Issue'],
                'optional': [],
                'order': {
                    'sug': [
                    	['Year', 'Pages'],
                    	['Volume', 'Issue'],
                        ['LinkUrl','Doi'],
                        ['Doi', 'Authors']],
                    'opt': false,
                }
            }
        }
    }
}