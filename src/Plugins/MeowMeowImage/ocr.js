const fs = require('fs')
const readline = require('readline')
const { spawn } = require('child_process')

async function RunOcrBatch (items, { projectRoot }) {
    if (items.length === 0) return []

    const image = process.env.EASYOCR_IMAGE || 'easy_ocr'
    const modelDirectory = process.env.EASYOCR_MODEL_DIR || '/home/rayark/Projects/EasyOCR/bin/models'
    if (!fs.existsSync(modelDirectory)) {
        throw new Error(`EasyOCR model directory does not exist: ${modelDirectory}`)
    }

    const dockerArgs = [
        'run', '--rm', '-i',
        '-e', `OCR_VARIANTS=${process.env.OCR_VARIANTS || 'auto'}`,
        '-e', `OCR_LOW_CONFIDENCE=${process.env.OCR_LOW_CONFIDENCE || '0.20'}`,
        '-v', `${projectRoot}:/workspace/input:ro`,
        '-v', `${modelDirectory}:/workspace/models:ro`,
        image,
        'python', '/workspace/input/ocr_worker.py'
    ]
    const child = spawn('docker', dockerArgs, {
        cwd: projectRoot,
        stdio: ['pipe', 'pipe', 'pipe']
    })

    const results = []
    let stderr = ''
    child.stderr.setEncoding('utf8')
    child.stderr.on('data', chunk => {
        stderr += chunk
        process.stderr.write(chunk)
    })

    const output = readline.createInterface({ input: child.stdout })
    output.on('line', line => {
        if (!line.trim()) return
        try {
            const result = JSON.parse(line)
            results.push(result)
            console.log(`OCR ${result.path}: ${result.text || '(no text)'} [${FormatConfidence(result.confidence)}]`)
        }
        catch (error) {
            stderr += `\nUnexpected OCR output: ${line}`
        }
    })

    for (const item of items) {
        child.stdin.write(`${JSON.stringify(item)}\n`)
    }
    child.stdin.end()

    const exitCode = await new Promise((resolve, reject) => {
        child.once('error', reject)
        child.once('close', resolve)
    })
    if (exitCode !== 0) {
        throw new Error(`EasyOCR worker exited with code ${exitCode}${stderr ? `: ${stderr.trim()}` : ''}`)
    }

    const resultIds = new Set(results.map(result => result.id))
    for (const item of items) {
        if (!resultIds.has(item.id)) {
            results.push({
                id: item.id,
                path: item.path,
                text: '',
                confidence: 0,
                variant: null,
                candidates: [],
                error: 'OCR worker returned no result'
            })
        }
    }
    return results
}

function FormatConfidence (value) {
    return Number.isFinite(value) ? value.toFixed(3) : 'n/a'
}

module.exports = { RunOcrBatch }
