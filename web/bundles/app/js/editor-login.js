(function(){
	var sendEditorMsg;
	var msgTagMap = {
		'init': buildEditorLoginView,
		'loginRole': failedSubmit
	};
  // document.addEventListener("DOMContentLoaded", buildEditorLoginView);
	window.addEventListener('message', webviewMsgHandler, false);

	function sendMsg(appId, appOrigin, msgData) {
		appId.postMessage(msgData, appOrigin)
	}
  function webviewMsgHandler(msg) { console.log("Msg recieved = %O", msg);
  	var editorId = msg.origin;
  	sendEditorMsg = sendMsg.bind(null, msg.source, msg.origin);
		msgTagMap[msg.data.tag](msg.data);
  }
  function buildEditorLoginView(msgData) {  console.log("buildEditorLoginView called");
		var $pgCntnrElem, $form, $divCntnr;
		stripPage();
		buildLoginView();
		$divCntnr.appendTo($pgCntnrElem);
		sendEditorMsg({tag: "webviewInitComplete"});

	  function stripPage() {  console.log("stripPage called");
			$pgCntnrElem = $('#pg-container');
			$form = $('#detail-block').children('form').detach();  console.log("$form = %O", $form);
			$pgCntnrElem.empty();
	  }
	  function buildLoginView() {  console.log("buildLoginView called");
      // $form.unbind('submit').bind('submit', loginSubmit);			//This isn't working.
	  	$divCntnr = $('<div>').attr('id', 'app-login').addClass('flex-row flex-wrap');
	  	$divCntnr.append('<img id="batHorzLogo" src="bundles/app/images/BatLogo_Horizontal_Color.svg" style="height: 150px;"/>');
	  	$divCntnr.append('<h4>Please login with your batplant.org username and password to begin upload.</h4>');
			$form.appendTo($divCntnr);
	  }
	  // function loginSubmit(event) {  console.log("loginSubmit called. event = %O", event);
	  // 	event.preventDefault();
	  // 	sendEditorMsg({tag: "loggingIn"});
	  // 	$form.submit();
	  // }
  } /* End buildEditorLoginView */
  function failedSubmit(msg) {
  	sendEditorMsg({tag: 'reLogin'});
  }

}());  /* End of namespacing anonymous function */