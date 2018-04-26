var updateUrl, $asgnUsrElem, $statusElem, $adminNotesElem, $viewerPopup;
var minNotesChars = 1;
var maxNotesChars = 500;
var orgnlFeedback = {};
var submitDisabled = true;
var noteHasChanges = statusHasChanges = asgnUserHasChanges = false;

requireCss();              

function requireCss() {
	require('../../css/feedback-viewer.css');	
}

$('#feedback_tbl').on('click', "a.feedback-link", showContextPage);

function showContextPage() {
	var $iframe = $('<iframe id="feedback-context-frame"></iframe>');
	var contextUrl =  $(this).attr('href');
	var loadUrl = $(this).data('ajaxload');
	updateUrl = $(this).data('ajaxupdate');

	sendAjaxRequest(loadFeedbackAjaxData(loadUrl));
	$( 'body' ).empty();
	$('html').css({ 'overflow-y': 'hidden' });
	$( 'body' ).append($iframe);
	$('#feedback-context-frame').attr('src', contextUrl);
	return false;
}

function createPopUp(feedback) {
	orgnlFeedback = extractEditable(feedback);		console.log("orgnlFeedback= ", orgnlFeedback);
	$viewerPopup = $('<div id="feedback-viewer-popup"></div>');
	var container = $('<div id="feedback-container"></div>');
	var fromTxt = feedback.from.username + formatDate(feedback.submitted.date);
	$asgnUsrElem = createUserSelect(feedback.users, feedback.assigned.id); 
	$statusElem = createStatusSelect(feedback.status);
	$adminNotesElem = $('<textarea id="admn-notes" placeholder="Add notes about this feedback here..."></textarea>').text(feedback.notes);


	$viewerPopup.append($('<p></p>').text(fromTxt).prepend($('<span class="lbl">Feedback from: </span>')));
	$viewerPopup.append($('<p class="top-mrg"></p>').text(feedback.topic).prepend($('<span class="lbl">Topic: </span>')));
	$viewerPopup.append($('<p class="top-mrg btm-mrg"></p>').text(feedback.content));
	$viewerPopup.append($asgnUsrElem);
	$viewerPopup.append($statusElem);
	$viewerPopup.append($('<p class="top-mrg"><span class="lbl">Admin Notes:</span></p>'));
	$viewerPopup.append($adminNotesElem);
	$viewerPopup.append($('<p id="note-chars"></p>').text('No notes entered').css({ 'font-size': '.8em' }));
	$viewerPopup.append($('<button name="post-feedback">Update Feedback Entry</button>'));
	$viewerPopup.append($('<button name="cancel-feedback">Cancel</button>'));
	$viewerPopup.hide();
	container.prepend($viewerPopup);
	$('body').prepend(container);
	addPopupEvents();
	$viewerPopup.css({ right: sbarOffest($viewerPopup.css('right')) });
	$("#feedback-viewer-popup>button[name='post-feedback']").fadeTo( 'fast' , .35);
	$viewerPopup.fadeIn("fast");
}

function extractEditable(feedback) {
	var userId = feedback.assigned.id;
	return {
		status: parseInt(feedback.status),
		asgnUser: parseInt(userId === null ? 0 : userId),
		notes: feedback.notes
	}
}

function onDataChange() {
	console.log("onDataChange called.");
	if (submitDisabled && hasChangedData()) {
		enableSubmit();
	} else if (!submitDisabled && !hasChangedData()) {
		disableSubmit();
	}
}

function hasChangedData() {
	console.log("hasChangedData called. will return -> ", (noteHasChanges || statusHasChanges || asgnUserHasChanges));
	return noteHasChanges || statusHasChanges || asgnUserHasChanges;
}

function onNoteChange() {
	setNotesChars($(this).val().length);
	noteHasChanges = $adminNotesElem.val() === orgnlFeedback.notes ? false : true;
	console.log("noteChanges called and ==", noteHasChanges);
	onDataChange();
}

function onStatusChange() {
	statusHasChanges = parseInt($('select[name=status] option:selected').val()) !== orgnlFeedback.status;
	onDataChange();
}

function onAsgnUserChange() {
	asgnUserHasChanges = parseInt($('select[name=asgnuser] option:selected').val()) !== orgnlFeedback.asgnUser;
	onDataChange();
}

function enableSubmit() {
	console.log("enableSubmit called");
	$('#feedback-viewer-popup').on('click', 'button[name="post-feedback"]', updateFeedback);
	$("#feedback-viewer-popup>button[name='post-feedback']").fadeTo( 'fast', 1);
	submitDisabled = false;
}

function disableSubmit() {
	console.log("disableSubmit called");
	$("#feedback-viewer-popup>button[name='post-feedback']").fadeTo( 'fast' , .35);
	$('#feedback-viewer-popup').off('click', 'button[name="post-feedback"]', updateFeedback);
	submitDisabled = true;
}

function updateFeedback() {
	var userId = $('select[name=asgnuser] option:selected').val();
	var data = {
			asgnUserId: userId === 0 ? null : userId,
    		adminNotes: $adminNotesElem.val(),
    		status: $('select[name=status] option:selected').val()
    	};																								console.log('data obj= ', data);
    	console.log('$adminNotesElem = ', $adminNotesElem);
    sendAjaxRequest(updateFeedbackAjaxData(data));
    // closePopup() && sendAjaxRequest(data);
}

function sendAjaxRequest(ajaxData) {
    $.ajax(ajaxData);
}

function loadFeedbackAjaxData(loadUrl) {
	return {
		  method: "POST",
		  url: loadUrl,
		  success: feedbackEntryRecieved,
		  error: ajaxError
		};
}

function updateFeedbackAjaxData(feedbackData) {
	return {
		  method: "POST",
		  url: updateUrl,
		  success: feedbackUpdateSucess,
		  error: ajaxError,
		  data: JSON.stringify(feedbackData)
		};
}

function feedbackUpdateSucess(data, textStatus, jqXHR) {
	console.log('feedbackUpdateSucess data = ', data);
	closePopup();
}

function addPopupEvents() {
	$viewerPopup.on('click', 'button[name="cancel-feedback"]', closePopup);
	$viewerPopup.on('keyup', 'textarea', onNoteChange);
	$viewerPopup.on('change', 'select[name=status]', onStatusChange);
	$viewerPopup.on('change', 'select[name=asgnuser]', onAsgnUserChange);
}

function closePopup() {
	$viewerPopup.fadeOut("slow", function () { document.location.reload(true); });
	return true;
}

function setNotesChars(charCnt) {
	$('#note-chars').text(getCharStr(charCnt));
}

function getCharStr(curCnt, max) {
	if (curCnt !== 0) {
		return curCnt + ' characters.';
	}
}

function sbarOffest(pxValStr) {
	return (parseInt(numPart(pxValStr)) + Math.floor(sbarWidth() / 2)) + 'px';
}

/* strip px, em, etc off of css values */
function numPart(str) {
	return str.replace(/[^-\d\.]/g, '');
}

function createUserSelect(users, selected) {
	var selectElemStr = '<label>Assigned to: <select name="asgnuser"><option value="0"';
	selectElemStr += (selected === null ? ' selected>' : '>') + 'none</option>';
	users.forEach(function (user) {
		var optionStr = '<option value="' + user.id + '"';
		optionStr += (selected === user.id ? ' selected>' : '>');
		optionStr += user.name + '</option>';
		selectElemStr += optionStr;
	});
	selectElemStr += '</select></label>';
	return $(selectElemStr);
}

function createStatusSelect(curStatus) {
	var statusAry = ['Closed', 'Follow-Up', 'Read', 'Unread'];
	var selectElemStr = '<label>Status: <select name="status">';
	statusAry.forEach(function (statusStr, idx) {
		var optionStr = '<option value="' + idx + '"';
		optionStr += (curStatus === statusStr ? ' selected>' : '>');
		optionStr += statusStr + '</option>';
		selectElemStr += optionStr;
	});
	selectElemStr += '</select></label>';
	return $(selectElemStr);
}

function feedbackEntryRecieved(data, textStatus, jqXHR) {
	createPopUp(data.feedbackObj);
}

function ajaxError(jqXHR, textStatus, errorThrown) {
	console.log("ajaxError - status = %s - error = %s - jqXHR:%O", textStatus, errorThrown, jqXHR);
}

function formatDate(dateStr) {
	var date = new Date(dateStr);
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return ' on ' + date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + " at " + strTime;
}

function sbarWidth() {
	var scrollbarWidth;
	var scrollDiv = document.createElement("div");
	scrollDiv.id = "scrollbar-measure";
	document.body.appendChild(scrollDiv);
	scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
	document.body.removeChild(scrollDiv);
	return parseInt(scrollbarWidth);
}