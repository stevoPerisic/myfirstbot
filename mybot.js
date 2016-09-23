require('dotenv').config();

var SlackAPIKey = process.env.SLACK_API_KEY;
var token = process.env.FB_VERIFY_TOKEN; //'<YOUR TOKEN HERE>';
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var request = require('request');
var Botkit = require('botkit');

var builtinPhrases = require('./builtins');


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

	controller.hears(['question me'],['direct_message'], function(bot,message) {
		console.log('HEARD question me.......');
		console.log(message);
		// start a conversation to handle this response.
		bot.startConversation(message,function(err,convo) {
			console.log('convo started');

			convo.ask('How are you?',function(response,convo) {

				convo.say('Cool, you said: ' + response.text);
				convo.next();

			});

		});

	});

	// controller.hears('Lunchables?',['direct_message','direct_mention','mention'],function(bot,message) {
	//   bot.reply(message,'Why sure! I love luncahbles!');
	// });

	// reply to any incoming message
	// controller.on('message_received', function(bot, message) {
	//     bot.reply(message, 'I heard... something!');
	// });

	// reply to a direct mention - @bot hello
	// controller.on('direct_mention',function(bot,message) {
	//   // reply to _message_ by using the _bot_ object
	//   bot.reply(message,'I heard you mention me!');
	// });

	// // reply to a direct message
	// controller.on('direct_message',function(bot,message) {
	//   // reply to _message_ by using the _bot_ object
	//   bot.reply(message,'You are talking directly to me');
	// });

	// controller.on('ambient',function(bot,message) {

	//     // do something...

	//     // then respond with a message object
	//     //
	//     // bot.reply(message,{
	//     //   text: "A more complex response",
	//     //   username: "ReplyBot",
	//     //   icon_emoji: ":dash:",
	//     // });

	// 	var reply_with_attachments = {
	// 	    'username': 'My bot' ,
	// 	    'text': 'This is a pre-text',
	// 	    'attachments': [
	// 	      {
	// 	        'fallback': 'To be useful, I need you to invite me in a channel.',
	// 	        'title': 'How can I help you?',
	// 	        'text': 'To be useful, I need you to invite me in a channel ',
	// 	        'color': '#7CD197'
	// 	      }
	// 	    ],
	// 	    'icon_url': 'http://lorempixel.com/48/48'
	// 	    }

	// 	  bot.reply(message, reply_with_attachments);

	// });

	//Using attachments
	// controller.hears('test',['direct_message','direct_mention'],function(bot,message) {
	//   var reply_with_attachments = {
	//     'username': 'My bot' ,
	//     'text': 'This is a pre-text',
	//     'attachments': [
	//       {
	//         'fallback': 'To be useful, I need you to invite me in a channel.',
	//         'title': 'How can I help you?',
	//         'text': 'To be useful, I need you to invite me in a channel ',
	//         'color': '#7CD197'
	//       }
	//     ],
	//     'icon_url': 'http://lorempixel.com/48/48'
	//     }

	//   bot.reply(message, reply_with_attachments);
	// });

/*******************************/
// Facebook Bot
/*******************************/
	// this function processes the POST request to the webhook
	// this to handles FB messaging
	var handler = require('./lib/fb_handler');
	handler.controllerFB = Botkit.facebookbot({
	    debug: true,
	    access_token: process.env.FB_PAGE_ACCESS_TOKEN,
	    verify_token: process.env.FB_VERIFY_TOKEN
	});
	var bot = handler.controllerFB.spawn({});

	app.get('/webhook', function (req, res) {
		// This enables subscription to the webhooks
		if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.FACEBOOK_VERIFY_TOKEN) {
			res.send(req.query['hub.challenge'])
		}
		else {
			res.send('Incorrect verify token')
		}
	});

	app.post('/webhook', jsonParser, function (req, res) {
		// console.log('FB REQUEST')
		// console.log(req)
		handler.FBhandler(req.body, bot)

		res.send('ok')
	});

	// subscribe to page events
	request.post('https://graph.facebook.com/me/subscribed_apps?access_token=' + process.env.FB_PAGE_ACCESS_TOKEN,
	  function (err, res, body) {
	    if (err) {
	      handler.controllerFB.log('Could not subscribe to page messages')
	    }
	    else {
	      handler.controllerFB.log('Successfully subscribed to Facebook events:', body)
	      console.log('Botkit activated')

	      // start ticking to send conversation messages
	      handler.controllerFB.startTicking()
	    }
	  }
	);

	console.log('botkit');

	// this is triggered when a user clicks the send-to-messenger plugin
	handler.controllerFB.on('facebook_optin', function (bot, message) {
	  	bot.reply(message, 'Welcome, friend')
	});

	// handler.controllerFB.hears(['hello', 'hi'], 'message_received', function(bot, message) {
	// 	bot.reply(message, 'Hello.');
	// });

	// try out the quick replies
	// this could be the survey questions
	handler.controllerFB.hears(['test survey'], 'message_received', function (bot, message) {
	  	bot.reply({
	    	"text":"Pick a color:",
		    "quick_replies":[
		      {
		        "content_type":"text",
		        "title":"Red",
		        "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
		      },
		      {
		        "content_type":"text",
		        "title":"Green",
		        "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
		      }
		    ]
		});
	});

	// listen for the phrase `shirt` and reply back with structured messages
	// containing images, links and action buttons
	handler.controllerFB.hears(['shirt'],'message_received',function(bot, message) {
		bot.reply(message, {
			attachment: {
				'type':'template',
				'payload':{
					'template_type':'generic',
					'elements':[
					{
						'title':'Classic White T-Shirt',
						'image_url':'http://petersapparel.parseapp.com/img/item100-thumb.png',
						'subtitle':'Soft white cotton t-shirt is back in style',
						'buttons':[
						{
							'type':'web_url',
							'url':'https://petersapparel.parseapp.com/view_item?item_id=100',
							'title':'View Item'
						},
						{
							'type':'web_url',
							'url':'https://petersapparel.parseapp.com/buy_item?item_id=100',
							'title':'Buy Item'
						},
						{
							'type':'postback',
							'title':'Bookmark Item',
							'payload':'USER_DEFINED_PAYLOAD_FOR_ITEM100'
						}
						]
					},
					{
						'title':'Classic Grey T-Shirt',
						'image_url':'http://petersapparel.parseapp.com/img/item101-thumb.png',
						'subtitle':'Soft gray cotton t-shirt is back in style',
						'buttons':[
						{
							'type':'web_url',
							'url':'https://petersapparel.parseapp.com/view_item?item_id=101',
							'title':'View Item'
						},
						{
							'type':'web_url',
							'url':'https://petersapparel.parseapp.com/buy_item?item_id=101',
							'title':'Buy Item'
						},
						{
							'type':'postback',
							'title':'Bookmark Item',
							'payload':'USER_DEFINED_PAYLOAD_FOR_ITEM101'
						}
						]
					}
					]
				}
			}
		});
	});


/*******************************/
// Twillio Bot
/*******************************/
	// creds needed
	// var TW_acct_SID = process.env.TW_ACCT_SID;
	// var TW_auth_token = process.env.TW_AUTH_TOKEN;
	// var TW_API_key = process.env.TW_API_KEY;
	// var TW_service_SID = process.env.TW_SERVICE_SID;
	// var TW_API_secret = process.env.TW_API_SECRET;









