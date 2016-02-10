$(function(){
	var FADE_DUR = 3500;	/* default fade duration in milliseconds 										*/
	var MSG_PAD_VERT = 30;	/* default vertical px spacing of message from top or bottom edge of slider  	*/
	var MSG_PAD_HORZ = 58;	/* default horizontal px spacing of message from left or right edge of slider 	*/
	
	ECO_INT_FMWK.frameSet = {
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
				initialInterval: 3500,					
				interval: 3500
				messageAnimationDirection: 'left',
				messageAnimationDuration:	800,
				messageAnimationMaxHorLength: 1000,
				messageAnimationMaxVerLength: 350		
			},
		frames: [
					{
						msgTxt: 'batplant.org',
						msgPosV: { top: 20 },
						msgPosH: { left: MSG_PAD_HORZ },
						newImg: 'twobats.jpg'
						msgCss: { 'font-size': '60px'},
						ghostGrp: 'site-name',
						},
					{},
					{},
					{},
			],

		};
});


var batsOiBsSliderStepObjs = [

{	/* Step One - array index 0 */
	msgTxt: 'batplant.org',
	ghostClass: 'site-name',
	msgCss: { 'font-size': '60px'},
	newImg: 'twobats.jpg',

	msgPos:	{ top: 20, left: MSG_PAD_HORZ },

}, {	/* Step Two - array index 1 */
	msgTxt: 'An Online Database of<br>Bat Eco-Interactions',
	msgCss: { 'font-size': '36px', 'text-align': 'right'},
	ghostClass: 'site-desc',
	msgPos:	{ top: MSG_PAD_VERT, right: MSG_PAD_HORZ },
	msgSlide: { messageAnimationDirection: 'right' }
}, {	/* Step Three - array index 2 */
	msgTxt: 'This new image slider<br />has animated captions 3BLg',
	ghostClass: 'intro',
	imgFade: { interval: 3000 },
	msgCss: { 'font-size': '24px', width: '', 'text-align': 'left'},
	msgPos:	{ bottom: MSG_PAD_VERT, left: MSG_PAD_HORZ },
	msgSlide: { messageAnimationDirection: 'down' }
}, {	/* Step Four - array index 3 */
	msgTxt: 'Text may appear in any corner 4BR',
	msgPos:	{ right: MSG_PAD_HORZ },
	msgCss: { 'font-size': '34px', width: '250px', 'text-align': 'right'},
}, {	/* Step */
	msgTxt: 'New text can replace existing text 5BR',
}, {	/* Step */
	msgTxt: 'A single block of text can be removed 6BRg',
	ghostClass: 'bot-right',
	imgFade: { interval: 1000 }
}, {	/* Step */
	msgTxt: '7BL',
	msgPos:	{ left: MSG_PAD_HORZ },
	fadeGhostClass: '.intro',
	fadeGroupNames: 'intro'
}, {	/* Step */
	msgTxt: 'The image may change with the text 8BR',
	msgPos:	{ right: MSG_PAD_HORZ },
	newImg: 'cactusbat.jpg',
	imgFade: { interval: 2000 },
	fadeGhostClass: '.bot-right',
	fadeGroupNames: 'bot-right'
}, {	/* Step */
	msgTxt: 'The image may chage while the text stays the same 9BRg',
	msgCss: { 'font-size': '24px' },
	ghostClass: 'bot-right'
}, {	/* Step */
	msgTxt: '10BL',
	msgPos:	{ left: MSG_PAD_HORZ },
	newImg: 'inflower.jpg'
}, {	/* Step */
	msgTxt: 'All the text can be removed and just images cycled 11BR',
	msgPos:	{ right: MSG_PAD_HORZ },
	fadeGhostClass: '.bot-right,.site-name,.site-desc',
	fadeGroupNames: 'bot-right, site-name, site-desc'
}, {	/* Step */
	msgTxt: '12BR',
	newImg: 'twobats.jpg',
}, {	/* Step */
	msgTxt: '13BR',
	newImg: 'cactusbat.jpg',
}, {	/* Step */
	msgTxt: 'Text May Slide in from the left or right 14BR',
	msgPos:	{ bottom: 55, 'text-align': 'right' },
	msgSlide: { messageAnimationDirection: 'right' }
}, {	/* Step */
	msgTxt: 'It can also slide up from the bottom...15TL',
	msgSlide: { messageAnimationDirection: 'up' },
	msgPos:	{ top: MSG_PAD_VERT, left: MSG_PAD_HORZ, 'text-align': 'left' },
	ghostClass: 'top-left',
},{	/* Step */
	msgTxt: '...or down from the top 16BR',
	msgPos:	{ bottom: MSG_PAD_VERT, right: MSG_PAD_HORZ, 'text-align': 'right' },
	msgSlide: { messageAnimationDirection: 'down' }
}, {	/* Step */
	msgTxt: '17BR',
	fadeGhostClass: '.top-left',
	fadeGroupNames: 'top-left',
	msgCss: { width: '' },
}, {	/* Step */
	msgTxt: '18BR',
}, {	/* Step */
	msgTxt: '19BR',
}, {	/* Step */
	msgTxt: '20BR',
}

];
