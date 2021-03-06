const fs = require('fs')

//PROVIDERS
const provBinance = require("./providers/crypto/provider-binance")
const provGecko   = require("./providers/crypto/provider-gecko")

//HELPERS
const helpSymbol  = require("../functions/helper-symbol")

const EXCHANGE_LIST = {
   BINANCE : provBinance,
   GECKO   : provGecko
}

const BASE_ASSET = "USD";
const LOGO_PATH  = "./content/coin-images/"

//returns exchange found on and quote asset
const find = async (symbol) =>
{
    symbol = helpSymbol.sanitize(symbol)
    for (const [key, exchange] of Object.entries(EXCHANGE_LIST)) {
        info = exchange.find(symbol)
        if(info){
            info = {...info, exchange: key}
            break
        }
    }
    return info
}

//returns crypto info
const get = async (symbol, exchange, quoteAsset) =>
{
    if(!quoteAsset)
        quoteAsset = BASE_ASSET

    symbol = helpSymbol.sanitize(symbol)
    var info = await EXCHANGE_LIST[exchange].get(symbol, quoteAsset);
    if(info)
    {
        info = {
            ...info,
            logo: getCryptoLogo(symbol)
        }
    }
    return info
}

// //returns url for 24 chart
// const get24hChart = async (symbol) =>
// {

// }

// //returns url for 24 chart
// const getMarketCap = async (symbol) =>
// {

// }

const getCryptoLogo = async (symbol) => {

    var fullpath = `${LOGO_PATH}${symbol.toLowerCase()}.png`;
    fs.stat(fullpath , function(err, stat) {
        console.log(err)
        if(!err) {
            return {
                path: fullpath,
                source: "local"
            }
        } else{
            // file does not exist
            return {
                path: null,
                source: null
            }
        }
    });
}

module.exports = {get, find}