"use strict";
function randCheck(target) {
    return Math.random() < target;
}
function randInt(min = 0, max = 100) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}
function zip(a, b) {
    const n = Math.max(a.length, b.length);
    const c = Array(n);
    for (let i = 0; i < n; i++) {
        c[i] = [a[i % a.length], b[i % b.length]];
    }
    return c;
}
class Obfuscator {
    constructor() {
        this.obfuscationProbability = 1.0;
    }
    obfuscate(text, probs) {
        const chars = Array.from(text);
        if (!probs) {
            probs = Array(chars.length).fill(this.obfuscationProbability);
        }
        if (probs.length === 1) {
            probs = Array(chars.length).fill(probs[0]);
        }
        if (probs.length !== chars.length) {
            throw new Error('Passed probability array must contain either exactly 1 element or 1 element per character in the given text!');
        }
        return zip(chars, probs).map(([c, p]) => randCheck(p) ? this.obfuscateChar(c) : c).join('');
    }
}
class CodePointInsertionObfuscator extends Obfuscator {
    constructor(cpg, minInsertions = 0, maxInsertions = 3, obfuscationProbability = 0.25) {
        super();
        this.cpg = cpg;
        this.minInsertions = minInsertions;
        this.maxInsertions = maxInsertions;
        this.obfuscationProbability = obfuscationProbability;
    }
    static CombiningDiacriticalMarks(minInsertions, maxInsertions, obfuscationProbability) {
        const cpg = CodePointGenerator.CombiningDiacriticalMarks();
        return new CodePointInsertionObfuscator(cpg, minInsertions, maxInsertions, obfuscationProbability);
    }
    obfuscateChar(char) {
        const numInsertions = randInt(this.minInsertions, this.maxInsertions);
        return char + this.cpg.generateString(numInsertions);
    }
}
CodePointInsertionObfuscator.MIN_INSERTIONS = 0;
CodePointInsertionObfuscator.MAX_INSERTIONS = 0;
CodePointInsertionObfuscator.OBFUSCATION_PROBABILITY = 0.25;
class CodePointGenerator {
    constructor(minCodePoint, maxCodePoint) {
        this.minCodePoint = minCodePoint;
        this.maxCodePoint = maxCodePoint;
    }
    static CombiningDiacriticalMarks() {
        return new CodePointGenerator(0x0300, 0x036F);
    }
    generateCodePoint() {
        return randInt(this.minCodePoint, this.maxCodePoint);
    }
    generateChar() {
        return String.fromCodePoint(this.generateCodePoint());
    }
    generateString(length) {
        return Array(length).fill(null).map(_ => this.generateChar()).join('');
    }
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
    output.innerHTML = ofc.obfuscate(input.value);
}
function obfuscateDescription() {
    const desc = document.getElementById('description');
    if (desc === null) {
        throw new Error('No element with id "description" in DOM!');
    }
    desc.innerHTML = ofc.obfuscate(desc.innerHTML);
}
const ofc = CodePointInsertionObfuscator.CombiningDiacriticalMarks();
window.onload = obfuscateDescription;
