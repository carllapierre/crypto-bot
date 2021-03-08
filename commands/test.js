const test = require('../services/providers/crypto/provider-binance');
const test2 = require('../services/service-chart');

exports.run = async (client, message, args) => {
    var res = await test.getKlineInfo('ADA', 'usd', '1h', undefined, undefined, 100);

    var line = [];
    var bar = [];
    var labels = [];

    for (var i = 0; i < res.length; i++) {
        line.push(res[i].openPrice);
        bar.push(res[i].numberOfTrades);
        labels.push(res[i].openTime.getHours());
    }

    var chart = await test2.lineBarGraph(line, bar, labels, "Price", "Trades QTY", "#269398", undefined, `Price of ADA with interval of 1 hour`);

}
