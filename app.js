//Dependencies
const Discord = require('discord.js');
const Twitter = require('twitter');

//Get config
const config = require('./config.json');
// config.prefix contains the message prefix.

//Get oauth and token
const secret = require('./secret.json');
// secret.token contains the discord bot token.
// secret.twitter contains the twitter app oauth keys.

//Variables
let discordConnect = false;     //Check if connected to discord
let twitChan;                   //The channel to post tweets in

//Make client
const client = new Discord.Client();

//Client functions
client.on("ready", () => {
    //When the bot logs in successfully.
    discordConnect = true;

    //Get the twitter channel (hardcoded)
    twitChan = client.guilds.find("name", "Kirara Fantasia").channels.find("name", "bot-testing");

    console.log(`Bot has started`);
});

client.on("message", async message => {
    //Every single message received, from any channel or DM.

    //Ignore messages from bots (including self)
    if(message.author.bot) return;

    //Ignore messages that don't start with the defined prefix
    if(message.content.indexOf(config.prefix) !== 0) return;

    //Split the command and arguments
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    //Commands here
    if (command === "") {

    }

});

//Make Twitter
const twitter = new Twitter(secret.twitter);

//Start a stream following @kirarafantasia
let stream = twitter.stream('statuses/filter', {follow: '856385582401966080'});

stream.on('data', function(event) {
    //Whenever the stream receives any kind of data (tweets/retweets by the target, replies to the target, retweets of the target, etc.)

    //Make sure we're only handling tweets/retweets by the target
    if (event && event.text && event.user.id_str === '856385582401966080' && discordConnect) {
        //Get full text
        let fullText = '';
        if (event.retweeted_status) { //If retweet, get the text fromt he original tweet
            fullText += `RT @${event.retweeted_status.user.screen_name}: `; //Manually add retweet marker

            if (event.retweeted_status.extended_tweet) {
                fullText += event.retweeted_status.extended_tweet.full_text;
            } else {
                fullText += event.retweeted_status.text;
            }
        } else {
            if (event.extended_tweet) {
                fullText = event.extended_tweet.full_text;
            } else {
                fullText = event.text;
            }
        }

        //Send to discord
        twitChan.send(`${fullText}\n\nhttps://twitter.com/${event.user.screen_name}/status/${event.id_str}`);
    }
});

//Because errors are bad
stream.on('error', function(error) {
    console.log(error);
});

//Start the bot
client.login(secret.token);
