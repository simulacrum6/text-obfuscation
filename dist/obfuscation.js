"use strict";
function randCheck(probability) {
    return Math.random() < probability;
}
function randChoice(a, probs) {
    if (!probs) {
        probs = Array(a.length).fill(1 / a.length);
    }
    const t = Math.random();
    const i = probs.sort(diff)
        .map(cumSum())
        .map(p => t < p)
        .indexOf(true);
    return a[i];
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
function sum(a, b) {
    return a + b;
}
function diff(a, b) {
    return a - b;
}
function cumSum(sum = 0) {
    return (value) => sum += value;
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
        const cpg = RangeCodePointGenerator.CombiningDiacriticalMarks();
        return new CodePointInsertionObfuscator(cpg, minInsertions, maxInsertions, obfuscationProbability);
    }
    static CombiningCharacters(minInsertions, maxInsertions, obfuscationProbability) {
        const cpgs = [
            RangeCodePointGenerator.CombiningDiacriticalMarks(),
            RangeCodePointGenerator.CombiningDiacriticalMarksExtended(),
            RangeCodePointGenerator.CombiningDiacriticalMarksSupplement(),
            RangeCodePointGenerator.CombiningDiacriticalMarksForSymbols(),
            RangeCodePointGenerator.CombiningHalfMarks()
        ];
        const cpg = new CombinedCodePointGenerator(cpgs);
        return new CodePointInsertionObfuscator(cpg);
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
    generateChar() {
        return String.fromCodePoint(this.generateCodePoint());
    }
    generateString(length) {
        return Array(length).fill(null).map(_ => this.generateChar()).join('');
    }
}
class RangeCodePointGenerator extends CodePointGenerator {
    constructor(minCodePoint, maxCodePoint) {
        super();
        this.minCodePoint = minCodePoint;
        this.maxCodePoint = maxCodePoint;
    }
    static CombiningDiacriticalMarks() {
        return new RangeCodePointGenerator(0x0300, 0x036F);
    }
    static CombiningDiacriticalMarksExtended() {
        return new RangeCodePointGenerator(0x1AB0, 0x1AC0);
    }
    static CombiningDiacriticalMarksSupplement() {
        return new RangeCodePointGenerator(0x1DC0, 0x1DFF);
    }
    static CombiningDiacriticalMarksForSymbols() {
        return new RangeCodePointGenerator(0x20D0, 0x20F0);
    }
    static CombiningHalfMarks() {
        return new RangeCodePointGenerator(0xFE20, 0xFE2F);
    }
    getNumberOfCodePoints() {
        return this.maxCodePoint - this.minCodePoint;
    }
    generateCodePoint() {
        return randInt(this.minCodePoint, this.maxCodePoint);
    }
}
class CombinedCodePointGenerator extends CodePointGenerator {
    constructor(cpgs, probs) {
        super();
        this.cpgs = cpgs;
        this.probs = probs;
        if (!probs) {
            const total = this.getNumberOfCodePoints();
            this.probs = cpgs.map(cpg => cpg.getNumberOfCodePoints()).map(n => n / total);
        }
    }
    getNumberOfCodePoints() {
        return this.cpgs.map(cpg => cpg.getNumberOfCodePoints()).reduce(sum);
    }
    generateCodePoint() {
        return randChoice(this.cpgs).generateCodePoint();
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
    const paragraphs = document.querySelectorAll('.description p');
    if (!paragraphs.length) {
        throw new Error('No element with id "description" in DOM!');
    }
    for (let paragraph of paragraphs) {
        paragraph.innerHTML = ofc.obfuscate(paragraph.innerHTML);
    }
}
const ofc = CodePointInsertionObfuscator.CombiningDiacriticalMarks();
window.onload = obfuscateDescription;
