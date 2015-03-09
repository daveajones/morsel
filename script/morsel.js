/**
 * Created by Dave Jones on 3/7/2015.
 */

    //Globals
    var firstCall = true;
    var oscillator;
    var freq = 700;
    var amp;
    var nextStep = 0;
    var speed = 0.9;
    var dit = 60;
    var eLoop = null;
    var audioOut = false;
    var audioAnimate;
    var statusBar = $('.statusBar');
    var codestack = [];
    var audioContext = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext);
    var lastOutputTime = null;

    //Initialize values according to currently set speed
    var cDit = (dit / speed) / 1000;
    var cDot = (dit / speed) / 1000;
    var cDash = (cDot * 3);
    var clGap = cDash + cDot;
    var cwGap = (cDot * 7);

    //Supported browser?
    if( !audioContext ) {
        alert("This browser doesn't support WebAudio.");
    } else {
        nextStep = initAudio(audioContext);
        nextStep = startTone(audioContext, freq);
        changeSpeed(speed);
        startEventLoop();
    }

    // Add missing functions to make the oscillator compatible with the later standard.
    //__via webaudio_tools library
    function fixOscillator(osc)
    {
        if (typeof osc.start == 'undefined') {
            osc.start = function(when) {
                osc.noteOn(when);
            }
        }
        if (typeof osc.stop == 'undefined') {
            osc.stop = function(when) {
                osc.noteOff(when);
            }
        }
    }

    // Recalculate speed of morse engine
    function changeSpeed(currentSpeed) {
        cDit = (dit / currentSpeed) / 1000;
        cDot = (dit / currentSpeed) / 1000;
        cDash = (cDot * 3);
        clGap = cDash + cDot;
        cwGap = (cDot * 7);
    }

    // Create an oscillator and an amplifier.
    function initAudio(ac) {
        oscillator = ac.createOscillator();
        fixOscillator(oscillator);
        oscillator.frequency.value = 440;
        amp = ac.createGain();
        amp.gain.value = 0;
        oscillator.connect(amp);
        amp.connect(ac.destination);

        return ac.currentTime;
    }

    // Start the event loop
    function startEventLoop() {
        console.log("startEventLoop()");
        eLoop = setInterval(function() {
            //console.log("Current scheduler time: " + audioContext.currentTime);
            if(codestack.length > 0) {
                //console.log("More strings on the stack");
                ms = codestack.pop();
                console.log("Scheduling [" + ms + "] for output at: [" + (lastOutputTime + cwGap) + "]");
                if( lastOutputTime > audioContext.currentTime ) {
                    generateMorse(ms, lastOutputTime + cwGap);
                } else {
                    generateMorse(ms, audioContext.currentTime);
                }
            } else {
                //console.log("Finished generating all strings");
                stopAnimation();
                audioOut = false;
            }
        }, (cwGap * 3));
    }

    // Set the frequency of the oscillator and start it running.
    function startTone( ac, frequency ) {
        var now = ac.currentTime;

        oscillator.start(0);
        oscillator.frequency.setValueAtTime(frequency, now);
        amp.gain.cancelScheduledValues(now);
        amp.gain.setValueAtTime(0, now);
        console.log("startTone(" + ac + ", " + frequency + ")");

        return now + 1;
    }

    // Stop the oscillator at a certain time or now
    //function stopTone( ac, atTime ) {
    //    var now = ac.currentTime;
    //    if( typeof atTime !== "undefined" ) {
    //        now = atTime;
    //    }
    //
    //    amp.gain.cancelScheduledValues(now);
    //    amp.gain.setValueAtTime(amp.gain.value, now);
    //    amp.gain.linearRampToValueAtTime(0.0, ac.currentTime + 1.0);
    //    oscillator.stop(now);
    //    console.log("stopTone(" + now + ")");
    //
    //    return 0;
    //}

    function addMorseToStack( morsestring ) {
            console.log("Pushing " + morsestring + " onto the stack.");
            codestack.unshift(morsestring);
            firstCall = false;

            return true;
    }

    // Retrieves the selected text or outline node and generates the audio
    function generateMorse( morsestring, ns ) {

        //Get the current time plus word gap so we don't clobber
        if( typeof ns !== "undefined" ) {
            nextStep = ns;
        } else {
            nextStep = audioContext.currentTime + cwGap;
        }

        //Generate the morse
        console.log("Not generating. Starting new generation.");
        startAnimation();
        audioOut = true;
        morsestring.forEach(function(letter) {
            if( letter !== " ") nextStep += clGap;
            if( letter === " ") {
                nextStep += cwGap;
            } else {
                var md = convertLetterToMorseData(letter);
                nextStep = outputLetter(md, nextStep);
            }
        });
        lastOutputTime = nextStep;

        return false;
    }

    //Morse code lookup table
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
            "?":function() { return [dot,dot,dash,dash,dot,dot]; },
            ",":function() { return [dash,dash,dot,dot,dash,dash]; },
            ":":function() { return [dash,dash,dash,dot,dot,dot]; },
            "'":function() { return [dot,dash,dash,dash,dash,dot]; },
            "-":function() { return [dash,dot,dot,dot,dot,dash]; },
            "/":function() { return [dash,dot,dot,dash,dot]; },
            '(':function() { return [dash,dot,dash,dash,dot,dash]; },
            ")":function() { return [dash,dot,dash,dash,dot,dash]; },
            '"':function() { return [dot,dash,dot,dot,dash,dot]; },
            '(':function() { return [dash,dot,dash,dash,dot,dash]; },
            "@":function() { return [dot,dash,dash,dot,dash,dot]; },
            "=":function() { return [dash,dot,dot,dot,dash]; }
        };

        return letters[letter]();
    }

    //Schedule the output of the letter data
    function outputLetter( letter, ns ) {

        letter.forEach(function(value) {
            amp.gain.setValueAtTime(0.5, ns);
            ns += value;
            amp.gain.setValueAtTime(0, ns);
            ns += cDit;
        });
        console.log("outputLetter(" + letter + ", " + ns + ")");

        return ns;
    }

    //Start audio output animation
    function startAnimation() {
        audioAnimate = setInterval(function() {
            if(statusBar.find('.status').hasClass('fa-tty')) {
                statusBar.find('.status').removeClass('fa-tty').addClass('fa-volume-off');
            } else
            if(statusBar.find('.status').hasClass('fa-volume-off')) {
                statusBar.find('.status').removeClass('fa-volume-off').addClass('fa-volume-down');
            } else
            if(statusBar.find('.status').hasClass('fa-volume-down')) {
                statusBar.find('.status').removeClass('fa-volume-down').addClass('fa-volume-up');
            } else
            if(statusBar.find('.status').hasClass('fa-volume-up')) {
                statusBar.find('.status').removeClass('fa-volume-up').addClass('fa-volume-off');
            }
        }, 300);
    }

    //Stop audio output animation
    function stopAnimation() {
        clearInterval(audioAnimate);
        statusBar.find('i.status').removeClass('fa-volume-up').removeClass('fa-volume-down').removeClass('fa-volume-off').addClass('fa-tty');
    }
