const { SendOptions } = require('./pikminBloomInteractive')

async function handler (msg, match, config, bot) {
    return SendOptions(bot, msg, 'decor', '/pkmlist', 'New Pikmin')
}

module.exports = {
    isAdminCommand: false,
    matches: [
        /^\/pkmlist/
    ],
    enableConfig: 'PikminBloom.Enabled',
    descriptions: ['pkmlist - list pikmin bloom entry'],
    handler
}
