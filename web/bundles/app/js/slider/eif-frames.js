$(function(){
	var FADE_DUR = 4000;	/* default fade duration in milliseconds 										*/
	var PAUSE_DUR = 3000;	/* default pause duration in milliseconds 										*/
	var MSG_PAD_VERT = 40;	/* default vertical px spacing of message from top or bottom edge of slider  	*/
	var MSG_PAD_HORZ = 58;	/* default horizontal px spacing of message from left or right edge of slider 	*/

	ECO_INT_FMWK.frameSet = {
		defaults: {
				pause: PAUSE_DUR
			},
		animCfg: {
				effects: [
					{name:"fade",duration:1000},
					{name:"chessBoardLeftUp",duration:FADE_DUR,size:20,steps:50},
					{name:"chessBoardLeftDown",duration:FADE_DUR,size:20,steps:50},
					{name:"chessBoardRightUp",duration:FADE_DUR,size:20,steps:50},
					{name:"chessBoardRightDown",duration:FADE_DUR,size:20,steps:50},
					{name:"jalousieLeft",duration:FADE_DUR,size:20,steps:50},
					{name:"jalousieRight",duration:FADE_DUR,size:20,steps:50},	
					{name:"jalousieUp",duration:FADE_DUR,size:20,steps:50},
					{name:"jalousieDown",duration:FADE_DUR,size:20,steps:50}
					],
				initialInterval: PAUSE_DUR,					
				interval: PAUSE_DUR,
				messageAnimationDirection: 'left',
				messageAnimationDuration:	FADE_DUR,
				messageAnimationMaxHorLength: 1000,
				messageAnimationMaxVerLength: 350		
			},
		frames: getRawFrames()
			}; /* end ECO_INT_FMWK.frameSet declaration/literal-assignemnt */

		function getRawFrames() {
			var frameDecks = {
				defaultSet: [
					{	msgPosV: { edge: 'top', px: MSG_PAD_VERT },
						msgPosH: { edge: 'left', px: MSG_PAD_HORZ },
						newImg: 'twobats.jpg' },
					{	newImg: 'cactusbat.jpg' },
					{	newImg: 'inflower.jpg' }
				], /* end defaultSet array */
				citFrames: [
					{	newImg: 'twobats.jpg',
						pause: PAUSE_DUR,
						msgPosV: { edge: 'top', px: MSG_PAD_VERT },
						msgPosH: { edge: 'left', px: MSG_PAD_HORZ } },
					{	
						msgTxt: getLogo('desc', 450, 32),
						ghostGrp: 'site-desc' },
					{
						msgTxt: getLogo('only', 200, 175),
						ghostGrp: 'logo',
						msgPosH: { edge: 'right', px: 120 },
						msgMov: 'up' },
					{
						msgTxt: 'Notice that this page<br>has a different slide show<br>than the home page',
						msgMov: 'down',
						msgCss: { 'font-size': '20px', 'text-align': 'right' },
						msgPosV: { edge: 'bottom', px: MSG_PAD_VERT } },
					{
						msgTxt: 'This ability will be used to deliver a variety of information<br>as the beta testers explore the site....',
						msgPosH: { edge: 'left', px: MSG_PAD_HORZ },
						ghostGrp: 'bot-left',
						pause: 4000 },
					{	
						msgTxt: 'A single page may have it\'s own slide deck<br>or a group of pages may share one.',
						msgPosH: { edge: 'right', px: MSG_PAD_HORZ },
						msgMovDur: 1500,
						fadeMs: 1000,
						},
					{	msgTxt: 'This deck is shared by all the pages<br>with the new tables for citations,<br>authors, and publications.' },
					{	msgTxt: 'This is how we how we will tell<br>the story of the project and describe<br>the current stage of development.' },
					{	msgTxt: 'Caveats about missing data<br>or data in need of review,<br>will appear on the pages<br>that display the data.' },
					{	msgTxt: 'Notice that the logo components can be used as captions<br>and animated or faded any way we like',
						ghostGrp: 'bot-right' },
					{	
						newImg: 'inflower.jpg',
						fadeGrp: 'logo, bot-left',
						msgPosV: { edge: 'top', px: MSG_PAD_VERT },
						pause: 1000 },
					{	
						newImg: 'cactusbat.jpg',
						msgTxt: 'Also notice the new buttons labeled "Copy" and "CSV"',
						fadeGrp: 'site-desc, bot-right' },
					{	
						msgMov: 'left',
						msgCss: { 'text-align': 'left' },
						msgPosH: { edge: 'left', px: MSG_PAD_HORZ } },
					{	
						msgTxt: 'Explore the pages for<br>citations, authors,<br>and publications',
						pause: 3000 },
					{	msgTxt: 'Be sure to visit the pages<br>that show a single citation,<br>author, or publication' },
					{	msgTxt: 'Sort the page that shows all Citations<br>on Interaction Count...' },
					{	msgTxt: '...then veiw the details<br>of a single Citation that has<br>lots of interactions...' },
					{	msgTxt: '...and scroll down the page to note<br>how the Citation details collapse...' },
					{	msgTxt: '...leaving only the menu, page header,<br>and table header at the top' },
					{	msgTxt: 'Also wave your mouse around over menu<br>and notice the smoother, more forgiving behavior' }
				] /* end citFrames array */
			};
			return frameDecks[getFramesName()];
		}


		function getFramesName() {
			if (typeof $("html").data('frames') !== 'undefined') {
				return $("html").data('frames');
			} else {
				return 'defaultSet';
			}
		}
		
		function getLogo(vers, width, height) {
			var imagePath = $('#masthead').data('img-path');
			return '<img src="' + imagePath + 'logo_' + vers + '.svg" id="slide-logo" alt="batplant.org" height="' + height + '" width="' + width + '">';
		}
}); /* end self-executing jQuery anonymous name-spacing function */
