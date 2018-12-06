//Dependencies
const EventEmitter = require('events');
const CronJob = require('cron').CronJob;
const moment = require('moment-timezone');

let messages = require('./messages.json');

class Timed extends EventEmitter {

    constructor() {
        super();

        this.jobs = {};

        this.jobs.daily = new CronJob({
            cronTime: '0 0 * * *',
            onTick: function() {
                let day = moment(this.jobs.daily.lastDate()).tz('Asia/Tokyo').format('dddd');
                this.emit('tick', {message: messages.daily[day], event: "daily"});
            },
            timeZone: 'Asia/Tokyo',
            start: false,
            context: this
        });

        this.jobs.reminder = new CronJob({
            cronTime: '0 23 * * *',
            onTick: function() {
                let day = moment(this.jobs.daily.lastDate()).tz('Asia/Tokyo').format('dddd');
                if (day === 'Sunday') {
                    this.emit('tick', {message: messages.reminder['Sunday'], event: "reminder"});
                } else {
                    this.emit('tick', {message: messages.reminder['Normal'], event: "reminder"});
                }
            },
            timeZone: 'Asia/Tokyo',
            start: false,
            context: this
        })
    }

    start(job) {
        if (this.jobs[job]) {
            this.jobs[job].start();
            return true;
        }
        return false;
    }

    stop(job) {
        if (this.jobs[job]) {
            this.jobs[job].stop();
            return true;
        }
        return false;
    }

    status(job) {
        if (this.jobs[job]) {
            return this.jobs[job].running;
        }
        return false;
    }

}

module.exports = Timed;