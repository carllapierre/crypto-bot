const Discord = require('discord.js')
const request = require('sync-request')

const NEWS_CHANNEL = "⚡-flash-news"
const NEWS_SOURCE = "https://cryptopanic.com/api/v1/posts/?filter=important&regions=en&kind=news&public=true&auth_token="
const NEWS_PULL_INTERVAL = 10

exports.init = (client) => {
    pullNews(client)
    let timer = setInterval(function() {
        console.log('pulling news...');
        pullNews(client)
    }, 1000*60*NEWS_PULL_INTERVAL);
}

function pullNews(client) {    
    var channel = client.channels.find(c => c.name === NEWS_CHANNEL);
    if(channel)
    {
        var news = getNews()
        sendNews(channel, news);
    }
}

const getNews = () => {

    var res= request('GET',`${NEWS_SOURCE}${process.env.NWS_KEY}`)
    var json = JSON.parse(res.getBody('utf8'))

    var news = []
    json.results.forEach(element => {
        news.push({
            title:element.title,
            url:element.url,
            currencies: element.currencies
        }) 
    });

    return news;
    
}

const sendNews = async (channel, news) => {

    var messages = await channel.fetchMessages({ limit: news.length*2 });
    var messageArray = Array.from(messages.keys());
    
    var filteredNews = await Promise.all(messageArray.map( async (keys) => {

        var message  = await channel.fetchMessage(keys)

        if(message.embeds.length >=1){
            var name = message.embeds[0].title;
            var removeIndex = -1;
            for (var i = 0; i< news.length; i++)
            {    
                if(news[i].title == name){
                    removeIndex = i
                }
            }

            if(removeIndex != -1)
                news.splice(removeIndex, 1);
        }
        return news;
    }));

    embeds = formatNews(news)
    embeds.forEach(element => {
        channel.send(element)
    });

}

const formatNews = (news) => {
    
    var posts = []
    news.forEach(element => {
        
        let embed = new Discord.RichEmbed()
        embed.setColor("GREEN");

        var currency = {code: "storm", title: "General news"}
        if(element.currencies ){
            if(element.currencies > 1){
                element.currencies.forEach(coin => {
                    if(coin != "BTC")
                        currency = coin
                });
            }else{
                currency = element.currencies[0]
            }
        }

        embed.setTitle(`${element.title}`)
        embed.setURL(`${element.url}`)
        embed.attachFile(`./content/coin-images/${currency.code.toLowerCase()}.png`)
        embed.setFooter(`${currency.title} | Crypto Canada`, `attachment://${currency.code.toLowerCase()}.png`)

        posts.push(embed)
    });

    return posts;

}

