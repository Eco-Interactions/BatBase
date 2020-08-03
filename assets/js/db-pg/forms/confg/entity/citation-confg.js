/**
 * Citation form config:
 * {
 * 	  add: { FieldName: fieldType, ... }
 * 	  required: [ FieldName, ... ],
 * 	  basic: [ FieldName, ... ] (always shown)
 * 	  optional: [ FieldName, ... ]  //todo: if optional is false, suggested can be emptu here and opt can be removed from order
 * 	  order: {
 * 	  	 'basic': [ FullRowField, [FieldName, SecondFieldInRow, ...], ...]
 * 	  	 'opt': [SameFormat, or FALSE]
 * 	  }
 * 	  types: {
 * 	  	   Type name: {
 * 	  	   		name:
 * 	  	   		required:
 * 	  	   		optional:
 * 	  	   		order
 * 	  	   }
 * 	  }
 * }
 */
export default function() {  													console.log('getCitationFormConfg');
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
        	'LinkDisplay',
        	'LinkUrl'],
        'optional': [],
        'order': {
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
                        ['LinkDisplay', 'LinkUrl'],
                        ['Doi', 'Authors']]},
                    'opt': false,
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
                    	['LinkDisplay', 'LinkUrl'],
                        ['Authors']]},
                    'opt': false,
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
                    	['LinkDisplay', 'LinkUrl'],
                        'Authors' ]},
                    'opt': false,
            },
            "Master's Thesis": {
                'name': "Master's Thesis",
                'required': [],
                'suggested': [],
                'optional': [],
                'order': {
                    'sug': [
                    	['LinkDisplay', 'LinkUrl'],
                    	'Doi']},
                    'opt': false,
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
                    	['LinkDisplay', 'LinkUrl'],
                        ['Doi', 'Authors']]},
                    'opt': false,
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
                        ['LinkDisplay', 'LinkUrl'],
                        ['Doi', 'Authors']]},
                    'opt': false,
            },
            'Ph.D. Dissertation': {
                'name': 'Ph.D. Dissertation',
                'required': [],
                'suggested': [],
                'optional': [],
                'order': {
                    'sug': [
                    	['LinkDisplay', 'LinkUrl'],
                    	'Doi']},
                    'opt': false,
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
                        ['LinkDisplay', 'LinkUrl'],
                        ['Doi', 'Authors']],
                    'opt': false,
                }
            }
        }
    }
}