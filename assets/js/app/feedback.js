const exports = module.exports = { init: init };
var minTopicChars = 3; 
var minContentChars = 10;
var maxTopicChars = 50;
var maxContentChars = 500;
var submitDisabled = true;
var $body = $('body');
var $masthead = $('#masthead');
var feedbackUrl = $body.data('ajax-target-url') + 'feedback/post';
var thisUrl = $body.data('this-url');
var $lastTopMenu = $('#oimenu>li.last');
    
/** Creates the "Leave Feedback" menu option for all registered users. */
function init() {
    if (feedbackUrl !== "false") {
        createFeedbackPopUp();
        $lastTopMenu.after('<li id="feedback-menu"><a href="#">Leave Feedback</a></li>');
        $('#feedback-menu').on('click', showFeedbackPopup);
    }
}
function showFeedbackPopup() {
    addPopupEvents();               
    submitDisabled && hasValidData() && enableSubmit();
    $('#feedback-popup').fadeIn("slow");
}
function hasValidData() {
    return $('#feedback-popup input').val().length >= minTopicChars && 
        $('#feedback-popup>textarea').val().length >= minContentChars;
}
function postFeedback() {
    const _util = require('../misc/util.js');                                   console.log('util = %O', _util);
    var data = {
            routeStr: thisUrl, 
            topicStr: $('#feedback-popup input').val(), 
            contentStr: $('#feedback-popup>textarea').val() 
        };
    closePopup() && _util.sendAjaxQuery(data, feedbackUrl, feedbackSubmitted);
}
function closePopup() {
    console.log('closePopup called');
    $('#feedback-popup').fadeOut("slow");
    return true;
}
function feedbackSubmitted(data, textStatus, jqXHR) {
    console.log("feedbackSubmitted - data = %O", data);
    $('#feedback-popup>textarea').val('');
    $('#feedback-popup input').val('');
    setTopicsChars(0);
    setContentChars(0);
}
function setTopicsChars(charCnt) {
    $('#topic-chars').text(getCharStr(charCnt, minTopicChars, maxTopicChars))
}
function setContentChars(charCnt) {
    $('#content-chars').text(getCharStr(charCnt, minContentChars, maxContentChars))
}
function getCharStr(curCnt, min, max) {
    if (curCnt < min) {
        submitDisabled || disableSubmit();
        return curCnt + ' characters (minimum ' + min + ' needed)';
    } else if (curCnt < max) {
        submitDisabled && hasValidData() && enableSubmit();
        return curCnt + ' characters (' + (max - curCnt) + ' remain of max ' + max + ' allowed)';
    } else {

    }
}
function enableSubmit() {
    console.log("enableSubmit called");
    $('#feedback-popup').on('click', "button[name='post-feedback']", postFeedback);
    $("#feedback-popup>button[name='post-feedback']").fadeTo( 'fast', 1);
    submitDisabled = false;
}
function disableSubmit() {
    console.log("disableSubmit called");
    $("#feedback-popup>button[name='post-feedback']").fadeTo( 'fast' , .35);
    $('#feedback-popup').off('click', "button[name='post-feedback']", postFeedback);
    submitDisabled = true;
}
function removePopupEvents() {
    $('#feedback-popup').off('click');
    $('#feedback-popup').off('keyup');
}
function addPopupEvents() {
    $('#feedback-popup').on('click', "button[name='cancel-feedback']", closePopup);
    $('#feedback-popup').on('keyup', 'input', function(){ setTopicsChars($(this).val().length); });
    $('#feedback-popup').on('keyup','textarea' ,function(){ setContentChars($(this).val().length); });
}
function createFeedbackPopUp() {
    var helpTxt = 'Leave us some feedback about you experience ' + 
        'of using the Bat Eco-Interactions database. ' +
        'Let use know how you think we could improve it.'       
    var popup = $('<div id="feedback-popup"></div>');
    popup.append($('<p></p>').text(helpTxt));
    popup.append($('<label>Topic <input type="text" name="topic" placeholder="Topic of your feedback"></label>'));
    popup.append($('<p id="topic-chars"></p>').text('No topic entered').css({ 'font-size': '.8em' }));
    popup.append($('<textarea placeholder="Type your feedback here..."></textarea>'));
    popup.append($('<p id="content-chars"></p>').text('No feedback entered').css({ 'font-size': '.8em' }));
    popup.append($('<button name="post-feedback">Submit Feedback</button>'));
    popup.append($('<button name="cancel-feedback">Cancel Feedback</button>'));
    popup.hide();
    $masthead.prepend(popup);
    $("#feedback-popup>button[name='post-feedback']").fadeTo( 'fast' , .35);
}