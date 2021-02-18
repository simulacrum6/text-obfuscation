"use strict";
function obfuscateChar(c) {
    var maxDiacritics = 4;
    var udMin = 0x0300; // diacritics range start 
    var udMax = 0x036F; // diacritics range end
    var nDiacritics = Math.floor(Math.random() * maxDiacritics + 1);
    var obfuscated = [c];
    for (var i = 0; i < nDiacritics; i++) {
        obfuscated.push(getRandomUnicodeChar(udMin, udMax));
    }
    return obfuscated.join('');
}
function getRandomUnicodeChar(min, max) {
    if (min === void 0) { min = 0x0000; }
    if (max === void 0) { max = 0xFFFF; }
    var range = max - min;
    var codePoint = Math.floor(Math.random() * range) + min;
    return String.fromCodePoint(codePoint);
}
function obfuscate(text, obfuscationProbability) {
    return Array.from(text)
        .map(function (c) { return Math.random() < obfuscationProbability ? obfuscateChar(c) : c; })
        .join('');
}
function obfuscateInput() {
    var input = document.getElementById('obfuscation-input');
    var output = document.getElementById('obfuscation-output');
    if (input === null) {
        throw new Error('No element with id "obfuscation-input" in DOM!');
    }
    if (output == null) {
        throw new Error('No element with id "obfuscation-output" in DOM!');
    }
    output.innerHTML = obfuscate(input.value, 0.33);
}
function obfuscateDescription() {
    var desc = document.getElementById('description');
    if (desc === null) {
        throw new Error('No element with id "description" in DOM!');
    }
    desc.innerHTML = obfuscate(desc.innerHTML, 0.25);
}
window.onload = obfuscateDescription;
