const request = require('sync-request')

const API_ENDPOINT = "https://api.binance.com/api/v3"
const API_TICKER   = "/ticker/24hr?symbol=" //{symbol}

exports.find = async (symbol) =>
{
    var res= request('GET',`https://www.binance.com/api/v1/exchangeInfo`)
    var json = JSON.parse(res.getBody('utf8'))

    
}

exports.get = async (symbol, quoteAsset) =>
{
    //Special rule for binance since they quote in Tether
    if(quoteAsset.toUpperCase() == "USD")
        quoteAsset = "USDT"

    var res= request('GET',`${API_ENDPOINT}${API_TICKER}${symbol}${quoteAsset}`)
    var json = JSON.parse(res.getBody('utf8'))

    return {
        symbol: symbol,
        quoteAsset: quoteAsset,
        percentChange: json.priceChangePercent,
        lastPrice: json.lastPrice,
        volume: json.volume,
        high24: json.highPrice,
        low24: json.lowPrice
    };
}
