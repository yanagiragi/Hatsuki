// Post twitter static image to bypass adult contents are not able to preview

const TwitterCrawler = require('TwitterPictureDownloader').TwitterCrawler

async function ParseTweet (tweetId, csrfToken = '', authToken = '') {
    const crawler = new TwitterCrawler(null, { csrfToken, authToken })
    return crawler.FetchFromTweet(tweetId)
}

module.exports = ParseTweet

if (require.main === module) {
    (async (tweetId, csrfToken, authToken) => {
        const result = await ParseTweet(tweetId, csrfToken, authToken)
        console.log(result)
    })(process.argv[2], process.argv[3], process.argv?.[4])
}
