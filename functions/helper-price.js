const request = require('sync-request')

exports.getFormattedPrice = (price) => {
    if (typeof price === 'string' || price instanceof String)
        price = parseFloat(price)

    if(price >= 1)
        return Number.parseFloat(price).toFixed(2)
    return Number.parseFloat(price).toPrecision(2)
}

exports.getExchangeRate = (fiat) => {
    var res= request('GET',`https://api.exchangeratesapi.io/latest?base=USD&symbols=${fiat}`)
    var json = JSON.parse(res.getBody('utf8'))
    return json.rates[fiat];
}

//Determines if the string is a valid FIAT
exports.isSupportedFiat = (currency) => {
    const found = supportedFiats.find(element => element.fiat.toUpperCase() == currency.toUpperCase())
    if(found)
        return true
    return false
}

exports.getSupportedFiats = () => {
    return supportedFiats;
}

const supportedFiats = [
    {
        fiat: "USD",
        display: "USD"
    },
    {
        fiat: "CAD",
        display: "CAD"
    },
    {
        fiat: "HKD",
        display: "HK$"
    },
    {
        fiat: "ISK",
        display: "kr"
    },
    {
        fiat: "PHP",
        display: "₱"
    },
    {
        fiat: "DKK",
        display: "kr"
    },
    {
        fiat: "HUF",
        display: "Ft"
    },
    {
        fiat: "CZK",
        display: "Kč"
    },
    {
        fiat: "GBP",
        display: "£"
    },
    {
        fiat: "SEK",
        display: "kr"
    },
    {
        fiat: "IDR",
        display: "Rp"
    },
    {
        fiat: "INR",
        display: "₹"
    },
    {
        fiat: "BRL",
        display: "R$"
    },
    {
        fiat: "RUB",
        display: "₽"
    },
    {
        fiat: "THB",
        display: "฿"
    },
    {
        fiat: "JPY",
        display: "¥"
    },
    {
        fiat: "HRK",
        display: "kn"
    },
    {
        fiat: "CHF",
        display: "$"
    },
    {
        fiat: "EUR",
        display: "€"
    },
    {
        fiat: "MYR",
        display: "RM"
    },
    {
        fiat: "BGN",
        display: "BGN"
    },
    {
        fiat: "CNY",
        display: "¥"
    },
    {
        fiat: "NOK",
        display: "kr"
    },
    {
        fiat: "NZD",
        display: "$"
    },    
    {
        fiat: "ZAR",
        display: "R"
    },
    {
        fiat: "MXN",
        display: "Mex$"
    },
    {
        fiat: "SGD",
        display: "S$"
    },
    {
        fiat: "AUD",
        display: "AUD"
    },
    {
        fiat: "ILS",
        display: "₪"
    },
    {
        fiat: "KRW",
        display: "₩"
    },
    {
        fiat: "PLN",
        display: "zł"
    },
]