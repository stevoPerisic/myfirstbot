// simple mongo storage CRUD
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = process.env.MONGODB_URI;

module.exports = {
	create: function(_document){
		// Use connect method to connect to the Server 
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			console.log("Connected correctly to server");
			
			var collection = db.collection("survey_answers");
			// _document is an object
			collection.insertOne(_document, function(err, item){
				console.log(item);
			}); 

			db.close();
		});

	},
	read: function(_id){

	},
	update: function(_id){

	},
	delete: function(_id){

	}
}