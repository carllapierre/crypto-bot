const portfolioCommand = require('./portfolio')

//redirect
exports.run = async (client, message, args) => {
    portfolioCommand.run(client, message, args)
}
