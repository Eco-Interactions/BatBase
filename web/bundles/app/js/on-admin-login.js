(function(){  console.log("on admin login called.")
	var sendEditorMsg;
	var msgTagMap = {
		init: Function.prototype, 		// gets sent on successful login by toolbar's init contentload event listener
		loginRole: sendRole,
		uploadData: sendEntityData
	};
  window.addEventListener('message', webviewMsgHandler, false);
  document.addEventListener("DOMContentLoaded", onDomLoad);

	function onDomLoad() {
		sendTaxonymStubs();
	}
	function ajaxError(jqXHR, textStatus, errorThrown) {
		console.log("ajaxError = %s - jqXHR:%O", errorThrown, jqXHR);
	}
	function dataSubmitted(data, textStatus, jqXHR) { console.log("Something Like Success! data = %O, textStatus = %s, jqXHR = %O", data, textStatus, jqXHR);
		var taxonymData = getTaxonymStubReturnData();
	}
	function sendMsg(appId, appOrigin, msgData) {
		appId.postMessage(msgData, appOrigin)
	}
  function webviewMsgHandler(msg) { console.log("Msg recieved = %O", msg);
  	sendEditorMsg = sendMsg.bind(null, msg.source, msg.origin);
  	msgTagMap[msg.data.tag](msg.data);
  }
	function sendRole(msgData) {
		var userRole = $('body').data("user-role");
		var userName = $('body').data("user-name");
		sendEditorMsg({
			tag: "loginRole",
			role: userRole,
			user: userName
		});
	}
	function recieveEntityData(msgData) {  console.log("data to upload = %O", msgData.data);
		var data = { entityData: msgData.data };
		sendEntityData(msgData.entity, data);
	}
	function sendEntityData(entity, data) {
		// var targetUrl = $('body').data('ajax-target-url') + entity + '/post'; console.log("targeturk = %s", targetUrl)
    $.ajax({
		  method: "POST",
		  url: $('body').data('ajax-target-url') + entity + '/post',
		  success: dataSubmitted,
		  error: ajaxError,
		  data: JSON.stringify(data)
		});
	}




	/*------------- Stubby Methods -------------------------------------------------------------------------*/
	function sendTaxonymStubs() {
		sendEntityData("taxonym", getTaxonymStubs());
	}
	function getTaxonymStubs() {
		return [ { 'name': 'Taxonys Singularis' },
             { 'name': 'Repeatus Taxonymicus' },
             { 'name': 'Creativ Cranius' },
             { 'name': 'Infini Potentius' } ];
	}
	function getTaxonymStubReturnData() {
		return [ { 'Taxonys Singularis':   { 'id': 1 } },
						 { 'Repeatus Taxonymicus': { 'id': 2 } },
						 { 'Creativ Cranius':      { 'id': 3 } },
						 { 'Infini Potentius':     { 'id': 4 } } ];
	}
	function getTaxaStubData(){
		// return [{
		// 	lvl: 6
		// }






		// ]



	}




}());  /* End of namespacing anonymous function */