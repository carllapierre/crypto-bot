const Discord = require('discord.js')

const getEmbed = (obj) =>
{
    let embed = new Discord.RichEmbed()
    
    if(obj && obj.color)
        embed.setColor(obj.color)
    if(obj && obj.title)
        embed.setTitle(obj.title)

    embed.setFooter(`${obj && obj.footer ? obj.footer + " | ":""}Powered by Crypto Canada!`)
    return embed;
}

const getError = (error) =>
{
    var msg = "It seems I'm a dumb bot. :tired_face:"
    if(error && error != "")
        msg = error

    var embed = getEmbed();
    embed.setColor('#ffff00');
    embed.addField("Crypto bot malfunction! ",`${msg}`);

    return embed;
}

module.exports = {getEmbed, getError}