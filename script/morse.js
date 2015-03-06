/**
 * Created by djones on 2/23/2015.
 */

var oscillator;
var amp;
var nextStep = 0;
var speed = 0.9;
var dit = 60;
var audioOut = false;
var audioAnimate;
var statusBar = $('div.statusBar');

// Retrieves the selected text or outline node and generates the audio
function generateMorse( morsestring ) {
    if( audioOut == true ) {
        nextStep = stopTone();
        return false;
    }

    if( typeof morsestring === "undefined" ) {
        var morsestring = getSelected();
        if( morsestring == "" || morsestring == "..." ) {
            morsestring = opGetLineText();
        } else {
            morsestring = new String(morsestring);
        }
    } else {
        console.log(morsestring);
    }
    morsestring = stripTags(morsestring);
    morsestring.replace(/[^a-zA-Z 0-9?.]+/g,'');
    morsestring = morsestring.toLowerCase().split("");
    console.log(morsestring);
    //Initialize values according to current speed
    cDit = (dit / speed) / 1000;
    cDot = (dit / speed) / 1000;
    cDash = (cDot * 3);
    clGap = cDash + cDot;
    cwGap = (cDot * 7);

    initAudio();
    nextStep = startTone(700);


    morsestring.forEach(function(letter) {
        if( letter !== " ") nextStep += clGap;
        if( letter === " ") {
            nextStep += cwGap;
        } else {
            var md = convertLetterToMorseData(letter);
            nextStep = outputLetter(md, nextStep);
        }
    });

    //nextStep = stopTone(nextStep + 1);
    return false;
}

// Create an oscillator and an amplifier.
function initAudio() {
    // Use audioContext from webaudio_tools.js
    if( audioContext )
    {
        oscillator = audioContext.createOscillator();
        fixOscillator(oscillator);
        oscillator.frequency.value = 440;
        amp = audioContext.createGain();
        amp.gain.value = 0;
        oscillator.connect(amp);
        amp.connect(audioContext.destination);
        //writeMessageToID( "soundStatus", "<p>Audio initialized.</p>");
    } else {
        //writeMessageToID( "soundStatus", "<p>Can't initialize audio.</p>");
    }
}

// Set the frequency of the oscillator and start it running.
function startTone( frequency ) {
    audioOut = true;
    var now = audioContext.currentTime;

    oscillator.start(0);
    oscillator.frequency.setValueAtTime(frequency, now);

    audioAnimate = setInterval(function() {
        if(statusBar.find('i.status').hasClass('fa-tty')) {
            statusBar.find('i.status').removeClass('fa-tty').addClass('fa-volume-off');
        } else
        if(statusBar.find('i.status').hasClass('fa-volume-off')) {
            statusBar.find('i.status').removeClass('fa-volume-off').addClass('fa-volume-down');
        } else
        if(statusBar.find('i.status').hasClass('fa-volume-down')) {
            statusBar.find('i.status').removeClass('fa-volume-down').addClass('fa-volume-up');
        } else
        if(statusBar.find('i.status').hasClass('fa-volume-up')) {
            statusBar.find('i.status').removeClass('fa-volume-up').addClass('fa-volume-off');
        }
    }, 300);

    amp.gain.cancelScheduledValues(now);

    amp.gain.setValueAtTime(0, now);

    //writeMessageToID( "soundStatus", "<p>Play tone at frequency = " + frequency  + "</p>");

    return now + 1;
}

function stopTone( atTime ) {
    var now = audioContext.currentTime;
    if( typeof atTime !== "undefined" ) {
        now = atTime;
    }
    oscillator.onended = function() {
        audioOut = false;
        console.log("stopTone()");
        clearInterval(audioAnimate);
        statusBar.find('i.status').removeClass('fa-volume-up').removeClass('fa-volume-down').removeClass('fa-volume-off').addClass('fa-tty');
    };
    //amp.gain.cancelScheduledValues(now);
    amp.gain.setValueAtTime(amp.gain.value, now);
    amp.gain.linearRampToValueAtTime(0.0, audioContext.currentTime + 1.0);
    //writeMessageToID( "soundStatus", "<p>Stop tone.</p>");
    oscillator.stop(now);

    return 0;
}

function convertLetterToMorseData( letter ) {
    var dash = cDash;
    var dot = cDot;
    var letters = {
        "a":function() { return [dot,dash]; },
        "b":function() { return [dash,dot,dot,dot]; },
        "c":function() { return [dash,dot,dash,dot]; },
        "d":function() { return [dash,dot,dot]; },
        "e":function() { return [dot]; },
        "f":function() { return [dot,dot,dash,dot]; },
        "g":function() { return [dash,dash,dot]; },
        "h":function() { return [dot,dot,dot,dot]; },
        "i":function() { return [dot,dot]; },
        "j":function() { return [dot,dash,dash]; },
        "k":function() { return [dash,dot,dash]; },
        "l":function() { return [dot,dash,dot,dot]; },
        "m":function() { return [dash,dash]; },
        "n":function() { return [dash,dot]; },
        "o":function() { return [dash,dash,dash]; },
        "p":function() { return [dot,dash,dash,dot]; },
        "q":function() { return [dash,dash,dot,dash]; },
        "r":function() { return [dot,dash,dot]; },
        "s":function() { return [dot,dot,dot]; },
        "t":function() { return [dash]; },
        "u":function() { return [dot,dot,dash]; },
        "v":function() { return [dot,dot,dot,dash]; },
        "w":function() { return [dot,dash,dash]; },
        "x":function() { return [dash,dot,dot,dash]; },
        "y":function() { return [dash,dot,dash,dash]; },
        "z":function() { return [dash,dash,dot,dot]; },
        "0":function() { return [dash,dash,dash,dash,dash]; },
        "1":function() { return [dot,dash,dash,dash,dash]; },
        "2":function() { return [dot,dot,dash,dash,dash]; },
        "3":function() { return [dot,dot,dot,dash,dash]; },
        "4":function() { return [dot,dot,dot,dot,dash]; },
        "5":function() { return [dot,dot,dot,dot,dot]; },
        "6":function() { return [dot,dot,dot,dash,dash]; },
        "7":function() { return [dash,dash,dot,dot,dot]; },
        "8":function() { return [dash,dash,dash,dot,dot]; },
        "9":function() { return [dash,dash,dash,dash,dot]; },
        ".":function() { return [dot,dash,dot,dash,dot,dash]; },
        "?":function() { return [dot,dot,dash,dash,dot,dot]; }
    };

    return letters[letter]();
}

function outputLetter( letter, nextStep ) {

    letter.forEach(function(value) {
        amp.gain.setValueAtTime(0.5, nextStep);
        nextStep += value;
        amp.gain.setValueAtTime(0, nextStep);
        nextStep += cDit;
    });

    return nextStep;
}