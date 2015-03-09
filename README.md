# morsel
Morse code dictator console in a browser.

[Go here](http://daveajones.github.io/morsel/) to play with the demo.

## Details
Using the keypress callback of the Concord outliner, each time the enter key is pressed, the current line's text is parsed into an array of characters and unshifted to the front of the string stack.  An event loop then pops the strings off of the stack and schedules them for output.

Output consists of parsing the string array and looking up each character in a lookup table to retrieve it's corresponding morse sequence as an array of dot and dash timer values.  The amplifier is then scheduled to raise and lower the volume according to the dot-dash array given.

Doing this on a 700 mhz sine wave gives the illusion of morse keying.
