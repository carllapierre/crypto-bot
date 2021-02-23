const command      = require('../functions/helper-command')

exports.run = async (client, message, args) => {
    command.alertPool(message)
}
