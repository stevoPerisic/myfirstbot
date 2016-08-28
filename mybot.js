require('dotenv').config();

var SlackAPIKey = process.env.SLACK_API_KEY;
var Botkit = require('botkit');

var controller = Botkit.slackbot({
  debug: true
});

// connect the bot to a stream of messages
controller.spawn({
  token: SlackAPIKey,
}).startRTM()

// give the bot something to listen for.
controller.hears('hello',['direct_message','direct_mention','mention'],function(bot,message) {

  bot.reply(message,'Hello Lana, you are the most awesome girl I know!');

});

controller.hears('Lunchables?',['direct_message','direct_mention','mention'],function(bot,message) {

  bot.reply(message,'Why sure! I love luncahbles!');

});

var http = require('http'); 
http.createServer(function (req, res) { 
    res.writeHead(200, {'Content-Type': 'text/plain'}); 
    res.end('Hello World\n');  }).listen(process.env.PORT || 5000); 