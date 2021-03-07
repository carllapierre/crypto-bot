const fs = require('fs')

//PROVIDERS
const provBinance = require("./providers/crypto/provider-binance")
const provGecko   = require("./providers/crypto/provider-gecko")

//HELPERS
const helpSymbol  = require("../functions/helper-symbol")
const helpPrice   = require('../functions/helper-price')


const EXCHANGE_LIST = {
   BINANCE : provBinance,

   GECKO   : provGecko,
}

const BASE_ASSET = "USD";
const LOGO_PATH  = "./content/coin-images/"

//returns exchange found on and quote asset
const find = async (symbol) =>
{
    symbol = helpSymbol.sanitize(symbol)

    for (const [key, provider] of Object.entries(EXCHANGE_LIST)) {
        info = await provider.find(symbol)
        if(info){
            return {
                ...info,
                source: key
            }
        }
    }
}

//returns crypto info
const get = async (id, exchange, quoteAsset) =>
{
    if(!quoteAsset)
        quoteAsset = BASE_ASSET

    var info = await EXCHANGE_LIST[exchange].get(id, quoteAsset);

    if(info)
    {
        info.lastPrice       = helpPrice.getFormattedPrice(info.lastPrice) 
        info.high24          = helpPrice.getFormattedPrice(info.high24)
        info.low24           = helpPrice.getFormattedPrice(info.low24)
        
        if(!info.logo)
        {
            logo = await getCryptoLogo(info.symbol);
            if(logo){
                info = {
                    ...info,
                    logo: logo 
                }
            }
        }
    }

    return info
}


//returns top x in market cap
const top = async (count) =>
{

}


// //returns url for 24 chart
// const get24hChart = async (symbol) =>
// {

// }

// //returns url for 24 chart
// const getMarketCap = async (symbol) =>
// {

// }

const getCryptoLogo = (symbol) => {

    var fullpath = `${LOGO_PATH}${symbol.toLowerCase()}.png`;

    if (fs.existsSync(fullpath)) {
        return {
            path: fullpath,
            source: "local"
        }
    }
}

const getKlineData = async (symbol, exchange, quoteAsset, interval, startTime, endTime, limit) => {
    if(!quoteAsset)
        quoteAsset = BASE_ASSET

    var info = await EXCHANGE_LIST[exchange].getKlineInfo(symbol, quoteAsset, interval, startTime, endTime, limit);

    return info;
}

module.exports = {get, find, top, getKlineData}