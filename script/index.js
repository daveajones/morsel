/**
 * Created by djones on 2/23/2015.
 */

//Handle some special key stroke stuff
function opKeystrokeCallback(event) {
    //Enter key generates the morse code audio output
    if ( event.which == 13 )  {
        //Make sure there is no html in the string and that it only contains lowercase alphanumeric
        morsestring = opGetLineText();
        morsestring = stripTags(morsestring);
        if( morsestring == "<3" || morsestring == "xoxo" ) {
            morsestring = " 88 ";
        }
        if( morsestring == ":-)" || morsestring == ":)" ) {
            morsestring = " 73 ";
        }
        morsestring.replace(/[^a-zA-Z 0-9\?\.\,\:\'\-\/\(\)\"\@\=]+/g,'');
        morsestring = morsestring.toLowerCase().split("");
        if( !firstCall ) {
            if($('#chkNewline').is(":checked")) {
                codestack.unshift(" aa ".split(""));
            }
        }
        addMorseToStack(morsestring);
        console.log(morsestring);

        return true;
    }
    //This isn't meant to be an outline, so block indentation
    if ( event.which == 9 ) {
        event.which = null;
        return false;
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

//Initialize
$(document).ready(function() {
    $("#outliner").concord({
        "callbacks": {
            "opKeystroke": opKeystrokeCallback
        },
        "prefs": {
            "outlineFont": "Consolas",
            "outlineFontSize": 18,
            "outlineLineHeight": 24,
            "renderMode": false,
            "readonly": false,
            "typeIcons": appTypeIcons
        }
    });
    opXmlToOutline(initialOpmltext);
    opSetTextMode(true);

    $('#speed').change(function() {
        speed = $('#speed').val();
        changeSpeed(speed);
    });
});