const cryptoService     = require('../services/service-crypto');
const chartService      = require('../services/service-chart');
const outputService     = require('../services/service-output');

exports.create = async (message, parsed) => {

    var timeArgument;
    var crypto;
    var timeInterval;
    var limit;

    for (var i = 0; i < parsed.arguments.length; i++) {
        if (parsed.arguments[i].type === "timeInterval")
            timeArgument = parsed.arguments[i];
        if (parsed.arguments[i].type === "crypto")
            crypto = parsed.arguments[i];
    }

    switch(timeArgument.value[timeArgument.value.length-1]) {
        case 'h':
            timeInterval = "1h";
            break;
        case 'd':
            timeInterval = "1d";
            break;
        case 'm':
            timeInterval = "1m";
            break;
        case 's':
            timeInterval = "easteregg";
            break;
        default:
            timeInterval = "1d";
    }

    var slice = timeArgument.value.slice(0, timeArgument.value.length - 1);
    limit = parseInt(slice);

    var line = [];
    var bar = [];
    var labels = [];
    var output = outputService.getEmbed();

    if (timeInterval === "easteregg") {
        message.channel.send("Nobody needs to know price changes by seconds... Why are you so addicted?");
        message.channel.send('https://tenor.com/view/stop-it-get-some-help-gif-7929301');
        return;
    }

    var res = await cryptoService.getKlineData(crypto.value, crypto.source, crypto.quoteAsset, timeInterval, undefined, undefined, limit);

    if (res) {
        for (var i = 0; i < res.length; i++) {
            line.push(res[i].closePrice);
            bar.push(res[i].volume);
            switch (timeInterval) {
                case '1h':
                    labels.push(formatSingleEntry(res[i].closeTime.getDate()) + ' - ' + formatSingleEntry(res[i].closeTime.getHours()) + ":00");
                    break;
                case '1d':
                    labels.push(formatDate(res[i].closeTime));
                    break;
                case '1m':
                    labels.push(formatSingleEntry(res[i].closeTime.getHours()) + ":" + formatSingleEntry(res[i].closeTime.getMinutes()));
                    break;
                default:
                    labels.push(formatSingleEntry(res[i].closeTime.getDate()) + ' - ' + formatSingleEntry(res[i].closeTime.getHours()) + ":00");
            }
        }
        var chart = await chartService.lineBarGraph(line, bar, labels, `Price (in ${crypto.quoteAsset})`, "Volume", "#269398", undefined, `Price of ${crypto.value} with intervals of ${timeInterval} (UTC-London)`);
        output.setImage(await chart.getShortUrl());
        message.channel.send(output);
    } else {
        output.setColor('#ffff00');
        output.addField("Error",`Sorry, there was a problem searching for ${crypto.value}`);
        output.setImage('https://cdn.discordapp.com/attachments/814697936113500223/818281855924961280/graph.png');
        message.channel.send(output);
    }
    
}

function formatDate(date) {
    
    month = '' + (date.getMonth() + 1),
    day = '' + date.getDate(),
    year = date.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
    return [year, month, day].join('-');
}

function formatSingleEntry(day) {
    day = day.toString();
    if (day.length < 2){
        day = '0' + day;
    }
    return day;
}