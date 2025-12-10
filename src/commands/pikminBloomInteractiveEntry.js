const { SendOptions } = require('./pikminBloomInteractive')

async function handler (msg, match, config, bot) {
    return SendOptions(bot, msg, 'decor', '/pkmi', 'New Pikmin')
}

module.exports = {
    isAdminCommand: false,
    matches: [
        /^\/pkmi/
    ],
    enableConfig: 'PikminBloom.Enabled',
    descriptions: ['pkmi - Add pikmin bloom entry interactive'],
    handler
}
