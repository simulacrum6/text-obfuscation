function randCheck(target: number) {
    return Math.random() < target
}

function randInt(min=0, max=100) {
    return Math.floor(Math.random() * (max + 1 - min)) + min
}

function obfuscateChar(char: string, minObfuscations = 0, maxObfuscations = 4) {
    const minCodePoint = 0x0300 // diacritics range start 
    const maxCodePoint = 0x036F // diacritics range end
    const numObfuscations = randInt(minObfuscations, maxObfuscations)
    
    const obfuscated = [char]
    for (let i = 0; i < numObfuscations; i++) {
        const diacritic = String.fromCodePoint(randInt(minCodePoint, maxCodePoint))
        obfuscated.push(diacritic)
    }

    return obfuscated.join('')
}

function obfuscate(text: string, obfuscationProbability: number) {
    return Array.from(text)
        .map(c => randCheck(obfuscationProbability) ? obfuscateChar(c) : c)
        .join('')
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

    output.innerHTML = obfuscate(input.value, 0.33)
}

function obfuscateDescription() {
    const desc = document.getElementById('description')
    
    if (desc === null) {
        throw new Error('No element with id "description" in DOM!')
    }

    desc.innerHTML = obfuscate(desc.innerHTML, 0.25)
}

window.onload = obfuscateDescription