(function(){  console.log("on admin login called.")
	var sendEditorMsg;
	var msgTagMap = {
		init: function(){}, 		// gets sent on successful login by toolbar's init contentload event listener
		loginRole: sendRole,
		uploadData: sendEntityData
	};
  window.addEventListener('message', webviewMsgHandler, false);
  // document.addEventListener("DOMContentLoaded", onDomLoad);

	function sendMsg(appId, appOrigin, msgData) {
		appId.postMessage(msgData, appOrigin)
	}
  function webviewMsgHandler(msg) { console.log("Msg recieved = %O", msg);
  	sendEditorMsg = sendMsg.bind(null, msg.source, msg.origin);
  	msgTagMap[msg.data.tag](msg.data);
  }
	function sendRole(msgData) {
		var userRole = $('#pg-container').data("user-role");
		var userName = $('#pg-container').data("user-name");
		sendEditorMsg({
			tag: "loginRole",
			role: userRole,
			user: userName
		});
	}
	function sendEntityData(msgData) {
		console.log("data to upload = %O", msgData.data);
	}
	function onDomLoad() {
		var userRole = $('#pg-container').data("user-role"); console.log("userRole = ", userRole);
	}

}());  /* End of namespacing anonymous function */