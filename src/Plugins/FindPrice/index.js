// find least price between toranoana, melonbooks and mandarake

const { SearchMelonbooks, SearchMandarake, SearchToranoana } = require('./crawler')

async function FindPrice(title) {
    const mandarakeResults = await SearchMandarake(title)
    const melonbooksResults = await SearchMelonbooks(title)
    const toranoanaResults = await SearchToranoana(title)

    let results = [mandarakeResults, melonbooksResults, toranoanaResults].filter(x => x != null)
    results = results.sort((a, b) => a.price - b.price)

    const outputStr = results.reduce((acc, ele) => {
        return `${acc}\n${ele.title}\nLink: ${ele.href}\nPrice: ${ele.price}\nStock: ${ele.stat}\n\n`
    }, '').trim()

    return outputStr
}

module.exports = FindPrice

if (require.main === module) {
    (async title => {
        const result = await FindPrice(title)
        console.log(result)
    })(process.argv[2])
}