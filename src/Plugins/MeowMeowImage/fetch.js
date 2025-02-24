const fetch = require('node-fetch')
const cheerio = require('cheerio')
const child_process = require('child_process')
const fs = require('fs')

const url = process.argv[2]
const resp = await fetch(url)
const content = await resp.text()
const $ = cheerio.load(content)
const images = $('.FnStickerList .FnImage span')

const folder = $('.mdCMN38Item0lHead').text().trim()

const result = []
for (let i = 0; i < images.length; ++i) {
    const image = images[i]
    const style = $(image).attr('style')
    const src = style.replace('background-image:url(', '').replace(');', '')
    const filename = `${i}.png`

    if (fs.existsSync(filename)) {
        continue
    }

    let command = `mkdir -p "${folder}"`
    command += `; curl ${src} -o "${filename}"`
    command += `; cp "${filename}" "/tmp/${i}.png"`
    command += `; ocr "/tmp/${i}.png"`

    const rawOcrOutput = child_process.execSync(command)
    try {
        const ocrResult = JSON.parse(rawOcrOutput)
        result.push({
            filename,
            text: ocrResult.text
        })
        console.log(`${filename} parsed. Result = ${ocrResult.text}`)
    }
    catch (err) {
        result.push({
            filename,
            text: ''
        })
        console.log(`Unable to parse ${src}`)
    }
}

const output = JSON.stringify(result, null, 4)
fs.writeFileSync(`${folder}/result.json`, output)