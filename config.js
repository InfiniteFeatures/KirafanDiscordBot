//Dependencies
const fs = require('fs');

//Read configurations
let config = require('./config.json');

//Set a parameter
exports.set = function(prop, val) {
    //Set the actual property first
    config[prop] = val;

    //Make it into a string
    let json = JSON.stringify(config);

    //Write it to file for reload time
    fs.writeFile('config.json', json, 'utf8', (err) => {
        if (err) { console.log(err); }
    });
};

//Get a parameter
exports.get = function(prop) {
    return config[prop] ? config[prop] : '';
};