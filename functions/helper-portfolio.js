const Wallet = require('../models/wallet.model');
const symbolHelper = require('./helper-symbol')
const priceHelper = require('./helper-price')
const Discord = require('discord.js')
const helper = require('./helper-color.js');
const QuickChart = require('quickchart-js');
const command = require('./helper-command')
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

        if (a.type == 'fiat') {
            const e = {
                name: "Fiat",
                code: 69,
                description: "Sorry, you currently can't add fiat to your portfolio."
            }
            message.channel.send(customError(e));
            return;
        }
    }

    if (valueFound && cryptoFound) {
        try {

            const wallet = await getOrCreatePortfolio(message.author.id);
            
            if (wallet.holding.has(crypto)) {
                wallet.holding.set(crypto, Number(value) + Number(wallet.holding.get(crypto)));
            } else {
                wallet.holding.set(crypto, value);
            }

            wallet.save().then(() => {
                message.channel.send(command.showSuccess("Operation add was a success!", "You successfully added " + value + " " + crypto + " to your portfolio."));
            });
        } catch (e) {
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

async function getOrCreatePortfolio(id) {

    let wallet = await Wallet.get(id);
    if(wallet)
        return wallet

    wallet = new Wallet();
    wallet.userID = id;
    wallet.holding = new Map();
    
    return await wallet.save()
}

exports.show = async (message) => {
    const wallet = await getOrCreatePortfolio(message.author.id);
    message.author.send(await getWalletEmbed(wallet));
}

exports.showPublic = async (message) => {
    const wallet = await getOrCreatePortfolio(message.author.id);
    message.channel.send(await getWalletEmbed(wallet));
}

exports.showChart = async (message) => {
    const wallet = await getOrCreatePortfolio(message.author.id);
    message.channel.send(await getWalletChartEmbed(wallet));
}

exports.delete = async (message) => {
    const wallet = await getOrCreatePortfolio(message.author.id);

    wallet.remove().then(() => {
        const embed = command.showSuccess("Delete","Your portfolio has been deleted from our database.");
        message.channel.send(embed);
    });
}


const customError = (e) => {
    let embed = new Discord.RichEmbed();
    embed.setFooter(`Powered by Crypto Canada!`);
    embed.setColor('#FF0000');
    embed.setTitle(e.name)
    embed.addField("Error code: " + e.code, e.description);
    return embed
}

const customWarning = (e) => {
    let embed = new Discord.RichEmbed();
    embed.setFooter(`Powered by Crypto Canada!`);
    embed.setColor('#ffff00');
    embed.setTitle(e.name)
    embed.addField("Error code: " + e.code, e.description);
    return embed
}

function numberWithCommas(x) {
    return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

const getWalletEmbed = async (wallet) => {

    const embed = new Discord.RichEmbed()

    embed.setColor("BLUE");
    embed.setTitle('Your portfolio!')
    embed.setFooter(`Powered by Crypto Canada!`);
            
    if (wallet.holding.size) {

        var listOfCrypto = '';
        var listOfQty = '';
        var listOfValues = '';
        var totalValue = 0;
        var currency = wallet.preferences.currency;
        const exchange = (currency !== 'USDT' ? await priceHelper.getExchangeRate(currency) : 1);

        for (let [key, value] of wallet.holding) {
            var response = await symbolHelper.getTickerInfo(key + 'USDT');
            var cryptoPrice = response.lastPrice * exchange;
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
        embed.addField(`Total Value (${currency})`, "$" + numberWithCommas(totalValue));
        
        return embed;
    } else {
        embed.addField("No coins?", "Add some coins to your portfolio! Try $portfolio help for more details.");
        return embed;
    }

}

const getWalletChartEmbed = async (wallet) => {

    const embed = new Discord.RichEmbed()

    embed.setColor("BLUE");
    embed.setTitle('Your portfolio!')
    embed.setFooter(`Powered by Crypto Canada!`);

    if (wallet.holding.size) {

        const chart = new QuickChart();

        var data = [];
        var label = [];
        var totalValue = 0;
        var biggestValue = 0;
        var biggestCrypto = "";

        for (let [key, value] of wallet.holding) {
            var response = await symbolHelper.getTickerInfo(key + 'USDT');
            var cryptoPrice = response.lastPrice;

            label.push(key);
            data.push(value * cryptoPrice);
            if (value*cryptoPrice > biggestValue) {
                biggestValue = value*cryptoPrice;
                biggestCrypto = key;
            }
            totalValue += value * cryptoPrice;
        }
        
        for (var i = 0; i < data.length; i++) {
            data[i] = Number.parseFloat(data[i]*100/totalValue).toFixed(2);
        }

        biggestValue = Number.parseFloat(biggestValue*100/totalValue).toFixed(2);

        chart.setConfig({
            type: 'pie',
            data : {
                datasets: [{data: data}],
                labels: label,
            },
            options: {
                legend: {
                    labels: {
                        fontSize: 10,
                    }
                },
                plugins: {
                    datalabels: {
                        color: '#000',
                        formatter: (value) => {
                            return value + ' %'
                        },
                        align: 'center',
                        font: {
                            size: 9,
                        }
                    }
                },
                legend: {
                    labels: {
                        fontColor: '#FFF'
                    }
                }
            }
        }).setWidth(400).setHeight(200).setBackgroundColor('transparent');
        
        embed.setImage(chart.getUrl());
        embed.addField("Your biggest contributor", `Your ${biggestCrypto} is your largest holding, representing ${biggestValue}% of your portfolio!`);
    } else {
        embed.addField("No coins?", "Add some coins to your portfolio! Try $portfolio help for more details.");
        return embed;
    }

    return embed;

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

            const wallet =  await getOrCreatePortfolio(message.author.id);
        
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

            wallet.save().then(() => {
                message.channel.send(command.showSuccess("Operation remove was a success!", "You successfully removed " + value + " " + crypto + " from your portfolio."));
            });
        } catch (e) {
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

            const wallet =  await getOrCreatePortfolio(message.author.id);
  
            wallet.holding.set(crypto, value);

            wallet.save().then(() => {
                message.channel.send(command.showSuccess("Operation set was a success!", "You successfully set " + crypto + " to " + value + " in your portfolio."));
            });
        } catch (e) {
            console.log(e)
            return;
        }
    } else {
        const e = {
            name: "Missing info!",
            code: 69,
            description: "Missing some arguments. Make sure to only have 1 number and 1 symbol."
        }
        message.channel.send(customError(e));
        return;
    }
}

exports.changeCurrencyDefault = async (message, parsed) => {

    try {

        const wallet =  await getOrCreatePortfolio(message.author.id);

        var fiatFound = false;
        var fiat = '';

        for (var i = 0; i < parsed.arguments.length; i++) {
            var a = parsed.arguments[i];
            if (a.type == 'fiat') {
                if (!fiatFound) {
                    fiat = a.value;
                    fiatFound = true;
                } else {
                    const e = {
                        name: "Fiat",
                        code: 69,
                        description: "Too many fiat were sent to the command"
                    }
                    message.channel.send(customError(e));
                    return;
                }
            }
        }
        
        if (fiatFound) {
            oldCurrency = wallet.preferences.currency;
            if (oldCurrency !== fiat) {
                wallet.preferences.currency = fiat;
                wallet.save().then(() => {
                message.channel.send(command.showSuccess("Operation add was a success!", `You changed your default currency from ${oldCurrency} to ${fiat}`));
            })
            } else {
                const e = {
                    name: "Default already set",
                    code: 69,
                    description: `Your default currency is already ${fiat}!`
                }
                message.channel.send(customWarning(e));
                return;
            }
        }

    } catch (e) {
        message.author.send(handleError(e));
    }
}