/* Backend server
 *
 * TODO allow profile pictures
 */

var express = require('express');
var bodyParser = require('body-parser'); // Allows the ability to recieve posts from front end
var parser = bodyParser.urlencoded({extended: false});
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var ejs = require('ejs');

var app = express();

app.set('view engine','ejs');

var db_location = 'mongodb://localhost:27017/test';
//var post_db_location = 'mongodb://localhost:27017/post';

var path = require('path');
var fs = require('fs');

var loggedIn = false;

var data = {};
var postData = {};
var username;
var password;

app.use(express.static(__dirname + '/public'));

// Posts from page to db
app.post('/home', parser, function(req, res) {

    if (req.body.post != '') {

      req.body.username = data.username;

      var insertDocument = function(db, callback) {
          db.collection('post').insertOne(req.body, function(err, result) {
              callback();
              res.redirect('/home');
          });
      }

      MongoClient.connect(db_location, function(err, db) {
          insertDocument(db, function() {
              db.close();
          });
      });
    } else {
      res.redirect('/home');
    }
});

// Home Page
app.get('/home', function(req, res) {
    if (loggedIn) {
        // Recieves posts
        var sendPosts = function(db, callback) {
            var pointer = db.collection('post').find().toArray(function(err, docs) {
                //postdat = docs.post;
                postData = [];
                var size = Object.keys(docs).length;
                for(x = 0; x < size; x++) {
                    postData[x] = docs[x].username + ": " + docs[x].post;
                }

                res.render('home', {info: data, post: postData});
            });
        }

        MongoClient.connect(db_location, function(err, db) {
            sendPosts(db);
            db.close();
        });
    }
});

app.post('/register', parser, function(req, res) {

    username = req.body.username;
    password = req.body.password;

    var insertDocument = function(db, callback) {
        db.collection('test').insertOne(req.body, function(err, result) {
            // Close db
            callback();
            // Go to login page
            loggedIn = true;

            data = {username: username, password: password};

            res.redirect('/home');
        });
    }

    MongoClient.connect(db_location, function(err, db) {
       insertDocument(db, function() {
           db.close();
       });
    });
});

// Register Page
app.get('/register', function(req, res) {
    res.sendFile(__dirname + '/html/register.html');
});

app.get('/profile', function(req, res) {
   if (loggedIn) {
       res.render('profile', {info: data});
   } else {
       res.redirect('/');
   }
});

// Checks username and password from login page
app.post('/', parser, function(req, res) {

    username = req.body.username;
    password = req.body.password;

    var findUser = function(db, callback) {

        var pointer = db.collection('test').find(req.body).toArray(function(err, array) {
            if (array.length == 0) {
                res.redirect('/');
            } else {
                loggedIn = true;
                data = {username: username, password: password};
                //res.sendFile(__dirname + '/html/home.html');
                res.redirect('/home');
                //res.redirect('/home');
            }

        });
    }

    MongoClient.connect(db_location, function(err, db) {
        findUser(db);
        db.close();
    });

    //res.sendFile(__dirname + '/html/home.html');

});

// Login Page (technically root)
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/html/login.html');
});

app.listen(8000);
