//Dependencies
const Discord = require('discord.js');
const TwitterStream = require('./twitter.js');

//Get configuration
const config = require('./config.js');

//Get oauth and token
const secret = require('./secret.json');
// secret.token contains the discord bot token.
// secret.twitter contains the twitter app oauth keys.

//Variables
let server;         //The Kirafan server

//Make client
const client = new Discord.Client();

//Client functions
client.on("ready", () => {
    //When the bot logs in successfully.

    //Get the kirafan server (hardcoded)
    server = client.guilds.get("431162393993936917"); //TODO: development server only
    console.log(`Bot has started on server: ${server.name}`);

    //Setup twitter
    client.stream = new TwitterStream(secret.twitter);
    client.stream.on('tweet', (tweet) => {
        server.channels.get(config.get('twitterChan')).send(tweet).catch(console.error);
    });
    client.stream.on('error', (err) => {
        console.log(err);
    });
    if (config.get('twitter') === 'on' && config.get('twitterChan') !== '') {
        client.stream.start();
        console.log(`Twitter started on channel ${server.channels.get(config.get('twitterChan')).name}`);
    } else {
        console.log("Twitter off");
    }
});

client.on("message", async message => {
    //Every single message received, from any channel or DM.

    //Ignore messages from bots (including self)
    if(message.author.bot) return;

    //Ignore messages that don't start with the defined prefix
    if(message.content.indexOf(config.get('prefix')) !== 0) return;

    //Split the command and arguments
    const args = message.content.slice(config.get('prefix').length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    ///Commands here
    if (command === "twitter") {
        if (message.member.roles.find("name", "Admin")) {
            if (args.length > 0) {
                if (message.mentions.channels.size > 0) {
                    config.set('twitterChan', message.mentions.channels.first().id);
                    message.channel.send(`Twitter stream set to channel ${message.mentions.channels.first()}`).catch(console.error);
                } else if (args[0] === "on") {
                    if (config.get('twitterChan') !== '') {
                        config.set('twitter','on');
                        client.stream.start();
                        message.channel.send(`Twitter started on channel ${server.channels.get(config.get('twitterChan'))}`).catch(console.error);
                    } else {
                        message.channel.send('Please set a channel to post tweets before starting the twitter stream.').catch(console.error);
                    }
                } else if (args[0] === "off") {
                    config.set('twitter', 'off');
                    client.stream.stop();
                    message.channel.send("Twitter stream has been turned off").catch(console.error);
                }
            } else {
                message.channel.send(`Twitter stream status: ${config.get('twitter')}`).catch(console.error);
            }
        }
    }
});

//Because errors are bad
client.on("error", console.error);
client.on("warn", console.warn);

//Start the bot
client.login(secret.token).catch(console.error);
