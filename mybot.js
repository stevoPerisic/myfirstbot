require('dotenv').config();

var SlackAPIKey = process.env.SLACK_API_KEY;
var token = process.env.FB_VERIFY_TOKEN; //'<YOUR TOKEN HERE>';
var express = require('express');
var app = express();
// var bodyParser = require('body-parser');
var request = require('request');
var Botkit = require('botkit');

/*******************************/
// Express server
/*******************************/
	app.get('/', function (req, res) {
	  res.send('Hello world');
	});

	app.listen((process.env.PORT || 5000), function () {
	  console.log('Listening on port 5000');
	});

/*******************************/
// Slack Bot
/*******************************/
	// var controller = Botkit.slackbot({
	//   debug: true
	// });

	// // connect the bot to a stream of messages
	// controller.spawn({
	//   token: SlackAPIKey,
	// }).startRTM()

	// // give the bot something to listen for.
	// controller.hears('hello',['direct_message','direct_mention','mention'],function(bot,message) {

	//   bot.reply(message,'Hello Lana, you are the most awesome girl I know!');

	// });

	// controller.hears('Lunchables?',['direct_message','direct_mention','mention'],function(bot,message) {

	//   bot.reply(message,'Why sure! I love luncahbles!');

	// });

/*******************************/
// Facebook Bot
/*******************************/
	// this function processes the POST request to the webhook
	var handler = function (obj) {
	  controllerFB.debug('GOT A MESSAGE HOOK')
	  var message
	  if (obj.entry) {
	    for (var e = 0; e < obj.entry.length; e++) {
	      for (var m = 0; m < obj.entry[e].messaging.length; m++) {
	        var facebook_message = obj.entry[e].messaging[m]

	        console.log(facebook_message)

	        // normal message
	        if (facebook_message.message) {
	          message = {
	            text: facebook_message.message.text,
	            user: facebook_message.sender.id,
	            channel: facebook_message.sender.id,
	            timestamp: facebook_message.timestamp,
	            seq: facebook_message.message.seq,
	            mid: facebook_message.message.mid,
	            attachments: facebook_message.message.attachments
	          }

	          // save if user comes from m.me adress or Facebook search
	          create_user_if_new(facebook_message.sender.id, facebook_message.timestamp)

	          controllerFB.receiveMessage(bot, message)
	        }
	        // clicks on a postback action in an attachment
	        else if (facebook_message.postback) {
	          // trigger BOTH a facebook_postback event
	          // and a normal message received event.
	          // this allows developers to receive postbacks as part of a conversation.
	          message = {
	            payload: facebook_message.postback.payload,
	            user: facebook_message.sender.id,
	            channel: facebook_message.sender.id,
	            timestamp: facebook_message.timestamp
	          }

	          controllerFB.trigger('facebook_postback', [bot, message])

	          message = {
	            text: facebook_message.postback.payload,
	            user: facebook_message.sender.id,
	            channel: facebook_message.sender.id,
	            timestamp: facebook_message.timestamp
	          }

	          controllerFB.receiveMessage(bot, message)
	        }
	        // When a user clicks on "Send to Messenger"
	        else if (facebook_message.optin) {
	          message = {
	            optin: facebook_message.optin,
	            user: facebook_message.sender.id,
	            channel: facebook_message.sender.id,
	            timestamp: facebook_message.timestamp
	          }

	            // save if user comes from "Send to Messenger"
	          create_user_if_new(facebook_message.sender.id, facebook_message.timestamp)

	          controllerFB.trigger('facebook_optin', [bot, message])
	        }
	        // message delivered callback
	        else if (facebook_message.delivery) {
	          message = {
	            optin: facebook_message.delivery,
	            user: facebook_message.sender.id,
	            channel: facebook_message.sender.id,
	            timestamp: facebook_message.timestamp
	          }

	          controllerFB.trigger('message_delivered', [bot, message])
	        }
	        else {
	          controllerFB.log('Got an unexpected message from Facebook: ', facebook_message)
	        }
	      }
	    }
	  }
	}

	// app.get('/webhook', function (req, res) {
	// 	// This enables subscription to the webhooks
	// 	if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.FACEBOOK_VERIFY_TOKEN) {
	// 		res.send(req.query['hub.challenge'])
	// 	}
	// 	else {
	// 		res.send('Incorrect verify token')
	// 	}
	// });

	// app.post('/webhook', function (req, res) {
	// 	console.log('FB REQUEST')
	// 	console.log(req)
	// 	handler(req.body)
	// 	res.send('ok')
	// });
	
	// respond to facebook's verification
	// app.get('/webhook/', function (req, res) {
	//   if (req.query['hub.verify_token'] === token) {
	//     res.send(req.query['hub.challenge']);
	//   } else {
	//     res.send('Error, wrong validation token');
	//   }
	// });

	var controllerFB = Botkit.facebookbot({
	    debug: true,
	    access_token: process.env.FB_PAGE_ACCESS_TOKEN,
	    verify_token: process.env.FB_VERIFY_TOKEN
	});

	var bot = controllerFB.spawn({});

	// subscribe to page events
	request.post('https://graph.facebook.com/me/subscribed_apps?access_token=' + process.env.FB_PAGE_ACCESS_TOKEN,
	  function (err, res, body) {
	    if (err) {
	      controllerFB.log('Could not subscribe to page messages')
	    }
	    else {
	      controllerFB.log('Successfully subscribed to Facebook events:', body)
	      console.log('Botkit activated')

	      // start ticking to send conversation messages
	      controllerFB.startTicking()
	    }
	  }
	);

	// controllerFB.createWebhookEndpoints(app, bot, function() {
	// 	console.log('This bot is online!!!');
	// });

	controllerFB.setupWebserver(process.env.port,function(err,webserver) {
		controllerFB.createWebhookEndpoints(controllerFB.webserver, bot, function() {
			console.log('This bot is online!!!');
		});
	});

	console.log('botkit')

	// this is triggered when a user clicks the send-to-messenger plugin
	controllerFB.on('facebook_optin', function (bot, message) {
	  bot.reply(message, 'Welcome, friend')
	});

	controllerFB.hears(['hello', 'hi'], 'message_received', function(bot, message) {
		bot.reply(message, 'Hello.');
	});


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