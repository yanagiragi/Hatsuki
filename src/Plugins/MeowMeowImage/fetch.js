const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const { RunOcrBatch } = require('./ocr')

const pluginRoot = __dirname
const storageRoot = path.join(pluginRoot, 'Storage')

async function Run () {
    const args = process.argv.slice(2)
    const flags = new Set(args.filter(arg => arg.startsWith('--')))
    const url = args.find(arg => !arg.startsWith('--'))
    if (!url) {
        throw new Error('Usage: node fetch.js <LINE sticker URL> [--force-ocr] [--retry-empty]')
    }

    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Unable to fetch ${url}: HTTP ${response.status}`)
    }

    const $ = cheerio.load(await response.text())
    const folder = SanitizeFolderName($('.mdCMN38Item0lHead').text().trim())
    if (!folder) {
        throw new Error('Unable to find the sticker pack title on this page')
    }

    const imageUrls = $('.FnStickerList .FnImage span')
        .map((index, image) => ExtractImageUrl($(image).attr('style'), url))
        .get()
        .filter(Boolean)
    if (imageUrls.length === 0) {
        throw new Error('Unable to find sticker images; the LINE page layout may have changed')
    }

    const folderPath = path.join(storageRoot, folder)
    fs.mkdirSync(folderPath, { recursive: true })
    const existingRows = ReadJsonArray(path.join(folderPath, 'result.json'))
    const existingByFilename = new Map()
    for (const row of existingRows) {
        if (row && typeof row.filename === 'string' && typeof row.text === 'string') {
            existingByFilename.set(path.basename(row.filename), row.text)
        }
    }

    const items = []
    for (const [index, imageUrl] of imageUrls.entries()) {
        const filename = `${index}.png`
        const absoluteFilename = path.join(folderPath, filename)
        if (!fs.existsSync(absoluteFilename)) {
            await Download(imageUrl, absoluteFilename)
            console.log(`Downloaded ${folder}/${filename}`)
        }
        items.push({
            id: String(index),
            filename,
            relativePath: path.posix.join('Storage', folder, filename),
            previousText: existingByFilename.get(filename)
        })
    }

    const forceOcr = flags.has('--force-ocr')
    const retryEmpty = flags.has('--retry-empty')
    const pending = items.filter(item => {
        if (forceOcr) return true
        if (item.previousText === undefined) return true
        return retryEmpty && item.previousText.trim() === ''
    })

    let ocrById = new Map()
    if (pending.length > 0) {
        console.log(`Running OCR for ${pending.length} of ${items.length} stickers...`)
        const ocrResults = await RunOcrBatch(
            pending.map(({ id, relativePath }) => ({ id, path: relativePath })),
            { projectRoot: pluginRoot }
        )
        ocrById = new Map(ocrResults.map(result => [result.id, result]))
    }

    const result = items.map(item => ({
        filename: item.filename,
        text: NormalizeText(ocrById.get(item.id)?.text ?? item.previousText ?? '')
    }))
    WriteJsonAtomic(path.join(folderPath, 'result.json'), result)

    const emptyCount = result.filter(row => row.text === '').length
    console.log(`Wrote ${result.length} unique rows to Storage/${folder}/result.json (${emptyCount} empty)`)
}

function SanitizeFolderName (value) {
    return value.replace(/[\\/\0:]/g, '_').trim()
}

function ExtractImageUrl (style, pageUrl) {
    const match = style?.match(/background-image\s*:\s*url\((['"]?)(.*?)\1\)/i)
    if (!match) return null
    return new URL(match[2], pageUrl).href
}

async function Download (imageUrl, destination) {
    const response = await fetch(imageUrl)
    if (!response.ok) {
        throw new Error(`Unable to download ${imageUrl}: HTTP ${response.status}`)
    }
    const temporary = `${destination}.part`
    fs.writeFileSync(temporary, await response.buffer())
    fs.renameSync(temporary, destination)
}

function ReadJsonArray (filename) {
    if (!fs.existsSync(filename)) return []
    const parsed = JSON.parse(fs.readFileSync(filename, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
}

function NormalizeText (value) {
    return String(value)
        .normalize('NFKC')
        .replace(/\s+/g, ' ')
        .replace(/\s+([，。！？、；：,.!?;:])/g, '$1')
        .trim()
}

function WriteJsonAtomic (filename, value) {
    const temporary = `${filename}.tmp`
    fs.writeFileSync(temporary, `${JSON.stringify(value, null, 4)}\n`)
    fs.renameSync(temporary, filename)
}

Run().catch(error => {
    console.error(error)
    process.exitCode = 1
})
