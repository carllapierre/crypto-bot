const newService  = require('../services/service-news')

module.exports = (client) => {
    client.user.setActivity('$coin', { type: 'WATCHING' })
    newService.init(client)
}