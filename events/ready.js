const newService  = require('../services/service-news')

module.exports = (client) => {
    client.user.setActivity('$pool', { type: 'WATCHING' })
    newService.init(client)
}