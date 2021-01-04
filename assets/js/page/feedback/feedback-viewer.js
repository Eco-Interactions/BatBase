/**
 * Loads the page the feedback was submitted from. Shows a popup with the submitted
 * feedback data and the admin fields to manage the feedback.
 *
 * TOC
 * 	  SHOW CONTEXT PAGE
 *    POPUP
 *    	SUBMITTED FEEDBACK
 *    		SUBMITTED BY
 *    		TOPIC
 *    		FEEDBACK TEXT
 *      ADMIN RESPONSE-FIELDS
 *      	FEEDBACK ASSIGNED TO
 *      	FEEDBACK STATUS
 *      	ADMIN NOTES
 *      POPUP FOOTER
 *      BUILD AND APPEND POPUP
 *   HANDLE SUBMIT
 *   	TOGGLE SUBMIT
 *   	SUBMIT UPDATE
 *   CLOSE POPUP
 */
import { _el, _u } from '~util';
let submitEnabled = false;
let feedbackId;

$('#feedback_tbl').on('click', "a.feedback-link", showContextPage);
/* ========================= SHOW CONTEXT PAGE ============================== */
/** Shows the page the feedback was submitted from. */
function showContextPage(e) {  													//console.log('id = [%s]', $(this).data('id'));
	e.preventDefault()
	feedbackId = $(this).data('id');
	_u('sendAjaxQuery', [null, 'feedback/load/'+feedbackId, feedbackEntryRecieved]);
	clearBodyAndBuildIframe($(this).attr('href'));
	return false;
}
function clearBodyAndBuildIframe(pageUrl) {
	const $iframe = $('<iframe id="feedback-context-frame"></iframe>');
	$('body').empty();
	$('html').css({ 'overflow-y': 'hidden' });
	$('body').append($iframe);  console.log('href = ', pageUrl)
	$('#feedback-context-frame').attr('src',pageUrl);
}
function feedbackEntryRecieved(data, textStatus, jqXHR) {
	createFeedbackResponsePopup(data.feedback);
}
/* ============================= POPUP ====================================== */
function createFeedbackResponsePopup(feedback) {
	const data = getEditableFeedbackData(feedback);					/*dbug-log*///console.log("createFeedbackResponsePopup feedback = %O, editableData = %O", feedback, data);
	const elems = [
		...getSubmittedFeedbackElems(feedback, data), '<hr>',
		...getAdminResponseFields(feedback, data),
		getFeedbackResponseFooter()
	];
	buildAndShowResponsePopup(elems);
}
function getEditableFeedbackData(feedback) {
	const userId = feedback.assigned.id;
	return {
		status: parseInt(feedback.status),
		assignedUser: parseInt(userId === null ? 0 : userId),
		notes: feedback.notes
	}
}
/* ------------------------ FIELD HELPERS ----------------------------------- */
function getMultiFieldRow(fields) {
	const row = _el('getElem', ['div', { class: 'flex-row' }]);
	$(row).append(fields);
	return row;
}
function getFeedbackFieldConfg(name, label, input) {
    return {
        flow: 'row',
        input: input,
        label: label ? label : _u('ucfirst', [name])+':',
        name: name,
    };
}
/* ----------------------- SUBMITTED FEEDBACK ------------------------------- */
function getSubmittedFeedbackElems(feedback, data) {
	return [
		getSubmittedBy(feedback),
		getTopic(feedback),
		getFeedbackText(feedback)
	];
}
function getDisplayElems(name, dText, label = null) {
	const displayText = _el('getElem', ['span', { text: dText }]);
	return _el('getFieldRow', [getFeedbackFieldConfg(name, label, displayText)]);
}
/* __________________________ SUBMITTED-BY __________________________________ */
function getSubmittedBy(feedback) {
	const fields = [
		getDisplayElems('fUser', feedback.from.name, 'User:'),
		getDisplayElems('fDate', formatDate(feedback.submitted.date), 'Date:'),
	];
	return getMultiFieldRow(fields)
}
function formatDate(dateStr) {
	const date = new Date(dateStr);
	return date.getDateTimeSentence();
}
/* ____________________________ TOPIC _______________________________________ */
function getTopic(feedback) {
	return getDisplayElems('topic', feedback.topic);
}
/* _________________________ FEEDBACK TEXT __________________________________ */
function getFeedbackText(feedback) {
	return getDisplayElems('feedback', feedback.content);
}
/* -------------------- ADMIN RESPONSE-FIELDS ------------------------------- */
function getAdminResponseFields(feedback, data) {
	return [
		getTopAdminResponseRow(feedback, data),
		getAdminNotesElem(feedback.notes)
	];
}
function getTopAdminResponseRow(feedback, data) {
	const fields = [
		getAssignedUserField(feedback.users, data.assignedUser),
		getFeedbackStatuElem(feedback.status)
	];
	return getMultiFieldRow(fields)
}
/* ____________________ FEEDBACK ASSIGNED TO ________________________________ */
function getAssignedUserField(users, assignedId) {
	const select = _el('getSelect', [
		getUserOpts(users), {id: 'sel-assignedUser'}, onDataChange, assignedId]);
	$(select).data('original', assignedId);
	return _el('getFieldRow', [getFeedbackFieldConfg('fAssigned', 'Assigned to:', select)]);
}
function getUserOpts(users) {
	const opts = [{ text: '- None - ', value: 0 }];
	users.forEach(user => opts.push({ text: user.name, value: user.id }));
	return opts;
}
/* ________________________ FEEDBACK STATUS _________________________________ */
function getFeedbackStatuElem(curStatus) {
	const select = _el('getSelect', [
		getStatusOpts(), {id: 'sel-feedbackStatus'}, onDataChange, curStatus]);
	$(select).data('original', curStatus);
	return _el('getFieldRow', [getFeedbackFieldConfg('fStatus', 'Status:', select)]);
}
function getStatusOpts() {
	const statuses = ['Closed', 'Follow-Up', 'Read', 'Unread'];
	return statuses.map((status, idx) => { return { text: status, value: idx }});
}
/* _________________________ ADMIN NOTES ____________________________________ */
function getAdminNotesElem(notes) {
	const input = buildAdminNotesTextarea(notes);
	$(input).data('original', notes).keyup(onDataChange);
	return _el('getFieldRow', [getFeedbackFieldConfg('fNotes', 'Notes:', input)]);
}
function buildAdminNotesTextarea(notes) {
	const attr = {
		id: 'feedback-notes',
		placeholder: 'Add notes about this feedback here...',
		text: notes
	};
	return _el('getElem', ['textarea', attr]);
}
/* ------------------------ POPUP FOOTER ------------------------------------ */
function getFeedbackResponseFooter() {
    const confg = {
    	action: 'edit',
        formName: 'Feedback',
        onSubmit: updateFeedback,
        onCancel: closePopup
    };
    return _el('getFormFooter', [confg]);
}
/* -------------------- BUILD AND APPEND POPUP ------------------------------ */
function buildAndShowResponsePopup(elems) {
	const popup = getFeedbackResponsePopup();
	$('body').prepend(popup);
	$(popup).append(elems).fadeIn("fast");
}
function getFeedbackResponsePopup() {
	const $popup = $(_el('getElem', ['div', {id: 'feedback-popup'}]));
	$popup.css({
		display: 'none'
	});
	return $popup;
}
/* ========================= HANDLE SUBMIT ================================== */
function onDataChange() {											/*dbug-log*///console.log("onDataChange called.");
	if (!submitEnabled && hasChangedData()) {
		toggleFeedbackSubmitButton();
	} else if (submitEnabled && !hasChangedData()) {
		toggleFeedbackSubmitButton(false);
	}
}
function hasChangedData() {											/*dbug-log*///console.log("hasChangedData called. will return -> ", (noteHasChanges || statusHasChanges || assignedUserHasChanges));
	const fields = ['#sel-feedbackStatus', '#sel-assignedUser', '#feedback-notes'];
	return fields.find(fieldHasChanges);
}
function fieldHasChanges(field) {
	return $(field).val() !== $(field).data('original');
}
/* ----------------------------- TOGGLE SUBMIT ------------------------------ */
function toggleFeedbackSubmitButton(enable = true) {				/*dbug-log*///console.log('toggleFeedbackSubmitButton enable?[%s]', enable);
    const opac = enable ? 1 : .35;
    submitEnabled = enable;
    $('#Feedback-submit').fadeTo( 'fast', opac).attr({'disabled': !enable});
}
/* ---------------------------- SUBMIT UPDATE ------------------------------- */
function updateFeedback() {
	const url = 'feedback/update/'+feedbackId;
	const userId = $('#sel-assignedUser').val();
	const data = {
		assignedUserId: userId === 0 ? null : userId,
		adminNotes: $('#feedback-notes').val(),
		status: $('#sel-feedbackStatus').val()
	};   															/*dbug-log*///console.log('Updated feedback = %O', $('#sel-feedbackStatus').val(), data)
    _u('sendAjaxQuery', [data, url, feedbackUpdateSucess]);
}
function feedbackUpdateSucess(data, textStatus, jqXHR) {			/*dbug-log*///console.log('feedbackUpdateSucess data = ', data);
	closePopup();
}
/* =========================== CLOSE POPUP ================================== */
function closePopup() {
	$('#feedback-popup').fadeOut('slow', () => document.location.reload(true));
}