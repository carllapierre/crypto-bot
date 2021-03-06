const fs = require('fs')

//PROVIDERS
const provBinance = require("./providers/crypto/provider-binance")
const provGecko   = require("./providers/crypto/provider-gecko")

//HELPERS
const helpSymbol  = require("../functions/helper-symbol")

const EXCHANGE_LIST = {
   GECKO   : provGecko,
   BINANCE : provBinance,
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
                exchange: key
            }
        }
    }
}

//returns crypto info
const get = async (id, exchange, quoteAsset) =>
{
    if(!quoteAsset)
        quoteAsset = BASE_ASSET

    id = helpSymbol.sanitize(id)

    var info = await EXCHANGE_LIST[exchange].get(id, quoteAsset);
    if(info && !info.logo)
    {
        logo = await getCryptoLogo(info.symbol);

        if(logo){
            info = {
                ...info,
                logo: logo 
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

module.exports = {get, find, top}