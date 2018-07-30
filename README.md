# KirafanDiscordBot
Bot for the Kirara Fantasia discord

**I will not add stupid features**  
**Discuss additions on discord, don't make random pull requests** (except if it's a fix)


## Current commands

### Admin only

#### `+twitter [on/off | channel]`
Turns the twitter stream on or off.  
If a channel is passed instead, it sets the channel in which tweets are posted.

#### `+timed [job [on/off]]`
Controls the automated messages.  
Currently available: `daily` and `reminder`

* `daily` sends a message at the start of each day (JST) to announce the daily quests.
* `reminder` sends a message at 23:00 JST to remind people to finish their daily missions.

Example usage:
```javascript
+timed daily        //Returns whether 'daily' is running or not
+timed reminder off //Turns off 'reminder'
```

#### `+channel [channel]`
Sets the default posting channel for the bot.
