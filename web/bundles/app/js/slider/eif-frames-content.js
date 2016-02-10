$(function(){
	var FADE_DUR = 2000;	/* default fade duration in milliseconds 										*/
	var PAUSE_DUR = 1500;	/* default pause duration in milliseconds 										*/
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
					{	msgTxt: 'batplant.org',
						msgPosV: { edge: 'top', px: MSG_PAD_VERT },
						msgPosH: { edge: 'left', px: MSG_PAD_HORZ },
						msgCss: { 'font-size': '60px'},
						ghostGrp: 'site-name',
						newImg: 'twobats.jpg' },
					{	
						msgTxt: 'An Online Database of Bat Eco-Interactions',
						ghostGrp: 'site-desc',
						msgPosV: { edge: 'top', px: MSG_PAD_VERT },
						msgPosH: { edge: 'right', px: MSG_PAD_HORZ },
						msgCss: { 'font-size': '36px', 'width': '400px', 'text-align': 'right'},
						msgMov: 'right' },
					{
						msgTxt: 'This is the new image slider<br>with animated captions',
						ghostGrp: 'intro',
						msgCss: { 'font-size': '24px', 'width': '650px', 'text-align': 'left'},
						fadeMs: 1500,
						msgPosV: { edge: 'bottom', px: MSG_PAD_VERT },
						msgPosH: { edge: 'left', px: MSG_PAD_HORZ },
						msgMov: 'down' },
					{
						msgTxt: 'A caption may include as much as short paragraphs of text. The pause time can be lengthened so the user has time to read all the text.',
						msgCss: { 'font-size': '20px', 'width': '280px', 'text-align': 'right' },
						msgPosH: { edge: 'right', px: MSG_PAD_HORZ } },
					{	
						msgTxt: 'New text can replace existing text',
						msgCss: { 'font-size': '22px', 'width': '650' },
						pause: 4000 },
					{	
						msgTxt: 'A single block of text can be removed',
						ghostGrp: 'bot-right',
						msgMovDur: 1500,
						fadeMs: 1000,
						pause: PAUSE_DUR
						},
					{
						fadeGrp: 'intro' },
					{	
						msgTxt: 'The image may change with the text',
						msgPosH: { edge: 'right', px: MSG_PAD_HORZ },
						msgCss: { 'text-align': 'right' },
						fadeMs: 1500,
						msgMovDur: 2000,
						msgMov: 'right',
						fadeGrp: 'bot-right',
						newImg: 'cactusbat.jpg' },
					{	
						msgTxt: 'The image may change while the text stays the same',
						msgCss: { 'width': '340px' },
						msgMov: 'down',
						ghostGrp: 'bot-right',
						newImg: 'inflower.jpg' },
					{	newImg: 'twobats.jpg' },
					{	newImg: 'cactusbat.jpg' },
					{	
						msgTxt: 'All the text can be removed and just images cycled',
						msgPosH: { edge: 'left', px: MSG_PAD_HORZ },
						fadeGrp: 'site-name, site-desc, bot-right' },
					{	
						newImg: 'inflower.jpg',
						fadeGrp: 'bot-right' },
					{
						newImg: 'twobats.jpg' },
					{	
						msgTxt: 'Text may slide in from the left or right',
						msgPosH: { edge: 'right', px: MSG_PAD_HORZ },
						msgCss: { 'text-align': 'right', 'width': '600px' },
						msgMov: 'right',
						pause: PAUSE_DUR },
					{	
						msgTxt: 'It can also slide up from the bottom...',
						msgPosV: { edge: 'top', px: MSG_PAD_VERT },
						msgPosH: { edge: 'left', px: MSG_PAD_HORZ },
						msgCss: { 'text-align': 'left' },
						ghostGrp: 'top-left',
						msgMov: 'up' },
					{	
						msgTxt: '...or down from the top',
						msgPosV: { edge: 'bottom', px: MSG_PAD_VERT },
						msgPosH: { edge: 'right', px: MSG_PAD_HORZ },
						msgCss: { 'text-align': 'right' },
						fadeGrp: 'top-left',
						msgMov: 'down' },
					{	msgTxt: 'Almost anything about the caption<br>can be changed from frame to frame...' },
					{	msgTxt: '...including the color, size, and font.',
						msgCss: { 'font-size': '36px', 'color': 'White', 'font-family': 'serif' } },
					{	msgTxt: 'All these captions are just to demostrate the possibilities',
						msgCss: { 'font-size': '22px', 'color': '#a2dadd', 'font-family': 'sans-serif' } },
					{	msgTxt: 'Over the next few days, these will be replaced with captions for our users',
						msgMov: 'up',
						msgPosV: { edge: 'top', px: MSG_PAD_VERT } },
					{	msgTxt: 'This slideshow is almost complete',
						msgPosH: { edge: 'left', px: MSG_PAD_HORZ },						
						msgMov: 'left',
						pause: 2500,
						msgCss: { 'text-align': 'left' } },
					{	msgTxt: 'When you see the original<br>"batplant.org" caption<br>return to this corner...' },
					{	msgTxt: '...the slides have started over<br>at the beginiing.' },
					{	msgTxt: 'When you see that, log in,<br>if you have not already.' },
					{	msgTxt: 'Then navigate to "Admin | View All | Reference | Citation"' },
					{	msgTxt: 'There, you will see a new slideshow...' },
					{	msgTxt: '...and a variety of other new features!' }
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
