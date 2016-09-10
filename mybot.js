require('dotenv').config();

var SlackAPIKey = process.env.SLACK_API_KEY;
var token = process.env.FB_VERIFY_TOKEN; //'<YOUR TOKEN HERE>';
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
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

	controller.hears('Lunchables?',['direct_message','direct_mention','mention'],function(bot,message) {

	  bot.reply(message,'Why sure! I love luncahbles!');

	});

/*******************************/
// Facebook Bot
/*******************************/
	// this function processes the POST request to the webhook

	//var handler = require('./lib/fb_handler').FBhandler;

	app.get('/webhook', function (req, res) {
		// This enables subscription to the webhooks
		if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.FACEBOOK_VERIFY_TOKEN) {
			res.send(req.query['hub.challenge'])
		}
		else {
			res.send('Incorrect verify token')
		}
	});

	var jsonParser = bodyParser.json();
	app.post('/webhook', jsonParser, function (req, res) {
		// console.log('FB REQUEST')
		// console.log(req)
		// handler(req.body)

		res.send('ok')
	});

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

	console.log('botkit')

	// this is triggered when a user clicks the send-to-messenger plugin
	controllerFB.on('facebook_optin', function (bot, message) {
	  	bot.reply(message, 'Welcome, friend')
	});

	controllerFB.hears(['hello', 'hi'], 'message_received', function(bot, message) {
		bot.reply(message, 'Hello.');
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









