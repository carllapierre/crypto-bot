const fs = require('fs')

const nodeCache = require( "node-cache" );

//PROVIDERS
const provBinance = require("./providers/crypto/provider-binance")
const provGecko   = require("./providers/crypto/provider-gecko")

//HELPERS
const helpSymbol  = require("../functions/helper-symbol")
const helpPrice   = require('../functions/helper-price')

const serviceCache = require('../services/service-cache')

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

    serviceCache.find(symbol)

    for (const [key, provider] of Object.entries(EXCHANGE_LIST)) {
        info = await provider.find(symbol)
        if(info){
            var obj = {
                ...info,
                source: key
            }
            serviceCache.save(obj.symbol, obj)
            return obj
        }
    }
}

//returns crypto info
const get = async (idens, exchange, quoteAsset) =>
{
    if(!quoteAsset)
        quoteAsset = BASE_ASSET

    var info = await EXCHANGE_LIST[exchange].get(idens, quoteAsset);

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


const getCryptoLogo = (symbol) => {

    var fullpath = `${LOGO_PATH}${symbol.toLowerCase()}.png`;

    if (fs.existsSync(fullpath)) {
        return {
            path: fullpath,
            source: "local"
        }
    }
}

const getKlineData = async (symbol, quoteAsset, interval= "1h", startTime, endTime, limit = "24") => {

    if(!quoteAsset)
        quoteAsset = BASE_ASSET

    for (const [key, provider] of Object.entries(EXCHANGE_LIST)) {
        info = await provider.getKlineInfo(symbol, quoteAsset, interval, startTime, endTime, limit);

        if(info){
            return info
        }
    }
    return info;
}

module.exports = {get, find, top, getKlineData}