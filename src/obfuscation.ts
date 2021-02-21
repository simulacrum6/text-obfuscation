function randCheck(probability: number) {
    return Math.random() < probability
}

function randChoice<T>(a: T[], probs?: number[]) {
    if (!probs) {
        probs = Array(a.length).fill(1 / a.length)
    }
    
    const t = Math.random()
    const i = probs.sort(diff)
        .map(cumSum())
        .map(p => t < p)
        .indexOf(true) 
    return a[i]
}

function randInt(min = 0, max = 100) {
    return Math.floor(Math.random() * (max + 1 - min)) + min
}

function zip<T, S>(a: T[], b: S[]) {
    const n = Math.max(a.length, b.length)
    const c = Array(n) as [[T, S]]
    for (let i = 0; i < n; i++) {
        c[i] = [a[i % a.length], b[i % b.length]]
    }
    return c
}

function sum(a: number, b: number) {
    return a + b
}

function diff(a: number, b: number) {
    return a - b
}

function cumSum(sum = 0) {
    return (value: number) => sum += value
}

abstract class Obfuscator {
    obfuscationProbability: number = 1.0;

    obfuscate(text: string, probs?:number[]) {
        const chars = Array.from(text)

        if (!probs) {
            probs = Array(chars.length).fill(this.obfuscationProbability)
        }
        if (probs.length === 1) {
            probs = Array(chars.length).fill(probs[0])
        }
        if (probs.length !== chars.length) {
            throw new Error('Passed probability array must contain either exactly 1 element or 1 element per character in the given text!')
        }

        return zip(chars, probs).map(([c, p]) => randCheck(p) ? this.obfuscateChar(c) : c).join('')
    }

    abstract obfuscateChar(char: string): string
}

class CodePointInsertionObfuscator extends Obfuscator {
    static MIN_INSERTIONS = 0
    static MAX_INSERTIONS = 0
    static OBFUSCATION_PROBABILITY = 0.25 

    static CombiningDiacriticalMarks(minInsertions?: number, maxInsertions?: number, obfuscationProbability?: number) {
        const cpg = RangeCodePointGenerator.CombiningDiacriticalMarks()
        return new CodePointInsertionObfuscator(cpg, minInsertions, maxInsertions, obfuscationProbability)
    }

    static CombiningCharacters(minInsertions?: number, maxInsertions?: number, obfuscationProbability?: number) {
        const cpgs = [
            RangeCodePointGenerator.CombiningDiacriticalMarks(),
            RangeCodePointGenerator.CombiningDiacriticalMarksExtended(),
            RangeCodePointGenerator.CombiningDiacriticalMarksSupplement(),
            RangeCodePointGenerator.CombiningDiacriticalMarksForSymbols(),
            RangeCodePointGenerator.CombiningHalfMarks()
        ]
        const cpg: CodePointGenerator = new CombinedCodePointGenerator(cpgs)
        return new CodePointInsertionObfuscator(cpg)
    }

    constructor(public cpg: CodePointGenerator, public minInsertions = 0, public maxInsertions = 3, public obfuscationProbability = 0.25) {
        super()
    }

    obfuscateChar(char: string): string {
        const numInsertions = randInt(this.minInsertions, this.maxInsertions)
        return char + this.cpg.generateString(numInsertions)
    }
}

abstract class CodePointGenerator {
    abstract getNumberOfCodePoints(): number
    abstract generateCodePoint(): number
    
    generateChar() {
        return String.fromCodePoint(this.generateCodePoint())
    }

    generateString(length: number) {
        return Array(length).fill(null).map(_ => this.generateChar()).join('')
    }
}

class RangeCodePointGenerator extends CodePointGenerator {
    static CombiningDiacriticalMarks() {
        return new RangeCodePointGenerator(0x0300, 0x036F)
    }

    static CombiningDiacriticalMarksExtended() {
        return new RangeCodePointGenerator(0x1AB0, 0x1AC0)
    }

    static CombiningDiacriticalMarksSupplement() {
        return new RangeCodePointGenerator(0x1DC0, 0x1DFF)
    }

    static CombiningDiacriticalMarksForSymbols() {
        return new RangeCodePointGenerator(0x20D0, 0x20F0)
    }

    static CombiningHalfMarks() {
        return new RangeCodePointGenerator(0xFE20, 0xFE2F)
    }

    constructor(public minCodePoint: number, public maxCodePoint: number) { super() }

    getNumberOfCodePoints() {
        return this.maxCodePoint - this.minCodePoint
    }

    generateCodePoint() {
        return randInt(this.minCodePoint, this.maxCodePoint)
    }
}

class CombinedCodePointGenerator extends CodePointGenerator {
    
    constructor(private cpgs: CodePointGenerator[], private probs?: number[]) {
        super()

        if (!probs) {
            const total = this.getNumberOfCodePoints()
            this.probs = cpgs.map(cpg => cpg.getNumberOfCodePoints()).map(n => n / total) 
        }
    }
    
    getNumberOfCodePoints(): number {
        return this.cpgs.map(cpg => cpg.getNumberOfCodePoints()).reduce(sum)
    }

    generateCodePoint(): number {
        return randChoice(this.cpgs).generateCodePoint()
    }
}

function obfuscateInput() {
    const input = document.getElementById('obfuscation-input') as HTMLInputElement
    const output = document.getElementById('obfuscation-output')

    if (input === null) {
        throw new Error('No element with id "obfuscation-input" in DOM!')
    }

    if (output == null) {
        throw new Error('No element with id "obfuscation-output" in DOM!')
    }

    output.innerHTML = ofc.obfuscate(input.value)
}

function obfuscateDescription() {
    const desc = document.getElementById('description')
    
    if (desc === null) {
        throw new Error('No element with id "description" in DOM!')
    }

    desc.innerHTML = ofc.obfuscate(desc.innerHTML)
}

const ofc = CodePointInsertionObfuscator.CombiningDiacriticalMarks()
window.onload = obfuscateDescription