//Dependencies
const Discord = require('discord.js');
const TwitterStream = require('./twitter.js');
const Timed = require('./timed.js');

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
    console.log(`Bot has started on server: ${server.name}`);

    //Setup twitter
    client.stream = new TwitterStream(secret.twitter);

    client.stream.on('tweet', (tweet) => {
        server.channels.get(config.get('twitterChannel')).send(tweet).catch(console.error);
    });

    client.stream.on('error', (err) => {
        console.log(err);
    });

    if (config.get('twitter') === 'on') {
        client.stream.start();
        console.log(`Twitter started on channel ${server.channels.get(config.get('twitterChannel')).name}`);
    } else {
        console.log("Twitter off");
    }

    //Setup timed events
    client.timed = new Timed();

    client.timed.on('daily', (day) => {
        let msg = "**It's a new day!**\n\nToday's daily quests are:\n";
        switch (day) {
            case 'Monday': msg += "• Moon\n• Gold";
                break;
            case 'Tuesday': msg += "• Fire";
                break;
            case 'Wednesday': msg += "• Water\n• Gold";
                break;
            case 'Thursday': msg += "• Wind";
                break;
            case 'Friday': msg += "• Gold";
                break;
            case 'Saturday': msg += "• Earth\n• Challenge Boss";
                break;
            case 'Sunday': msg += "• Sun\n Challenge Boss";
        }
        server.channels.get(config.get('mainChannel')).send(msg).catch(console.error);
    });

    client.timed.on('reminder', () => {
        let msg = "**Reminder**: Only one hour left to complete your dailies!";
        server.channels.get(config.get('mainChannel')).send(msg).catch(console.error);
    });

    if (config.get('daily') === 'on') {
        client.timed.start('daily');
        console.log("Daily announcement on");
    } else {
        console.log("Daily announcement off");
    }

    if (config.get('reminder') === 'on') {
        client.timed.start('reminder');
        console.log("Daily reminder on");
    } else {
        console.log("Daily reminder off");
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
                    message.channel.send(`Twitter stream set to channel ${message.mentions.channels.first()}`).catch(console.error);
                } else if (args[0] === "on") {
                    config.set('twitter','on');
                    client.stream.start();
                    message.channel.send(`Twitter started on channel ${server.channels.get(config.get('twitterChannel'))}`).catch(console.error);
                } else if (args[0] === "off") {
                    config.set('twitter', 'off');
                    client.stream.stop();
                    message.channel.send("Twitter stream has been turned off").catch(console.error);
                }
            } else {
                message.channel.send(`Twitter stream status: ${config.get('twitter')}`).catch(console.error);
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
                                message.channel.send(`Timed job \`${job}\` started.`).catch(console.error);
                            } else {
                                message.channel.send(`Timed job \`${job}\` does not exist.`).catch(console.error);
                            }
                        } else {
                            message.channel.send(`Timed job \`${job}\` is already running.`).catch(console.error);
                        }
                    } else if (status === 'off') {
                        if (client.timed.stop(job)) {
                            config.set(job, 'off');
                            message.channel.send(`Timed job \`${job}\` stopped.`).catch(console.error);
                        } else {
                            message.channel.send(`Timed job \`${job}\` does not exist.`).catch(console.error);
                        }
                    }
                } else {
                    message.channel.send(`Timed job \`${job}\` is ${client.timed.status(job) ? 'running' : 'not running (or might not exist)'}.`).catch(console.error);
                }
            } else {
                message.channel.send("Automatic messages sent at predefined times.").catch(console.error);
            }
        }
    }
});

//Because errors are bad
client.on("error", console.error);
client.on("warn", console.warn);

//Start the bot
client.login(secret.token).catch(console.error);
