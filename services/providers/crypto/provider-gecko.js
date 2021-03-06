const request = require('sync-request')

const API_ENDPOINT = "https://api.coingecko.com/api/v3"
const API_TICKER   = "/simple/price?ids=" //{symbol}
const API_TICKER_AFTER = "&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true"

exports.find = async (symbol) =>
{
    
}

exports.get = async (symbol, quoteAsset) =>
{
    var res= request('GET',`${API_ENDPOINT}${API_TICKER}${id.toLowerCase()}${API_TICKER_AFTER}`)
    var json = JSON.parse(res.getBody('utf8'))
    
    if(!json[id.toLowerCase()])
        return;
    return {

        symbol: symbol,
        quoteAsset: quoteAsset,
        percentChange: json.priceChangePercent,
        lastPrice: `${json[id.toLowerCase()].usd}`,
        volume: json.volume,
        high24: json.highPrice,
        low24: json.lowPrice

        // lastPrice: `${json[id.toLowerCase()].usd}`,
        // highPrice:"N/A",
        // lowPrice:"N/A",
        // priceChangePercent: json[id.toLowerCase()].usd_24h_change,
        // volume: `${json[id.toLowerCase()].usd_24h_vol}`
    };
    
    
}
