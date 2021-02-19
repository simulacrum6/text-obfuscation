"use strict";
function randCheck(target) {
    return Math.random() < target;
}
function randInt(min = 0, max = 100) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}
function obfuscateChar(char, minObfuscations = 0, maxObfuscations = 4) {
    const minCodePoint = 0x0300; // diacritics range start 
    const maxCodePoint = 0x036F; // diacritics range end
    const numDiacritics = randInt(minObfuscations, maxObfuscations);
    const dicaricits = Array(numDiacritics).fill(null)
        .map(_ => randInt(minCodePoint, maxCodePoint))
        .map(codePoint => String.fromCodePoint(codePoint));
    return [char].concat(dicaricits).join('');
}
function obfuscate(text, obfuscationProbability) {
    return Array.from(text)
        .map(c => randCheck(obfuscationProbability) ? obfuscateChar(c) : c)
        .join('');
}
function obfuscateInput() {
    const input = document.getElementById('obfuscation-input');
    const output = document.getElementById('obfuscation-output');
    if (input === null) {
        throw new Error('No element with id "obfuscation-input" in DOM!');
    }
    if (output == null) {
        throw new Error('No element with id "obfuscation-output" in DOM!');
    }
    output.innerHTML = obfuscate(input.value, 0.33);
}
function obfuscateDescription() {
    const desc = document.getElementById('description');
    if (desc === null) {
        throw new Error('No element with id "description" in DOM!');
    }
    desc.innerHTML = obfuscate(desc.innerHTML, 0.25);
}
window.onload = obfuscateDescription;
