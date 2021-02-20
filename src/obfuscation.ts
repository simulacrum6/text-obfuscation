function randCheck(target: number) {
    return Math.random() < target
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
        const cpg = CodePointGenerator.CombiningDiacriticalMarks()
        return new CodePointInsertionObfuscator(cpg, minInsertions, maxInsertions, obfuscationProbability)
    }

    constructor(public cpg: CodePointGenerator, public minInsertions = 0, public maxInsertions = 3, public obfuscationProbability = 0.25) {
        super()
    }

    obfuscateChar(char: string): string {
        const numInsertions = randInt(this.minInsertions, this.maxInsertions)
        return char + this.cpg.generateString(numInsertions)
    }
}

class CodePointGenerator {
    static CombiningDiacriticalMarks() {
        return new CodePointGenerator(0x0300, 0x036F)
    }

    constructor(public minCodePoint: number, public maxCodePoint: number) { }

    generateCodePoint() {
        return randInt(this.minCodePoint, this.maxCodePoint)
    }

    generateChar() {
        return String.fromCodePoint(this.generateCodePoint())
    }

    generateString(length: number) {
        return Array(length).fill(null).map(_ => this.generateChar()).join('')
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