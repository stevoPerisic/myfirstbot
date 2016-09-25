// simple mongo storage CRUD
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = process.env.MONGODB_URI;

module.exports = {
	create: function(_document){
		// creates documents in the DB
		// arguments: _document = the data to be saved
		// SO FAR IT ALL GOES INTO ONE DB NAMED survey_answers !!!

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
	read: function(_dbName, _callback){
		// reads data from the DB 
		// arguments: _dbName = name of the db you woul like to read
		// 			  _callback = function to be executed once the data has been read from the db

		MongoClient.connect(url, function(err, db) { 
			var collection = db.collection(_dbName);
			collection.find().toArray().then(function(docs){
				console.log('In the read, results are: ')
				console.log(docs);
				// return docs;
				db.close();
				_callback(docs);
				// return docs;
			});
		});
	},
	update: function(_id){
		// probably won't be updating for this demo
		// later we will use
	},
	delete: function(_id){
		// probably won't be deleting for this demo
		// later we will use
	}
}