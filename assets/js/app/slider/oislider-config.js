$(function(){
	var frames = ECO_INT_FMWK.frameSet.frames;
	var imagePath = getImagePath();
	
	function getImagePath() {
		var imageUrl = $('#masthead').data('img-path') ? 
			$('#masthead').data('img-path').split("/") : [];		
		var cacheQuery = imageUrl.splice(imageUrl.length-1, 1);
		return imageUrl.join('/') + '/';
	}
	ECO_INT_FMWK.bSliderCfg = {
			type: "slider",
			structure: {
				container: {
					id: "masthead",
					width: getWidth(),
					height: 423
				},
				messages: getMsgPos()
			},
			content: {
				images: getImgPaths(),
				messages: getMsgs()
			},
			animation: getAnimationConfig()
		};

	function getWidth() { 
		return $(window).width() > 1500 ? 1500 : 1350;
	}
	function getMsgPos() {
		var frstFm = frames[0];
		var obj = { containerClass: "message-container" };
		obj[frstFm.msgPosV.edge] = frstFm.msgPosV.px;
		obj[frstFm.msgPosH.edge] = frstFm.msgPosH.px;
		return obj;
	}
	
	function getImgPaths() {
		var imgfiles = getColumn(framesWithImg(), 'newImg');		// console.log(':%s',);
		return imgfiles.map(function(item) { 
					return imagePath + item;
				});
		function framesWithImg() {
			return frames.filter(function(frame){ 
						return 'newImg' in frame;
					})
		}
	}/*  getImgPaths */

	function getColumn(ary, key) {
		return ary.map(function(item) {
					return item[key];
				});		
	}

	function getMsgs() {
		return frames.map(function(frame) {
				return 'msgTxt' in frame ? frame.msgTxt : '';
			});			
	}

	function getAnimationConfig() {
		var cfg = {	waitAllImages: true,
					changeSameMessage: false,
					showMessages: "simple",
					changeMessagesAfter: 1 };
		return $.extend(ECO_INT_FMWK.frameSet.animCfg, cfg);
	}/*  getAnimationConfig 									*/

});
