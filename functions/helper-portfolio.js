const Wallet = require('../models/wallet.model');
const symbolHelper = require('./helper-symbol')
const priceHelper = require('./helper-price')
const Discord = require('discord.js')
const helper = require('./helper-color.js');
const QuickChart = require('quickchart-js');
const command = require('./helper-command')

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
        var bgColor = [];
        var totalValue = 0;
        var biggestValue = 0;
        var biggestCrypto = "";
        var colorInt = 0;

        for (let [key, value] of wallet.holding) {

            var response = await symbolHelper.getTickerInfo(key + 'USDT');        
            var cryptoPrice = response.lastPrice;

            label.push(key);
            data.push(value * cryptoPrice);
            bgColor.push(getDefinedColor(colorInt))
            colorInt++;
            if (colorInt > 9) {
                colorInt == 0;
            }
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
            type: 'outlabeledPie',
            data : {
                datasets: [{data: data, backgroundColor: bgColor}],
                labels: label,
            },
            options: {
                legend: {
                    labels: {
                        fontSize: 300,
                    }
                },
                plugins: {
                    // datalabels: {
                    //     color: '#000',
                    //     formatter: (value) => {
                    //         return value + ' %'
                    //     },
                    //     align: 'center',
                    //     font: {
                    //         size: 20,
                    //     }
                    // },
                    borderRadius: 17,
                    borderWidth: 2,
                    padding: 3,
                    "legend": false,
                    "outlabels": {
                        "text": "%l (%p)",
                        "color": "black",
                        "stretch": 35,
                        "font": {
                          "resizable": true,
                          "minSize": 16,
                          "maxSize": 20
                        }
                      }
                },
                legend: {
                    labels: {
                        fontColor: '#FFF'
                    }
                }
            }
        }).setWidth(500).setHeight(500).setBackgroundColor('transparent');
        
        embed.setImage(chart.getUrl());
        embed.addField("Your biggest contributor", `Your ${biggestCrypto} is your largest holding, representing ${biggestValue}% of your portfolio!`);
    } else {
        embed.addField("No coins?", "Add some coins to your portfolio! Try $portfolio help for more details.");
        return embed;
    }

    return embed;

}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getDefinedColor(x) {
    const colorChoices = [
        '#78bf7d',
        '#78bfb4',
        '#7883bf',
        '#b178bf',
        '#bf787f',
        '#bfae78',
        '#dbdb23',
        '#0cad95',
        '#6f59ff',
        '#cdccd9',
    ]
    return colorChoices[x];
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


exports.remove = async (message, parsed) => {

    let value = parsed.arguments[0].value;
    let crypto = parsed.arguments[1].value;
   
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
}

exports.add = async (message, parsed) => {

    let value = parsed.arguments[0].value;
    let crypto = parsed.arguments[1].value;

    const wallet = await getOrCreatePortfolio(message.author.id);
    
    if (wallet.holding.has(crypto)) {
        wallet.holding.set(crypto, Number(value) + Number(wallet.holding.get(crypto)));
    } else {
        
        wallet.holding.set(crypto, value);
    }

    wallet.save().then(() => {
        message.channel.send(command.showSuccess("Operation add was a success!", "You successfully added " + value + " " + crypto + " to your portfolio."));
    });
    
}

exports.set = async (message, parsed) => {
    
    let value = parsed.arguments[0].value;
    let crypto = parsed.arguments[1].value;

    const wallet =  await getOrCreatePortfolio(message.author.id);

    wallet.holding.set(crypto, value);
    wallet.save().then(() => {
        message.channel.send(command.showSuccess("Operation set was a success!", "You successfully set " + crypto + " to " + value + " in your portfolio."));
    });

}

exports.changeCurrencyDefault = async (message, parsed) => {

    const wallet =  await getOrCreatePortfolio(message.author.id);

    var fiat = parsed.arguments[0].value;

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