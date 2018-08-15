//Dependencies
const Discord = require('discord.js');
const TwitterStream = require('./twitter.js');
const Timed = require('./timed.js');
const timestamp = require('console-timestamp');

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
    server = client.guilds.get("335416588175933440");
    client.log(`Bot has started on server: ${server.name}`);

    //Setup twitter
    client.stream = new TwitterStream(secret.twitter);

    client.stream.on('tweet', (tweet) => {
        server.channels.get(config.get('twitterChannel')).send(tweet).catch(client.error);
    });

    if (config.get('twitter') === 'on') {
        client.stream.start();
        client.log(`Twitter started on channel ${server.channels.get(config.get('twitterChannel')).name}`);
    } else {
        client.log("Twitter off");
    }

    //Setup timed events
    client.timed = new Timed();

    client.timed.on('tick', (message) => {
        server.channels.get(config.get('mainChannel')).send(message).catch(client.error);
    });

    if (config.get('daily') === 'on') {
        client.timed.start('daily');
        client.log("Daily announcement on");
    } else {
        client.log("Daily announcement off");
    }

    if (config.get('reminder') === 'on') {
        client.timed.start('reminder');
        client.log("Daily reminder on");
    } else {
        client.log("Daily reminder off");
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
                    config.set('twitterChannel', message.mentions.channels.first().id);
                    message.channel.send(`Twitter stream set to channel ${message.mentions.channels.first()}`).catch(client.error);
                } else if (args[0] === "on") {
                    config.set('twitter','on');
                    client.stream.start();
                    message.channel.send(`Twitter started on channel ${server.channels.get(config.get('twitterChannel'))}`).catch(client.error);
                } else if (args[0] === "off") {
                    config.set('twitter', 'off');
                    client.stream.stop();
                    message.channel.send("Twitter stream has been turned off").catch(client.error);
                }
            } else {
                message.channel.send(`Twitter stream status: ${config.get('twitter')}`).catch(client.error);
            }
        }
    } else if (command === "timed") {
        if (message.member.roles.find("name", "Admin")) {
            let [job, status] = args;
            if (job) {
                if (status) {
                    if (status === 'on') {
                        if (!client.timed.status(job)) {
                            if (client.timed.start(job)) {
                                config.set(job, 'on');
                                message.channel.send(`Timed job \`${job}\` started.`).catch(client.error);
                            } else {
                                message.channel.send(`Timed job \`${job}\` does not exist.`).catch(client.error);
                            }
                        } else {
                            message.channel.send(`Timed job \`${job}\` is already running.`).catch(client.error);
                        }
                    } else if (status === 'off') {
                        if (client.timed.stop(job)) {
                            config.set(job, 'off');
                            message.channel.send(`Timed job \`${job}\` stopped.`).catch(client.error);
                        } else {
                            message.channel.send(`Timed job \`${job}\` does not exist.`).catch(client.error);
                        }
                    }
                } else {
                    message.channel.send(`Timed job \`${job}\` is ${client.timed.status(job) ? 'running' : 'not running (or might not exist)'}.`).catch(client.error);
                }
            } else {
                message.channel.send("Automatic messages sent at predefined times.").catch(client.error);
            }
        }
    } else if (command === "channel") {
        if (message.member.roles.find("name", "Admin")) {
            if (args.length > 0) {
                if (message.mentions.channels.size > 0) {
                    config.set('mainChannel', message.mentions.channels.first().id);
                    message.channel.send(`Default channel set to ${message.mentions.channels.first()}`).catch(client.error);
                }
            } else {
                message.channel.send(`Current default channel: ${server.channels.get(config.get('mainChannel'))}`).catch(client.error);
            }
        }
    }
});

client.log = function(msg) {
    console.log("[DD-MM-YY hh:mm]".timestamp,msg);
};

client.error = function(error) {
    console.error("[DD-MM-YY hh:mm] Discord error:".timestamp,error);
};

client.warn = function(warn) {
    console.warn("[DD-MM-YY hh:mm] Discord warning:".timestamp,warn);
};

//Because errors are bad
client.on("error", client.error);
client.on("warn", client.warn);

//Start the bot
client.login(secret.token).catch(client.error);
