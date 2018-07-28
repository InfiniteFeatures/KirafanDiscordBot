//Dependencies
const Twitter = require('twitter');

//Get oauth and token
const secret = require('./secret.json');
// secret.token contains the discord bot token.
// secret.twitter contains the twitter app oauth keys.

//Make Twitter
const twitter = new Twitter(secret.twitter);

let stream; //The twitter stream
let isOn = false;

exports.start = function() {
    if (!isOn) {
        //Start a stream following @kirarafantasia
        stream = twitter.stream('statuses/filter', {follow: '856385582401966080'});
        isOn = true;

        stream.on('data', function (event) {
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
                let channel = server.channels.get(config.get('twitter'));
                if (channel) {
                    channel.send(`${fullText}\n\nhttps://twitter.com/${event.user.screen_name}/status/${event.id_str}`);
                }
            }
        });

        //Because errors are bad
        stream.on('error', function (error) {
            console.log(error);
        });
    }
};

exports.stop = function() {
    if (isOn) {
        stream.destroy();
        isOn = false;
    }
};

exports.isOn = function() {
    return isOn;
};
