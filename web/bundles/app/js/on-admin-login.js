(function(){  console.log("on admin login called.")
	var sendEditorMsg;
	var msgTagMap = {
		loginRole: sendRole,
	};
  window.addEventListener('message', webviewMsgHandler, false);

	function sendMsg(appId, appOrigin, msgData) {
		appId.postMessage(msgData, appOrigin)
	}
  function webviewMsgHandler(msg) { console.log("Msg recieved = %O", msg);
  	sendEditorMsg = sendMsg.bind(null, msg.source, msg.origin);
  	msgTagMap[msg.data.tag](msg);
  }
	function sendRole(msg) {
		sendEditorMsg({tag: "adminLogin"});
	}


}());  /* End of namespacing anonymous function */