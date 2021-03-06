const stockCommand = require('../commands/stock')

//redirect
exports.run = async (client, message, args) => {
    stockCommand.run(client, message, args)
}
