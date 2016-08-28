var SlackAPIKey = 'xoxb-72751703124-CT4J7QW4mNteQQrJua6EwvXd';
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

  bot.reply(message,'Hello Stevo.');

});