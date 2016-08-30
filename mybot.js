require('dotenv').config();

var SlackAPIKey = process.env.SLACK_API_KEY;
var token = process.env.FB_VERIFY_TOKEN; //'<YOUR TOKEN HERE>';
var express = require('express');
var app = express();
// var bodyParser = require('body-parser');
var request = require('request');
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


app.get('/', function (req, res) {
  res.send('Hello world');
});

app.listen((process.env.PORT || 5000), function () {
  console.log('Listening on port 5000');
});

/*** FACEBOOK BOT ********/
// respond to facebook's verification
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === token) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

var controllerFB = Botkit.facebookbot({
    debug: true,
    access_token: process.env.FB_PAGE_ACCESS_TOKEN,
    verify_token: process.env.FB_VERIFY_TOKEN,
});
// var bot = controllerFB.spawn({
// });

// controllerFB.setupWebserver(process.env.port || 5000, function(err, webserver) {
//     controllerFB.createWebhookEndpoints(webserver, bot, function() {
//         console.log('ONLINE!');
//         // if(ops.lt) {
//             var tunnel = localtunnel(process.env.port || 5000, {subdomain: ops.ltsubdomain}, function(err, tunnel) {
//                 if (err) {
//                     console.log(err);
//                     process.exit();
//                 }
//                 console.log("Your bot is available on the web at the following URL: " + tunnel.url + '/facebook/receive');
//             });

//             tunnel.on('close', function() {
//                 console.log("Your bot is no longer available on the web at the localtunnnel.me URL.");
//                 process.exit();
//             });
//         //}
//     });
// });

controllerFB.hears(['hello', 'hi'], 'message_received', function(bot, message) {
    controllerFB.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

// respond to post calls from facebook
// app.post('/webhook/', function (req, res) {
// 	console.log(req);
//   var messaging_events = req.body.entry[0].messaging;
//   for (i = 0; i < messaging_events.length; i++) {
//     var event = req.body.entry[0].messaging[i];
//     var sender = event.sender.id;
//     if (event.message && event.message.text) {
//       var incomingText = event.message.text;
//       console.log('You sent the message', incomingText);
//       sendTextMessage(sender, "Text received, echo: "+ incomingText.substring(0, 200));
//     }
//   }
//   res.sendStatus(200);
// });

// function sendTextMessage(sender, text) {
//   var access_token = process.env.FB_PAGE_ACCESS_TOKEN;
//   var messageData = {
//     text:text
//   }
//   request({
//     url: 'https://graph.facebook.com/v2.6/me/messages',
//     qs: {access_token:access_token},
//     method: 'POST',
//     json: {
//       recipient: {id:sender},
//       message: messageData,
//     }
//   }, function(error, response, body) {
//     if (error) {
//       console.log('Error sending message: ', error);
//     } else if (response.body.error) {
//       console.log('Error: ', response.body.error);
//     }
//   });
// }