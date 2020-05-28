const exports = module.exports = { init: init };
var minTopicChars = 3; 
var minContentChars = 10;
var maxTopicChars = 50;
var maxContentChars = 500;
var submitDisabled = true;
var $body = $('body');
var $masthead = $('#hdrmenu');
var feedbackUrl = $body.data('base-url') + 'feedback/post';
var thisUrl = $body.data('this-url');
    
/** Creates the "Leave Feedback" menu option for all registered users. */
function init() {
    if (feedbackUrl == "false") { return; }
    const fdbkElem = '<li id="feedback-menu"><a href="#">Leave Feedback</a></li>';
    $('#oimenu>.last>ul').prepend(fdbkElem);
    $('#feedback-menu').on('click', showFeedbackPopup);
}
function showFeedbackPopup() {
    createFeedbackPopUp();
    addPopupEvents();               
    submitDisabled && hasValidData() && enableSubmit();
    $('#b-overlay').fadeIn("slow");
}
function hasValidData() {
    return $('.feedback-popup input').val().length >= minTopicChars && 
        $('.feedback-popup>textarea').val().length >= minContentChars;
}
function postFeedback() {
    var data = {
            routeStr: thisUrl, 
            topicStr: $('.feedback-popup input').val(), 
            contentStr: $('.feedback-popup>textarea').val() 
        };
    closePopup() && sendAjaxQuery(data, feedbackUrl, feedbackSubmitted);
}
function sendAjaxQuery(dataPkg, url, successCb, errCb) {                        console.log("Sending Ajax data =%O arguments = %O", dataPkg, arguments)
    return $.ajax({
        method: "POST",
        url: url,
        success: successCb || dataSubmitSucess,
        error: errCb || ajaxError,
        data: JSON.stringify(dataPkg)
    });
    function ajaxError(jqXHR, textStatus, errorThrown) {
        console.log("ajaxError. responseText = [%O] - jqXHR:%O", jqXHR.responseText, jqXHR);
    }
}
function closePopup() {
    $('#b-overlay').fadeOut("slow", () => {
        $('#b-overlay-popup').empty();
        $('#b-overlay-popup').removeClass('feedback-popup');
        removePopupEvents();
    });
    return true;
}
function feedbackSubmitted(data, textStatus, jqXHR) {
    console.log("feedbackSubmitted - data = %O", data);
    $('.feedback-popup>textarea').val('');
    $('.feedback-popup input').val('');
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
        return curCnt + ' characters (' + min + ' minimum.)';
    } else if (curCnt < max) {
        submitDisabled && hasValidData() && enableSubmit();
        return curCnt + ' characters (' + max + ' max.)';
    } else {

    }
}
function enableSubmit() {
    console.log("enableSubmit called");
    $('.feedback-popup').on('click', "button[name='post-feedback']", postFeedback);
    $(".feedback-popup>button[name='post-feedback']").fadeTo( 'fast', 1);
    submitDisabled = false;
}
function disableSubmit() {
    console.log("disableSubmit called");
    $(".feedback-popup>button[name='post-feedback']").fadeTo( 'fast' , .35);
    $('.feedback-popup').off('click', "button[name='post-feedback']", postFeedback);
    submitDisabled = true;
}
function removePopupEvents() {
    $('.feedback-popup').off('click');
    $('.feedback-popup').off('keyup');
}
function addPopupEvents() {
    $('.feedback-popup').on('click', "button[name='cancel-feedback']", closePopup);
    $('.feedback-popup').on('keyup', 'input', function(){ setTopicsChars($(this).val().length); });
    $('.feedback-popup').on('keyup','textarea' ,function(){ setContentChars($(this).val().length); });
}
function createFeedbackPopUp() {
    var helpTxt = 'Leave us feedback about your experience ' + 
        'of using the Bat Eco-Interactions database!'       
    var popup = $('#b-overlay-popup');
    popup.addClass('feedback-popup');
    popup.append($('<p></p>').text(helpTxt));
    popup.append($('<label>Topic <input type="text" name="topic" placeholder="Topic of your feedback"></label>'));
    popup.append($('<p id="topic-chars"></p>').css({ 'font-size': '.8em' }));
    popup.append($('<textarea placeholder="Type your feedback here..."></textarea>'));
    popup.append($('<p id="content-chars"></p>').css({ 'font-size': '.8em' }));
    popup.append($('<button name="post-feedback">Submit Feedback</button>'));
    popup.append($('<button name="cancel-feedback">Cancel</button>'));
    setTopicsChars(0);
    setContentChars(0);
}