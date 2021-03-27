const command       = require('../functions/helper-command')

exports.run = async (client, message, args) => {


    if (message.author.id != "144598496761085952" || message.author.id != "152553227970281472") return; 

    var arg1 = command.getOption(args, 1)
    var arg2 = command.getOption(args, 2)
    var channel = client.channels.find(c => c.name === arg1);
    if(channel)
    {
        channel.send(arg2)
    }
    
}