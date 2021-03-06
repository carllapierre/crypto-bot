const request = require('sync-request')

const API_ENDPOINT = "https://api.binance.com/api/v3"
const API_TICKER   = "/ticker/24hr?symbol=" //{symbol}
const API_LIST     = "https://www.binance.com/api/v1/exchangeInfo"
const BASE_ASSET = "USDT"

exports.find = async (symbol) =>
{
    var res= request('GET',`https://www.binance.com/api/v1/exchangeInfo`)
    var json = JSON.parse(res.getBody('utf8'))

    var coin = json.symbols.find(x=> x.baseAsset == symbol && x.quoteAsset == BASE_ASSET)
    if(!coin){
        coin = json.symbols.find(x=> x.baseAsset == symbol)
    }
    if(coin)
        return {
            symbol: symbol,
            id: symbol,
            quoteAsset: coin.quoteAsset
        } 
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
        high24: json.highPrice,
        low24: json.lowPrice
    };
}
