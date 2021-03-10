const command       = require('../functions/helper-command')

exports.run = async (client, message, args) => {
    if (message.member.roles.find(role => role.name.toLowerCase() === 'admin')){
        var arg1 = command.getOption(args, 1)
        var arg2 = command.getOption(args, 2)
        var channel = client.channels.find(c => c.name === arg1);
        if(channel)
        {
            channel.send(arg2)
        }
    }
}