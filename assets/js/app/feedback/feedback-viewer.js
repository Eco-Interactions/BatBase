/**
 * Handles loading and managind user-submitted feedback for the admin-view page.
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
import { getElem, getSelect, getFieldRow, getFormFooter, sendAjaxQuery, ucfirst } from '~util';

let submitEnabled = false;

$('#feedback_tbl').on('click', "a.feedback-link", showContextPage);
/* ========================= SHOW CONTEXT PAGE ============================== */
/** Shows the page the feedback was submitted from. */
function showContextPage(e) {
	e.preventDefault()
	sendAjaxQuery(null, 'feedback/load/'+$(this).data('id'), feedbackEntryRecieved);
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
	const data = getEditableFeedbackData(feedback);					/*dbug-log*/console.log("createFeedbackResponsePopup feedback = %O, editableData = %O", feedback, data);
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
/* ----------------------- SUBMITTED FEEDBACK ------------------------------- */
function getSubmittedFeedbackElems(feedback, data) {
	return [
		getSubmittedBy (feedback),
		getTopic(feedback),
		getFeedbackText(feedback)
	];
}
function getDisplayElems(name, dText, label = null) {
	const displayText = getElem('span', { text: dText });
	return getFieldRow(getDisplayFieldConfg(name, label, displayText));
}
function getDisplayFieldConfg(name, label, input) {
    return {
        flow: 'row',
        input: input,
        label: label ? label : ucfirst(name)+':',
        name: name,
    };
}
/* __________________________ SUBMITTED-BY __________________________________ */
function getSubmittedBy(feedback) {
	const userAndDate = feedback.from.name + ' - ' + formatDate(feedback.submitted.date);
	return getDisplayElems('submitted', userAndDate, 'Submitted by:');
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
		getAssignedUserField(feedback.users, data.assignedUser),
		getFeedbackStatuElem(feedback.status),
		getAdminNotesElem(feedback.notes)
	];
}
/* ____________________ FEEDBACK ASSIGNED TO ________________________________ */
function getAssignedUserField(users, assignedId) {
	const select = getSelect(
		getUserOpts(users), {id: 'sel-assignedUser'}, onDataChange, assignedId);
	$(select).data('original', assignedId);
	return getFieldRow(getDisplayFieldConfg('fAssigned', 'Assigned to:', select));
}
function getUserOpts(users) {
	const opts = [new Option('- None - ', 0)];
	users.forEach(user => opts.push(new Option(user.name, user.id)));
	return opts;
}
/* ________________________ FEEDBACK STATUS _________________________________ */
function getFeedbackStatuElem(curStatus) {
	const select = getSelect(
		getStatusOpts(), {id: 'sel-feedbackStatus'}, onDataChange, curStatus);
	$(select).data('original', curStatus);
	return getFieldRow(getDisplayFieldConfg('fStatus', 'Status:', select));
}
function getStatusOpts() {
	const statuses = ['Closed', 'Follow-Up', 'Read', 'Unread'];
	return statuses.map((status, idx) => new Option(status, idx));
}
/* _________________________ ADMIN NOTES ____________________________________ */
function getAdminNotesElem(notes) {
	const input = buildAdminNotesTextarea(notes);
	$(input).data('original', notes).keyup(onDataChange);
	return getFieldRow(getDisplayFieldConfg('fNotes', 'Notes:', input));
}
function buildAdminNotesTextarea(notes) {
	const attr = {
		id: 'feedback-notes',
		placeholder: 'Add notes about this feedback here...',
		text: notes
	};
	return getElem('textarea', attr);
}
/* ------------------------ POPUP FOOTER ------------------------------------ */
function getFeedbackResponseFooter() {
    const confg = {
    	action: 'edit',
        formName: 'Feedback',
        onSubmit: updateFeedback,
        onCancel: closePopup
    };
    return getFormFooter(confg);
}
/* -------------------- BUILD AND APPEND POPUP ------------------------------ */
function buildAndShowResponsePopup(elems) {
	const popup = getFeedbackResponsePopup();
	$('body').prepend(popup);
	$(popup).append(elems).fadeIn("fast");
}
function getFeedbackResponsePopup() {
	const $popup = $(getElem('div', {id: 'feedback-popup'}));
	$popup.css({
		display: 'none'
	});
	return $popup;
}
/* ========================= HANDLE SUBMIT ================================== */
function onDataChange() {											/*dbug-log*/console.log("onDataChange called.");
	if (!submitEnabled && hasChangedData()) {
		toggleFeedbackSubmitButton();
	} else if (submitEnabled && !hasChangedData()) {
		toggleFeedbackSubmitButton(false);
	}
}
function hasChangedData() {											/*dbug-log*/console.log("hasChangedData called. will return -> ", (noteHasChanges || statusHasChanges || assignedUserHasChanges));
	const fields = ['#sel-feedbackStatus', '#sel-assignedUser', '#feedback-notes'];
	return fields.find(fieldHasChanges);
}
function fieldHasChanges(field) {
	return $(field).val() !== $(field).data('original');
}
/* ----------------------------- TOGGLE SUBMIT ------------------------------ */
function toggleFeedbackSubmitButton(enable = true) {				/*dbug-log*/console.log('toggleFeedbackSubmitButton enable?[%s]', enable);
    const opac = enable ? 1 : .35;
    submitEnabled = enable;
    $('#Feedback-submit').fadeTo( 'fast', opac).attr({'disabled': !enable});
}
/* ---------------------------- SUBMIT UPDATE ------------------------------- */
function updateFeedback() {
	const url = 'feedback/update/'+$(this).data('id');
	const userId = $('#assignedUser').val();
	const data = {
		assignedUserId: userId === 0 ? null : userId,
		adminNotes: $adminNotesElem.val(),
		status: $('#feedback-status').val()
	};
    sendAjaxQuery(data, url, feedbackUpdateSucess);
}
function feedbackUpdateSucess(data, textStatus, jqXHR) {			/*dbug-log*/console.log('feedbackUpdateSucess data = ', data);
	closePopup();
}
/* =========================== CLOSE POPUP ================================== */
function closePopup() {
	$('#feedback-popup').fadeOut('slow', () => document.location.reload(true));
}