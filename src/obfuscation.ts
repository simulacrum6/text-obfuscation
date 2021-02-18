function obfuscateChar(c: string) {
    const maxDiacritics = 4
    const udMin = 0x0300 // diacritics range start 
    const udMax = 0x036F // diacritics range end
    const nDiacritics = Math.floor(Math.random() * maxDiacritics + 1)
    
    const obfuscated = [c]
    for (let i = 0; i < nDiacritics; i++) {
        obfuscated.push(getRandomUnicodeChar(udMin, udMax))
    }

    return obfuscated.join('')
}

function getRandomUnicodeChar(min=0x0000, max=0xFFFF) {
    const range = max - min
    const codePoint = Math.floor(Math.random() * range) + min
    return String.fromCodePoint(codePoint)
}

function obfuscate(text: string, obfuscationProbability: number) {
    return Array.from(text)
        .map(c => Math.random() < obfuscationProbability ? obfuscateChar(c) : c)
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