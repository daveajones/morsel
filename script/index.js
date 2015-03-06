/**
 * Created by djones on 2/23/2015.
 */

//Handle some special key stroke stuff
function opKeystrokeCallback(event) {
    //Enter key generates the morse code audio output
    if ( event.which == 13 )  {
        generateMorse(opGetLineText());
    }
}

//Get selected text
//_____http://motyar.blogspot.fi/2010/02/get-user-selected-text-with-jquery-and.html
function getSelected() {
    if(window.getSelection) { return window.getSelection(); }
    else if(document.getSelection) { return document.getSelection(); }
    else {
        var selection = document.selection && document.selection.createRange();
        if(selection.text) { return selection.text; }
        return false;
    }
}

function stripTags(html)
{
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText;
}
