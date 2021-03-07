const Discord = require('discord.js')

const getEmbed = (obj) =>
{
    let embed = new Discord.RichEmbed()
    embed.setFooter(`${obj && obj.footer ? obj.footer + " | ":""} Powered by Crypto Canada!`)
    return embed;
}

module.exports = {getEmbed}