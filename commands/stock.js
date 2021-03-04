const stonkCommand = require('./stonk')

//redirect
exports.run = async (client, message, args) => {
    stonkCommand.run(client, message, args)
}
