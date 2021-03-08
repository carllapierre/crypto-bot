const binanceProvider = require('../services/providers/crypto/provider-binance')
const priceHelper   = require('../functions/helper-price')
const Discord = require('discord.js')

const TICKER_PULL_INTERVAL_SEC = 4

exports.init = (token, symbol) => {

    if(!token)
        return

    const client = new Discord.Client()
    client.login(token)

    client.on('ready', () => { 
        refreshTicker(client, symbol)
        setInterval(function() {
            refreshTicker(client, symbol)
        }, 1000*TICKER_PULL_INTERVAL_SEC);
    });

}

function refreshTicker(client, symbol) {    

    binanceProvider.get(symbol, "USDT").then((info)=>{
        if(info){
            var price = priceHelper.getFormattedPrice(info.lastPrice)
            client.user.setActivity('$'+ price, { type: 'WATCHING' })
        }
    });
 
}