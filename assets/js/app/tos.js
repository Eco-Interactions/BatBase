const exports = module.exports = { init: init };

function init() {
    $('#reg-tos, #footer-tos, .tos-trigger').click(showTos);
    hideRegistrationSubmit();
}

/** If this is the registration page, diable the submit button. */
function hideRegistrationSubmit() {
    if ($("#reg-submit")) { replaceWithAcceptTosBttn(); }
}
function replaceWithAcceptTosBttn() {
    $('#reg-submit').hide()
}
/** Show the ToS. If this is the registration page, show the 'accept' elements */
function showTos() {  
    if ($(this)[0].id === "reg-tos") { 
        showTosWindow();
        addRegistrationTosElems();
    } else { showTosWindow(); }
    addCloseButton();
}
function addCloseButton() {
    $("#b-overlay-popup").append(`
        <button id="close-tos-bttn" class="tos-bttn">Close</button>`);
    $('#close-tos-bttn').click(closeTosWindow)
}
function showTosWindow() {  console.log("showTosWindow called")
    $("#b-overlay-popup").html(getTosHtml);
    $("#b-overlay-popup").addClass("tos-popup");
    bindEscEvents();
    $('#b-overlay, #b-overlay-popup').fadeIn(500);

    function bindEscEvents() {
        $(document).on('keyup',function(evt) {
            if (evt.keyCode == 27) { closeTosWindow(); }
        });
        $("#b-overlay").click(closeTosWindow);
        $("#b-overlay-popup").click(function(e) { e.stopPropagation(); });
    }
} /* End showTosWindow */
function closeTosWindow() {
    $("#b-overlay").css({ "display": "none" });
    unbindEscEvents();
    removeTosStyles();
}
function unbindEscEvents() {
    $(document).on('keyup',function(){});
    $("#b-overlay").click(function(){});
}
function removeTosStyles() {
    $("#b-overlay-popup").removeClass("tos-popup");
    $("#b-overlay").removeClass("flex-col");
    $("#b-overlay-popup").empty();
}
function addRegistrationTosElems() {  console.log("addRegistrationTosElems called")
    var acceptDiv = document.createElement("div");
    acceptDiv.id = "accept-tos-cntnr";
    acceptDiv.className = "flex-col";
    $(acceptDiv).append(acceptTosHtml());
    $("#b-overlay-popup").append(acceptDiv);

    $("#accept-tos").click(acceptTos);
}
function acceptTosHtml() {
    return `
        <span>These Terms of Use are always available in bottom right of any page on this website.</span>
        <label id="accept-tos" class="top-em-mrg">
            <input type="checkbox"> I agree to the Bat Eco-Interactions Terms and Conditions of Use.
        </label>`;
}
function acceptTos() {
    $('#reg-tos').hide();
    $('#reg-submit').show();
}

function getTosHtml() {
    return `<div id="terms-div">
<h3>Privacy Policy</h3>
<br>
<p>- We don't use cookies.<br>- We won't sell, rent or share our users' names and emails with anyone.<br>- We do use some of the local storage available in your browser to store interaction data, so you don't have to wait for it to download every time you visit the site.<br>- We do send out emails occasionally to let users know about major updates to the site. If this privacy policy ever changes, we'll email to let you know that. The same applies to our Terms of Use.<br>- We also use your email when verifying your new account and if you need to reset your password.<br>- If you have questions, please contact us at <a href="mailto:info@batplant.org" target="_top">info@batplant.org.</a><br></p>
<br>
<h3>Terms of Use</h3>
<br>
<span class="lbl top-em-mrg">General</span>
<p>These Terms of Use apply to the use of the information at The Bat Eco-Interactions project. By submitting information to, accessing, using or downloading data from Bat Eco-Interactions, users enter into a binding agreement to accept the Terms of Use described herein.</p>
<br>
<span class="lbl">Obligations and responsibilities of the user</span>
<p>When using or releasing onwards the information provided by us, the user must credit the original source of the information and provide facts in an accurate way.</p>
<p>When using this information the user may not claim that Bat Eco-Interactions would support or recommend the mode of use concerned.</p>
<br>
<span class="lbl">Obligations and responsibilities of Bat Eco-Interactions</span>
<p>This website includes text, photos, and other visual media created by the Bat Eco-Interactions Database project. We encourage further use, re-publication, and dissemination of our information, provided compliance with the Terms of Use, the facts provided by us remain undistorted, and the original source of the information is mentioned.</p>
<p>Bat Eco-Interactions is not responsible for any possible errors in the material or for direct or indirect damages arising from the use of the material. We do not guarantee continuous availability of the material, neither that the material will be unchanged. Changes may occur, e.g., when tables are reorganized or new data included.</p>
<p>Bat Eco-Interactions respect and protect the privacy of its users, and will not disclose individually identifiable personal information about its users. Aggregate information that does not personally identify a user can be shared with third parties without restriction. One such third party is Google Analytics, (see their privacy policy), which is used to understand how the website is being used.</p>
<br>
<span class="lbl">Liability</span>
<p>Information at Bat Eco-Interactions is provided “AS IS” and without warranties of any kind either expressed or implied. Information at this website is believed to be accurate at the time it was placed on the website, however, our data are not all-inclusive, and are limited to what is made available to us therefore such information should not be relied upon as all-inclusive, neither free of errors. We cannot be held responsible for any inconvenience that may arise from these.</p>
<p>Changes may be made at any time without prior notice. All data provided on this website is to be used for information purposes only.</p>
<br>
<span class="lbl">Citations</span>
<p>You are welcome to include information from Bat Eco-Interactions in your own printed and online material for non-commercial use only. However, when you publish these data or works based on Bat Eco-Interactions data, we request that you cite Bat Eco-Interactions within the text of the publication and include a reference to it in your reference list.</p>
<p>The source of origin and the date of the version of the information must be given when the material is used. Please follow the following citation format:</p>
<p><i>Geiselman, Cullen K. and Tuli I. Defex. 2015. Bat Eco-Interactions Database. www.batplant.org, version (date accessed).</i></p>
<p>Photos and drawings belong to the indicated persons or organizations and have their own copyright statements.</p>
<br>
<span class="lbl">Confidentiality of Codes, Passwords and Information</span>
<p>The user agrees to treat as strictly private and confidential any code, username, user ID, or password linked to Bat Eco-Interactions, and all information to which you have access through password-protected areas at batplant.org. You will not cause or permit any such information to be communicated, copied or otherwise divulged to any other person.</p>
<br>
<span class="lbl">Links and Marks</span>
<p>Bat Eco-Interactions is not necessarily affiliated with websites that may be linked to this website and is not responsible for their content. The linked sites are for the user’s convenience only and you access them at your own discretion. Links to other websites or references to information or publications do not imply the endorsement or approval of such websites, information or publications by Bat Eco-Interactions.</p>
<br>
<span class="lbl">Termination</span>
<p>Bat Eco-Interactions reserves the right to suspend use if the user engages in, or is suspected of engaging in, prohibited activities or in any other way breaches any of the party's obligations, representations or warranties hereunder.</p>
<br>
<span class="lbl">Changes to the Terms of Use</span>
<p>Bat Eco-Interactions may alter these Terms of Use at any time or apply different Terms of Use to certain material. These Terms of Use will not be altered retrospectively.</p>
</div>`;
}
