const request = require('sync-request')

const API_ENDPOINT = "https://api.coingecko.com/api/v3"
const API_TICKER   = "/coins/" //{id}
const API_TICKER_AFTER = "?localization=false&community_data=false&developer_data=false"
const API_LIST     = "/coins/list"

exports.find = async (symbol) =>
{
    var res= request('GET',`${API_ENDPOINT}${API_LIST}`)
    var json = JSON.parse(res.getBody('utf8'))
    var coin = json.find(x=>x.symbol.toLowerCase() == symbol.toLowerCase())

    if(coin)
        return {
            id: coin.id,
            quoteAsset: "usd"
        } 
}

exports.get = async (id, quoteAsset) =>
{
    var res= request('GET',`${API_ENDPOINT}${API_TICKER}${id.toLowerCase()}${API_TICKER_AFTER}`)
    var json = JSON.parse(res.getBody('utf8'))
    
    if(!json.symbol)
        return;

    var lowerQuote = quoteAsset.toLowerCase()

    return {
        symbol: json.symbol.toUpperCase(),
        quoteAsset: quoteAsset,
        percentChange: `${json.market_data.price_change_percentage_24h}`,
        high24:        `${json.market_data.high_24h[lowerQuote]}`,
        low24:         `${json.market_data.low_24h[lowerQuote]}`,
        lastPrice:     `${json.market_data.current_price[lowerQuote]}`,
        logo: {
            path: json.image.small,
            source: "web"
        }
    };
}
