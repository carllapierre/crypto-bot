const Wallet = require('../models/wallet.model');
const symbolHelper = require('../functions/helper-symbol')
const priceHelper = require('../functions/helper-price')
const Discord = require('discord.js')
const helper = require('./colorHelp.js');

exports.add = async (message, parsed) => {

    let valueFound = false;
    let cryptoFound = false;
    let value = 0;
    let crypto = '';

    for (var i = 0; i < parsed.arguments.length; i++) {
        var a = parsed.arguments[i];
        if (a.type == 'number') {
            if (valueFound) {
                const e = {
                    name: "Values",
                    code: 69,
                    description: "Too many values were sent to the command"
                }
                message.channel.send(customError(e));
                return;
            } else {
                valueFound = true;
                value = a.value; 
            }
        }
        if (a.type == 'crypto') {
            if (cryptoFound) {
                const e = {
                    name: "Crypto Symbols",
                    code: 69,
                    description: "Too many crypto symbols were sent to the command"
                }
                message.channel.send(customError(e));
                return;
            } else {
                cryptoFound = true;
                crypto = a.value;
            }
        }
    }

    if (valueFound && cryptoFound) {
        try {

            const wallet = await Wallet.get(message.author.id);
            
            if (wallet) {
                if (wallet.holding.has(crypto)) {
                    wallet.holding.set(crypto, Number(value) + Number(wallet.holding.get(crypto)));
                } else {
                    wallet.holding.set(crypto, value);
                }
            } else {
                message.channel.send(missingWallet());
            }
            wallet.save().then(() => {
                message.channel.send(genericSuccess("Operation add was a success!", "You successfully added " + value + " " + crypto + " to your wallet."));
            });
        } catch (e) {
            message.channel.send(missingWallet());
        }
    } else {
        const e = {
            name: "Missing info!",
            code: 69,
            description: "Missing some arguments. Make sure to only have 1 number and 1 symbol."
        }
        message.channel.send(customError(e));
    }
    
}

exports.create = async (message, parsed) => {

    try {

        const wallet = new Wallet();
        wallet.userID = message.author.id;
        wallet.holding = new Map();
        
        await wallet.save().then(() => {
            const embed = genericSuccess("Your wallet was created, let's add some coins!","Check out $wallet help for more details");
            message.channel.send(embed);
        })

    } catch (e) {
        message.channel.send(handleError(e));
    }

}

exports.show = async (message) => {
    try {

        const wallet = await Wallet.get(message.author.id);

        if (wallet) {
            message.author.send(await getWalletEmbed(wallet));
        } else {
            message.author.send(missingWallet());
        }

    } catch (e) {
        message.author.send(handleError(e));
    }
}

exports.showPublic = async (message) => {
    try {
        
        const wallet = await Wallet.get(message.author.id);

        if (wallet) {
            message.channel.send(await getWalletEmbed(wallet));
        } else {
            message.channel.send(missingWallet());
        }

    } catch (e) {
        message.channel.send(handleError(e));
    }
}

exports.delete = async (message) => {
    try {
        const wallet = await Wallet.get(message.author.id);
        if (wallet) {
            wallet.remove().then(() => {
                const embed = genericSuccess("Delete","Your wallet has been deleted from our database.");
                message.channel.send(embed);
            });
        } else {
            message.channel.send(missingWallet());
        }
    } catch (e) {
        message.channel.send(handleError(e));
    }
}

const missingWallet = () => {

    let embed = new Discord.RichEmbed();
    embed.setColor('#FFFF00');
    embed.setTitle('Your info are missing.')
    embed.addField("Hmm, we can't find a wallet tagged to your account.", "Have you tried creating one yet? Try $wallet help for more details.");
    embed.setFooter(`Powered by Crypto Canada!`);
    return embed

}

const handleError= (error) => {

    let embed = new Discord.RichEmbed();
    embed.setFooter(`Powered by Crypto Canada!`);
    embed.setColor('#FF0000');

    if (error.name === 'MongoError' && error.code === 11000) {
        embed.setTitle('Duplicate user')
        embed.addField("User already in database", "Wallet already exists.");
        return embed
    } else {
        embed.setTitle(error.code)
        embed.addField("Error code: " + error.code, "Sorry, an error has occured.");
        return embed
    }

};

const customError = (e) => {
    let embed = new Discord.RichEmbed();
    embed.setFooter(`Powered by Crypto Canada!`);
    embed.setColor('#FF0000');
    embed.setTitle(e.name)
    embed.addField("Error code: " + e.code, e.description);
    return embed
}

function numberWithCommas(x) {
    return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

const genericSuccess = (title, message) => {

    const embed = new Discord.RichEmbed()

    embed.setColor("GREEN");
    embed.setTitle('Success!');
    embed.addField(title, message);
    embed.setFooter(`Powered by Crypto Canada!`);

    return embed;
}

const getWalletEmbed = async (wallet) => {

    const embed = new Discord.RichEmbed()

    embed.setColor("BLUE");
    embed.setTitle('Your Wallet!')
    embed.setFooter(`Powered by Crypto Canada!`);
            
    if (wallet.holding.size) {

        var listOfCrypto = '';
        var listOfQty = '';
        var listOfValues = '';
        var totalValue = 0;

        for (let [key, value] of wallet.holding) {
            var response = await symbolHelper.getTickerInfo(key + 'USDT');
            var cryptoPrice = response.lastPrice;
            var change24h = response.priceChangePercent;
            var color = "";
            if (change24h >= 0) {
                color = "cyan";
            } else {
                color = "yellow";
            }
            listOfCrypto = listOfCrypto + '\n' + helper.changeColor(key, 'default');
            listOfQty = listOfQty + '\n' + helper.changeColor(value, 'default');
            var text = (priceHelper.getFormattedPrice(value * cryptoPrice)) + (change24h > 0 ? " (+":" (") + Number.parseFloat(change24h).toFixed(2) + "%) ";
            listOfValues = listOfValues + '\n' + helper.changeColor(text, color);
            totalValue += value * cryptoPrice; 
        }

        totalValue = priceHelper.getFormattedPrice(totalValue)
                        
        embed.addField("Assets     -", listOfCrypto, true);
        embed.addField("Qty     -", listOfQty, true);
        embed.addField("Value\xa0\xa0\xa0\xa0\xa0(% Change 24h)", listOfValues, true);
        embed.addField("Total Value (USD)", "$" + numberWithCommas(totalValue));
        
        return embed;
    } else {
        embed.addField("No coins?", "Add some coins to your wallet! Try $wallet help for more details.");
        return embed;
    }

}

exports.remove = async (message, parsed) => {

    let valueFound = false;
    let cryptoFound = false;
    let value = 0;
    let crypto = '';

    for (var i = 0; i < parsed.arguments.length; i++) {
        var a = parsed.arguments[i];
        if (a.type == 'number') {
            if (valueFound) {
                const e = {
                    name: "Values",
                    code: 69,
                    description: "Too many values were sent to the command"
                }
                message.channel.send(customError(e));
                return;
            } else {
                valueFound = true;
                value = a.value; 
            }
        }
        if (a.type == 'crypto') {
            if (cryptoFound) {
                const e = {
                    name: "Crypto Symbols",
                    code: 69,
                    description: "Too many crypto symbols were sent to the command"
                }
                message.channel.send(customError(e));
                return;
            } else {
                cryptoFound = true;
                crypto = a.value;
            }
        }
    }

    if (valueFound && cryptoFound) {
        try {

            const wallet = await Wallet.get(message.author.id);
            
            if (wallet) {
                if (wallet.holding.has(crypto)) {
                    wallet.holding.set(crypto, Number(wallet.holding.get(crypto)) - Number(value));
                    if (Number(wallet.holding.get(crypto)) <= 0) {
                        wallet.holding.delete(crypto);
                    }
                } else {
                    const e = {
                        name: "You don't have this crypto",
                        code: 69,
                        description: "Cannot remove crypto you don't have!"
                    }
                    message.channel.send(customError(e));
                    return;
                }
            } else {
                message.channel.send(missingWallet());
                return;
            }
            wallet.save().then(() => {
                message.channel.send(genericSuccess("Operation remove was a success!", "You successfully removed " + value + " " + crypto + " to your wallet."));
            });
        } catch (e) {
            message.channel.send(missingWallet());
        }
    } else {
        const e = {
            name: "Missing info!",
            code: 69,
            description: "Missing some arguments. Make sure to only have 1 number and 1 symbol."
        }
        message.channel.send(customError(e));
    }
    
}

exports.set = async (message, parsed) => {

    let valueFound = false;
    let cryptoFound = false;
    let value = 0;
    let crypto = '';

    for (var i = 0; i < parsed.arguments.length; i++) {
        var a = parsed.arguments[i];
        if (a.type == 'number') {
            if (valueFound) {
                const e = {
                    name: "Values",
                    code: 69,
                    description: "Too many values were sent to the command"
                }
                message.channel.send(customError(e));
                return;
            } else {
                valueFound = true;
                value = a.value; 
            }
        }
        if (a.type == 'crypto') {
            if (cryptoFound) {
                const e = {
                    name: "Crypto Symbols",
                    code: 69,
                    description: "Too many crypto symbols were sent to the command"
                }
                message.channel.send(customError(e));
                return;
            } else {
                cryptoFound = true;
                crypto = a.value;
            }
        }
    }

    if (valueFound && cryptoFound) {
        try {

            const wallet = await Wallet.get(message.author.id);
            
            if (wallet) {
                wallet.holding.set(crypto, value);
            } else {
                message.channel.send(missingWallet());
            }
            wallet.save().then(() => {
                message.channel.send(genericSuccess("Operation set was a success!", "You successfully set " + crypto + " to " + value + "in your wallet."));
            });
        } catch (e) {
            message.channel.send(missingWallet());
            return;
        }
    } else {
        const e = {
            name: "Missing info!",
            code: 69,
            description: "Missing some arguments. Make sure to only have 1 number and 1 symbol."
        }
        message.channel.send(customError(e));
    }
}