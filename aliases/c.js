const coinCommand = require('../commands/coin')

//redirect
exports.run = async (client, message, args) => {
    coinCommand.run(client, message, args, true)
}
