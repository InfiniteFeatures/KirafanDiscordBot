//Dependencies
const EventEmitter = require('events');
const Twitter = require('twitter');
const timestamp = require('console-timestamp');
const CronJob = require('cron').CronJob;

class TwitterStream extends EventEmitter {

    constructor(auth) {
        super();

        this.twitter = new Twitter(auth);
        this.stream = null;
        this.isOn = false;

        //Reset the stream every 12 hours (at 3:00 and 15:00) because twitter is a huge shithead and disconnects without telling us
        this.timedReset = new CronJob({
            cronTime: '0 3,15 * * *',
            onTick: function() {
                this.restart();
            },
            timeZone: 'Asia/Tokyo',
            start: false,
            context: this
        })
    }

    start() {
        if (!this.isOn) {
            //Start a stream following @kirarafantasia
            this.stream = this.twitter.stream('statuses/filter', {follow: '856385582401966080'});
            this.isOn = true;

            this.stream.on('data', (event) => {
                //Whenever the stream receives any kind of data (tweets/retweets by the target, replies to the target, retweets of the target, etc.)

                //Make sure we're only handling tweets/retweets by the target
                if (event && event.text && event.user.id_str === '856385582401966080') {
                    console.log("[DD-MM-YY hh:mm] Tweet received!".timestamp);
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

                    //Embed-proof links in the tweet
                    fullText = fullText.replace(/(https:\/\/t\.co\/\w*)/g,"<$1>");

                    //Send to discord
                    this.emit('tweet',`${fullText}\n\nhttps://twitter.com/${event.user.screen_name}/status/${event.id_str}`);
                } else if (event && event.disconnect) {
                    console.log("[DD-MM-YY hh:mm] Twitter stream disconnected.".timestamp);
                    this.restart();
                }
            });

            //Because errors are bad
            this.stream.on('error', (error) => {
                console.error("[DD-MM-YY hh:mm] Twitter error:".timestamp,error);
                this.restart();
            });

            this.timedReset.start();

            console.log("[DD-MM-YY hh:mm] Twitter stream start.".timestamp);
        }
    }

    stop() {
        if (this.isOn) {
            this.stream.destroy();
            this.isOn = false;
            this.timedReset.stop();
            console.log("[DD-MM-YY hh:mm] Twitter stream stop.".timestamp);
        }
    }

    restart() {
        console.log("[DD-MM-YY hh:mm] Restarting".timestamp);
        this.stop();
        setTimeout(() => {
            this.start();
        }, 1000);
    }

}

module.exports = TwitterStream;
