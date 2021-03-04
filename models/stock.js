const request = require('sync-request')
const AV_KEY = process.env.ALPHAVANTAGE_KEY;

class Stock {

    constructor(json) {

        if (json["Global Quote"]){
            
            this.symbol = json["Global Quote"]["01. symbol"];
            this.open = json["Global Quote"]["02. open"];
            this.high = json["Global Quote"]["03. high"];
            this.low = json["Global Quote"]["04. low"];
            this.price = json["Global Quote"]["05. price"];
            this.volume = json["Global Quote"]["06. volume"];
            this.latestTradingDay = json["Global Quote"]["07. latest trading day"];
            this.previousClose = json["Global Quote"]["08. previous close"];
            this.change = json["Global Quote"]["09. change"];
            this.changePercentage = json["Global Quote"]["10. change percent"];

        }
    }

    async populateData(symbol) {

        var res= await request('GET',`https://www.alphavantage.co/query`, {
            qs: {
                'function': "SYMBOL_SEARCH",
                "keywords": symbol,
                "apikey": AV_KEY,
                "datatype": "json",
            }
        });
        
        var json = JSON.parse(res.getBody('utf8'))
        var arr = json.bestMatches;
        var bestMatchScore = 0;

        for (var i = 0; i < arr.length; i++) {
            var result = arr[i];
            if (result["9. matchScore"] > bestMatchScore) {
                this.name = result["2. name"];
                this.type = result["3. type"];
                this.region = result["4. region"];
                this.marketOpen = result["5. marketOpen"];
                this.marketClose = result["6. marketClose"];
                this.timezone = result["7. timezone"];
                this.currency = result["8. currency"];
                this.matchScore = result["9. matchScore"];
                bestMatchScore = this.matchScore;
            }
        }
    }
}

module.exports = Stock;